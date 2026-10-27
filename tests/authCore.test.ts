import { describe, expect, it } from 'vitest'
import { normalizeOtp, validateMobilePhone } from '../src/features/auth/model/authValidation'
import { DemoOtpService } from '../src/features/auth/services/demoOtpService'
import {
  BrowserMockBridge,
  NativeBridgeMockError,
} from '../src/shared/services/nativeBridge'

describe('authentication model and demo services', () => {
  it('normalizes supported Saudi mobile formats and rejects invalid numbers', () => {
    expect(validateMobilePhone('05 1234 5678')).toEqual({
      valid: true,
      normalizedPhone: '+966512345678',
    })
    expect(validateMobilePhone('٠٥١٢٣٤٥٦٧٨')).toEqual({
      valid: true,
      normalizedPhone: '+966512345678',
    })
    expect(validateMobilePhone('+966 (5) 1234-5678')).toEqual({
      valid: true,
      normalizedPhone: '+966512345678',
    })
    expect(validateMobilePhone('')).toEqual({ valid: false, error: 'required' })
    expect(validateMobilePhone('12345')).toEqual({ valid: false, error: 'invalid' })
  })

  it('normalizes localized OTP digits and verifies only the centralized demo code', async () => {
    const service = new DemoOtpService({ delayMs: 0 })

    expect(normalizeOtp('٢٤٦٨١٠')).toBe('246810')
    await expect(service.verifyCode('+966512345678', '246810')).resolves.toBe(true)
    await expect(service.verifyCode('+966512345678', '111111')).resolves.toBe(false)
  })

  it('returns deterministic browser-mock photo and location results', async () => {
    const bridge = new BrowserMockBridge({ delayMs: 0 })

    await expect(bridge.capturePhoto()).resolves.toEqual({
      source: 'browser-mock',
      fileName: 'demo-capture.jpg',
      uri: 'mock://camera/demo-capture.jpg',
    })
    await expect(bridge.getLocation()).resolves.toEqual({
      source: 'browser-mock',
      latitude: 24.7136,
      longitude: 46.6753,
      accuracyMeters: 75,
    })
  })

  it('rejects configured native mock failures with a typed error', async () => {
    const bridge = new BrowserMockBridge({
      delayMs: 0,
      failActions: ['capturePhoto', 'getLocation'],
    })

    await expect(bridge.capturePhoto()).rejects.toBeInstanceOf(NativeBridgeMockError)
    await expect(bridge.getLocation()).rejects.toMatchObject({ action: 'getLocation' })
  })
})
