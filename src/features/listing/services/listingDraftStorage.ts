import { isListingFormValues, type ListingFormValues } from '../model/listingForm'

export const LISTING_DRAFT_KEY = 'mazad:add-item-draft'
export const LISTING_DRAFT_VERSION = 1

type ListingDraftEnvelope = {
  version: typeof LISTING_DRAFT_VERSION
  savedAt: number
  data: ListingFormValues
}

export type DraftReadResult =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'restored'; data: ListingFormValues; savedAt: number }
  | { status: 'unavailable' }

export type ListingDraftStorage = {
  read: () => DraftReadResult
  remove: () => boolean
  save: (values: ListingFormValues) => boolean
}

export function createListingDraftStorage(
  getStorage: () => Storage = () => window.localStorage,
): ListingDraftStorage {
  return {
    read() {
      let serialized: string | null
      try {
        serialized = getStorage().getItem(LISTING_DRAFT_KEY)
      } catch {
        return { status: 'unavailable' }
      }
      if (serialized === null) return { status: 'empty' }

      try {
        const parsed: unknown = JSON.parse(serialized)
        if (!parsed || typeof parsed !== 'object') return { status: 'invalid' }
        const candidate = parsed as Partial<ListingDraftEnvelope>
        if (
          candidate.version !== LISTING_DRAFT_VERSION
          || !Number.isFinite(candidate.savedAt)
          || !isListingFormValues(candidate.data)
        ) {
          return { status: 'invalid' }
        }

        return {
          status: 'restored',
          data: candidate.data,
          savedAt: candidate.savedAt as number,
        }
      } catch {
        return { status: 'invalid' }
      }
    },
    save(values) {
      try {
        const envelope: ListingDraftEnvelope = {
          version: LISTING_DRAFT_VERSION,
          savedAt: Date.now(),
          data: values,
        }
        getStorage().setItem(LISTING_DRAFT_KEY, JSON.stringify(envelope))
        return true
      } catch {
        return false
      }
    },
    remove() {
      try {
        getStorage().removeItem(LISTING_DRAFT_KEY)
        return true
      } catch {
        return false
      }
    },
  }
}

export const browserListingDraftStorage = createListingDraftStorage()
