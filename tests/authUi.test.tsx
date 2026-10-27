import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StrictMode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../src/app/App'
import { PresentationProvider } from '../src/app/providers/PresentationProvider'
import { LoginExperience } from '../src/features/auth/ui/LoginExperience'
import type { OtpService } from '../src/features/auth/services/demoOtpService'
import type { NativeBridge } from '../src/shared/services/nativeBridge'

function renderApp(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

function renderExperience({
  otpService,
  nativeBridge,
}: {
  otpService?: OtpService
  nativeBridge?: NativeBridge
} = {}) {
  return render(
    <MemoryRouter initialEntries={['/login?lang=en']}>
      <PresentationProvider>
        <LoginExperience otpService={otpService} nativeBridge={nativeBridge} />
      </PresentationProvider>
    </MemoryRouter>,
  )
}

const immediateOtpService: OtpService = {
  requestCode: vi.fn().mockResolvedValue(undefined),
  verifyCode: vi.fn(async (phone, code) => {
    void phone
    return code === '246810'
  }),
}

describe('login and native bridge UI', () => {
  it('validates the phone number before requesting a demo code', async () => {
    const user = userEvent.setup()
    renderExperience({ otpService: immediateOtpService })

    await user.click(screen.getByRole('button', { name: 'Continue with demo code' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your mobile number.')

    await user.type(screen.getByLabelText('Saudi mobile number'), '12345')
    await user.click(screen.getByRole('button', { name: 'Continue with demo code' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid Saudi mobile number')
  })

  it('completes async verification setup under the application Strict Mode lifecycle', async () => {
    const user = userEvent.setup()
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/login?lang=en']}>
          <PresentationProvider>
            <LoginExperience otpService={immediateOtpService} />
          </PresentationProvider>
        </MemoryRouter>
      </StrictMode>,
    )

    await user.type(screen.getByLabelText('Saudi mobile number'), '0512345678')
    await user.click(screen.getByRole('button', { name: 'Continue with demo code' }))

    expect(await screen.findByRole('heading', { name: 'Enter verification code' })).toBeInTheDocument()
  })

  it('shows loading, invalid-code, resend, and successful demo verification states', async () => {
    const user = userEvent.setup()
    let releaseRequest: (() => void) | undefined
    const otpService: OtpService = {
      requestCode: vi.fn(() => new Promise<void>((resolve) => {
        releaseRequest = resolve
      })),
      verifyCode: vi.fn(async (phone, code) => {
        void phone
        return code === '246810'
      }),
    }
    renderExperience({ otpService })

    await user.type(screen.getByLabelText('Saudi mobile number'), '0512345678')
    await user.click(screen.getByRole('button', { name: 'Continue with demo code' }))
    expect(screen.getByRole('button', { name: 'Preparing demo code…' })).toBeDisabled()
    releaseRequest?.()

    expect(await screen.findByRole('heading', { name: 'Enter verification code' })).toBeInTheDocument()
    expect(screen.getByText('Demo code prepared. No SMS was sent.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Six-digit verification code'), '111111')
    await user.click(screen.getByRole('button', { name: 'Verify demo code' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('That demo code is incorrect')

    await user.clear(screen.getByLabelText('Six-digit verification code'))
    await user.type(screen.getByLabelText('Six-digit verification code'), '246810')
    await user.click(screen.getByRole('button', { name: 'Verify demo code' }))
    expect(await screen.findByRole('heading', { name: 'Demo verification complete' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('No account session or authentication token was created.')
  })

  it('resends through the same mock service and reports that no SMS was sent', async () => {
    const user = userEvent.setup()
    const otpService: OtpService = {
      requestCode: vi.fn().mockResolvedValue(undefined),
      verifyCode: vi.fn().mockResolvedValue(false),
    }
    renderExperience({ otpService })

    await user.type(screen.getByLabelText('Saudi mobile number'), '0512345678')
    await user.click(screen.getByRole('button', { name: 'Continue with demo code' }))
    await user.click(await screen.findByRole('button', { name: 'Resend demo code' }))

    expect(otpService.requestCode).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('status')).toHaveTextContent('Demo code reset. No SMS was sent.')
  })

  it('runs both bridge mock actions and exposes simulated feedback', async () => {
    const user = userEvent.setup()
    const nativeBridge: NativeBridge = {
      capturePhoto: vi.fn().mockResolvedValue({
        source: 'browser-mock',
        fileName: 'test-photo.jpg',
        uri: 'mock://camera/test-photo.jpg',
      }),
      getLocation: vi.fn().mockResolvedValue({
        source: 'browser-mock',
        latitude: 24.7136,
        longitude: 46.6753,
        accuracyMeters: 75,
      }),
    }
    renderExperience({ nativeBridge })

    await user.click(screen.getByRole('button', { name: 'Simulate photo capture' }))
    expect(screen.getByRole('status')).toHaveTextContent('test-photo.jpg')
    expect(screen.getByRole('status')).toHaveTextContent('No camera was opened.')

    await user.click(screen.getByRole('button', { name: 'Simulate location' }))
    expect(screen.getByRole('status')).toHaveTextContent('24.7136, 46.6753')
    expect(screen.getByRole('status')).toHaveTextContent('No GPS was requested.')
  })

  it('handles a rejected native bridge action without crashing', async () => {
    const user = userEvent.setup()
    const nativeBridge: NativeBridge = {
      capturePhoto: vi.fn().mockRejectedValue(new Error('mock failure')),
      getLocation: vi.fn().mockRejectedValue(new Error('mock failure')),
    }
    renderExperience({ nativeBridge })

    await user.click(screen.getByRole('button', { name: 'Simulate photo capture' }))
    expect(screen.getByRole('alert')).toHaveTextContent('The simulated native action could not be completed.')
    expect(screen.getByRole('button', { name: 'Simulate photo capture' })).toBeEnabled()
  })

  it('uses the shared English web and Arabic app shells without duplicating the page', () => {
    const { unmount } = renderApp('/login?lang=en')

    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    expect(document.querySelector('[data-mode="web"]')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument()
    expect(screen.getByTestId('auth-page')).toBeInTheDocument()
    expect(screen.getByText('Mock OTP demo')).toBeInTheDocument()
    unmount()

    renderApp('/login?mode=app')
    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(document.querySelector('[data-mode="app"]')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'تنقل التطبيق' })).toBeInTheDocument()
    expect(screen.getByText('عرض تجريبي لرمز تحقق وهمي')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'تسجيل الدخول إلى حسابك' })).toBeInTheDocument()
  })
})
