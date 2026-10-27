import { useEffect, useRef, useState, type FormEvent } from 'react'
import { usePresentation } from '../../../app/providers/PresentationContext'
import { Button } from '../../../shared/components/Button'
import {
  browserMockBridge,
  type NativeBridge,
} from '../../../shared/services/nativeBridge'
import { DEMO_AUTH_CONFIG } from '../config/demoAuth'
import { normalizeOtp, validateMobilePhone, type PhoneValidationError } from '../model/authValidation'
import { demoOtpService, type OtpService } from '../services/demoOtpService'
import { authCopy } from './authCopy'

type AuthOperation = 'idle' | 'requesting' | 'verifying' | 'resending' | 'success'
type BridgeOperation = 'idle' | 'photo' | 'location'
type Feedback = { kind: 'success' | 'error'; message: string } | null

type LoginExperienceProps = {
  otpService?: OtpService
  nativeBridge?: NativeBridge
}

export function LoginExperience({
  otpService = demoOtpService,
  nativeBridge = browserMockBridge,
}: LoginExperienceProps) {
  const { isAppMode, language } = usePresentation()
  const copy = authCopy[language]
  const mountedRef = useRef(true)
  const [phone, setPhone] = useState('')
  const [verifiedPhone, setVerifiedPhone] = useState('')
  const [phoneError, setPhoneError] = useState<PhoneValidationError | null>(null)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [authOperation, setAuthOperation] = useState<AuthOperation>('idle')
  const [authFeedback, setAuthFeedback] = useState<Feedback>(null)
  const [bridgeOperation, setBridgeOperation] = useState<BridgeOperation>('idle')
  const [bridgeFeedback, setBridgeFeedback] = useState<Feedback>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const isOtpStep = Boolean(verifiedPhone)
  const isAuthBusy = ['requesting', 'verifying', 'resending'].includes(authOperation)

  const handlePhoneSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = validateMobilePhone(phone)
    if (!result.valid) {
      setPhoneError(result.error)
      return
    }

    setPhoneError(null)
    setAuthFeedback(null)
    setAuthOperation('requesting')
    try {
      await otpService.requestCode(result.normalizedPhone)
      if (!mountedRef.current) return
      setPhone(result.normalizedPhone)
      setVerifiedPhone(result.normalizedPhone)
      setAuthOperation('idle')
      setAuthFeedback({ kind: 'success', message: copy.codeSent })
    } catch {
      if (!mountedRef.current) return
      setAuthOperation('idle')
      setPhoneError(null)
      setAuthFeedback({ kind: 'error', message: copy.serviceError })
    }
  }

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedOtp = normalizeOtp(otp)
    if (normalizedOtp.length !== DEMO_AUTH_CONFIG.codeLength) {
      setOtpError(copy.invalidOtp)
      return
    }

    setOtpError(null)
    setAuthFeedback(null)
    setAuthOperation('verifying')
    try {
      const accepted = await otpService.verifyCode(verifiedPhone, normalizedOtp)
      if (!mountedRef.current) return
      if (!accepted) {
        setAuthOperation('idle')
        setOtpError(copy.invalidOtp)
        return
      }
      setAuthOperation('success')
      setAuthFeedback({ kind: 'success', message: copy.success })
    } catch {
      if (!mountedRef.current) return
      setAuthOperation('idle')
      setAuthFeedback({ kind: 'error', message: copy.serviceError })
    }
  }

  const handleResend = async () => {
    setOtpError(null)
    setAuthFeedback(null)
    setAuthOperation('resending')
    try {
      await otpService.requestCode(verifiedPhone)
      if (!mountedRef.current) return
      setAuthOperation('idle')
      setAuthFeedback({ kind: 'success', message: copy.resent })
    } catch {
      if (!mountedRef.current) return
      setAuthOperation('idle')
      setAuthFeedback({ kind: 'error', message: copy.serviceError })
    }
  }

  const handleChangePhone = () => {
    setVerifiedPhone('')
    setOtp('')
    setOtpError(null)
    setAuthFeedback(null)
    setAuthOperation('idle')
  }

  const runBridgeAction = async (action: Exclude<BridgeOperation, 'idle'>) => {
    setBridgeFeedback(null)
    setBridgeOperation(action)
    try {
      if (action === 'photo') {
        const result = await nativeBridge.capturePhoto()
        if (mountedRef.current) {
          setBridgeFeedback({ kind: 'success', message: copy.photoSuccess(result.fileName) })
        }
      } else {
        const result = await nativeBridge.getLocation()
        if (mountedRef.current) {
          setBridgeFeedback({ kind: 'success', message: copy.locationSuccess(result.latitude, result.longitude) })
        }
      }
    } catch {
      if (mountedRef.current) {
        setBridgeFeedback({ kind: 'error', message: copy.bridgeError })
      }
    } finally {
      if (mountedRef.current) setBridgeOperation('idle')
    }
  }

  return (
    <section
      aria-labelledby="login-title"
      className={`auth-page${isAppMode ? ' auth-page--app' : ''}`}
      data-testid="auth-page"
    >
      <header className="auth-page__intro">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="login-title">{copy.title}</h1>
        <p>{copy.description}</p>
      </header>

      <div className="auth-page__layout">
        <article className="auth-card auth-card--login">
          <div className="auth-demo-notice">
            <strong>{copy.demoNoticeTitle}</strong>
            <p>{copy.demoNotice}</p>
          </div>

          {!isOtpStep ? (
            <form aria-busy={authOperation === 'requesting'} noValidate onSubmit={handlePhoneSubmit}>
              <h2>{copy.phoneHeading}</h2>
              <div className={`auth-field${phoneError ? ' auth-field--invalid' : ''}`}>
                <label htmlFor="auth-phone">{copy.phoneLabel}</label>
                <input
                  aria-describedby={`auth-phone-hint${phoneError ? ' auth-phone-error' : ''}`}
                  aria-invalid={Boolean(phoneError)}
                  autoComplete="tel"
                  dir="ltr"
                  id="auth-phone"
                  inputMode="tel"
                  name="phone"
                  onChange={(event) => {
                    setPhone(event.target.value)
                    if (phoneError) setPhoneError(null)
                  }}
                  placeholder={copy.phonePlaceholder}
                  required
                  type="tel"
                  value={phone}
                />
                <small id="auth-phone-hint">{copy.phoneHint}</small>
                {phoneError && <p id="auth-phone-error" role="alert">{copy.phoneErrors[phoneError]}</p>}
              </div>
              <Button className="auth-card__primary" disabled={isAuthBusy} type="submit">
                {authOperation === 'requesting' ? copy.sending : copy.sendCode}
              </Button>
            </form>
          ) : (
            <form aria-busy={isAuthBusy} noValidate onSubmit={handleOtpSubmit}>
              <h2>{authOperation === 'success' ? copy.successTitle : copy.otpHeading}</h2>
              <p className="auth-card__step-description" dir="auto">{copy.otpDescription(verifiedPhone)}</p>
              {authOperation !== 'success' && (
                <>
                  <div className={`auth-field${otpError ? ' auth-field--invalid' : ''}`}>
                    <label htmlFor="auth-otp">{copy.otpLabel}</label>
                    <input
                      aria-describedby={`auth-otp-hint${otpError ? ' auth-otp-error' : ''}`}
                      aria-invalid={Boolean(otpError)}
                      autoComplete="one-time-code"
                      dir="ltr"
                      id="auth-otp"
                      inputMode="numeric"
                      maxLength={DEMO_AUTH_CONFIG.codeLength}
                      name="otp"
                      onChange={(event) => {
                        setOtp(normalizeOtp(event.target.value).slice(0, DEMO_AUTH_CONFIG.codeLength))
                        if (otpError) setOtpError(null)
                      }}
                      required
                      value={otp}
                    />
                    <small id="auth-otp-hint">{copy.otpHint}</small>
                    {otpError && <p id="auth-otp-error" role="alert">{otpError}</p>}
                  </div>
                  <Button className="auth-card__primary" disabled={isAuthBusy} type="submit">
                    {authOperation === 'verifying' ? copy.verifying : copy.verify}
                  </Button>
                </>
              )}
              <div className="auth-card__secondary-actions">
                {authOperation !== 'success' && (
                  <Button disabled={isAuthBusy} onClick={() => void handleResend()} type="button" variant="secondary">
                    {authOperation === 'resending' ? copy.resending : copy.resend}
                  </Button>
                )}
                <Button disabled={isAuthBusy} onClick={handleChangePhone} type="button" variant="secondary">
                  {copy.changePhone}
                </Button>
              </div>
            </form>
          )}

          <div aria-live="polite" className="auth-feedback">
            {authFeedback && (
              <p className={`auth-feedback__message auth-feedback__message--${authFeedback.kind}`} role={authFeedback.kind === 'error' ? 'alert' : 'status'}>
                {authFeedback.message}
              </p>
            )}
          </div>
        </article>

        <aside className="auth-card auth-card--bridge" aria-labelledby="native-bridge-title">
          <div className="auth-card__heading">
            <div>
              <span>{copy.simulatedBadge}</span>
              <h2 id="native-bridge-title">{copy.bridgeHeading}</h2>
            </div>
            <p>{copy.bridgeDescription}</p>
          </div>
          <div className="native-actions">
            <Button disabled={bridgeOperation !== 'idle'} onClick={() => void runBridgeAction('photo')} type="button" variant="secondary">
              {bridgeOperation === 'photo' ? copy.capturingPhoto : copy.capturePhoto}
            </Button>
            <Button disabled={bridgeOperation !== 'idle'} onClick={() => void runBridgeAction('location')} type="button" variant="secondary">
              {bridgeOperation === 'location' ? copy.locating : copy.location}
            </Button>
          </div>
          <div aria-live="polite" className="bridge-feedback">
            {bridgeFeedback && (
              <p className={`auth-feedback__message auth-feedback__message--${bridgeFeedback.kind}`} role={bridgeFeedback.kind === 'error' ? 'alert' : 'status'}>
                {bridgeFeedback.message}
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
