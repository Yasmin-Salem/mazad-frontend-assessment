import type {
  AuctionUpdate,
  AuctionUpdateListener,
  AuctionUpdateSource,
} from '../model/types'

export type ScheduledAuctionUpdate = {
  delayMs: number
  update: AuctionUpdate
}

type TimerHandle = ReturnType<typeof globalThis.setTimeout>

export type TimerScheduler = {
  setTimeout: (callback: () => void, delayMs: number) => TimerHandle
  clearTimeout: (handle: TimerHandle) => void
}

const browserScheduler: TimerScheduler = {
  setTimeout: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clearTimeout: (handle) => globalThis.clearTimeout(handle),
}

export class LocalAuctionUpdateSource implements AuctionUpdateSource {
  readonly #schedule: readonly ScheduledAuctionUpdate[]
  readonly #scheduler: TimerScheduler

  constructor(
    schedule: readonly ScheduledAuctionUpdate[],
    scheduler: TimerScheduler = browserScheduler,
  ) {
    this.#schedule = schedule
    this.#scheduler = scheduler
  }

  subscribe(auctionId: string, listener: AuctionUpdateListener): () => void {
    let isActive = true
    const handles = this.#schedule
      .filter(({ update }) => update.bid.auctionId === auctionId)
      .map(({ delayMs, update }) => this.#scheduler.setTimeout(() => {
        if (isActive) listener(update)
      }, Math.max(0, delayMs)))

    return () => {
      if (!isActive) return
      isActive = false
      handles.forEach((handle) => this.#scheduler.clearTimeout(handle))
    }
  }
}
