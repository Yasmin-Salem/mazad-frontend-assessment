export type MockPhotoResult = {
  source: 'browser-mock'
  fileName: string
  uri: string
}

export type MockLocationResult = {
  source: 'browser-mock'
  latitude: number
  longitude: number
  accuracyMeters: number
}

export interface NativeBridge {
  capturePhoto(): Promise<MockPhotoResult>
  getLocation(): Promise<MockLocationResult>
}

export type NativeBridgeAction = 'capturePhoto' | 'getLocation'

export class NativeBridgeMockError extends Error {
  readonly action: NativeBridgeAction

  constructor(action: NativeBridgeAction) {
    super(`The simulated ${action} action could not be completed.`)
    this.name = 'NativeBridgeMockError'
    this.action = action
  }
}

type BrowserMockBridgeOptions = {
  delayMs?: number
  failActions?: readonly NativeBridgeAction[]
}

export class BrowserMockBridge implements NativeBridge {
  readonly #delayMs: number
  readonly #failActions: ReadonlySet<NativeBridgeAction>

  constructor(options: BrowserMockBridgeOptions = {}) {
    this.#delayMs = options.delayMs ?? 180
    this.#failActions = new Set(options.failActions)
  }

  async capturePhoto(): Promise<MockPhotoResult> {
    await this.simulateAction('capturePhoto')
    return {
      source: 'browser-mock',
      fileName: 'demo-capture.jpg',
      uri: 'mock://camera/demo-capture.jpg',
    }
  }

  async getLocation(): Promise<MockLocationResult> {
    await this.simulateAction('getLocation')
    return {
      source: 'browser-mock',
      latitude: 24.7136,
      longitude: 46.6753,
      accuracyMeters: 75,
    }
  }

  private async simulateAction(action: NativeBridgeAction): Promise<void> {
    if (this.#delayMs > 0) {
      await new Promise<void>((resolve) => window.setTimeout(resolve, this.#delayMs))
    }
    if (this.#failActions.has(action)) throw new NativeBridgeMockError(action)
  }
}

export const browserMockBridge = new BrowserMockBridge()
