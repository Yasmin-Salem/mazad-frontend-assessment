import { DEMO_AUTH_CONFIG } from '../config/demoAuth'
import { normalizeOtp } from '../model/authValidation'

export interface OtpService {
  requestCode(phone: string): Promise<void>
  verifyCode(phone: string, code: string): Promise<boolean>
}

type DemoOtpServiceOptions = {
  code?: string
  delayMs?: number
}

export class DemoOtpService implements OtpService {
  readonly #code: string
  readonly #delayMs: number

  constructor(options: DemoOtpServiceOptions = {}) {
    this.#code = options.code ?? DEMO_AUTH_CONFIG.code
    this.#delayMs = options.delayMs ?? DEMO_AUTH_CONFIG.simulatedDelayMs
  }

  async requestCode(phone: string): Promise<void> {
    void phone
    await this.simulateDelay()
  }

  async verifyCode(phone: string, code: string): Promise<boolean> {
    void phone
    await this.simulateDelay()
    return normalizeOtp(code) === this.#code
  }

  private async simulateDelay(): Promise<void> {
    if (this.#delayMs <= 0) return
    await new Promise<void>((resolve) => window.setTimeout(resolve, this.#delayMs))
  }
}

export const demoOtpService = new DemoOtpService()
