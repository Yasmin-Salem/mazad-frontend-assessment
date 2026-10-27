import { beforeEach, describe, expect, it } from 'vitest'
import {
  EMPTY_LISTING_FORM,
  normalizeListingNumber,
  validateListingForm,
  type ListingFormValues,
} from '../src/features/listing/model/listingForm'
import {
  createListingDraftStorage,
  LISTING_DRAFT_KEY,
  LISTING_DRAFT_VERSION,
} from '../src/features/listing/services/listingDraftStorage'

const completeValues: ListingFormValues = {
  category: 'watches',
  type: 'preowned',
  breed: 'Datejust family',
  age: '3',
  openingPrice: '8000',
  city: 'Riyadh',
  description: 'A detailed and accurate description.',
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('listing form validation', () => {
  it('requires every assessment field and validates numeric values', () => {
    expect(validateListingForm(EMPTY_LISTING_FORM)).toEqual({
      category: 'required',
      type: 'required',
      breed: 'required',
      age: 'required',
      openingPrice: 'required',
      city: 'required',
      description: 'required',
    })

    expect(validateListingForm({ ...completeValues, age: '1.5', openingPrice: '-20' })).toMatchObject({
      age: 'positive-integer',
      openingPrice: 'positive-number',
    })
    expect(validateListingForm(completeValues)).toEqual({})
  })

  it('normalizes Arabic-Indic numeric input for validation without changing the draft value', () => {
    const localizedValues = {
      ...completeValues,
      age: '٣',
      openingPrice: '٨٬٠٠٠٫٥٠',
    }

    expect(normalizeListingNumber(localizedValues.age)).toBe('3')
    expect(normalizeListingNumber(localizedValues.openingPrice)).toBe('8000.50')
    expect(validateListingForm(localizedValues)).toEqual({})
  })
})

describe('listing draft storage', () => {
  it('round-trips a versioned draft', () => {
    const storage = createListingDraftStorage()

    expect(storage.save(completeValues)).toBe(true)
    expect(storage.read()).toMatchObject({
      status: 'restored',
      data: completeValues,
    })

    const envelope = JSON.parse(window.localStorage.getItem(LISTING_DRAFT_KEY) ?? '{}') as { version?: number }
    expect(envelope.version).toBe(LISTING_DRAFT_VERSION)
  })

  it('round-trips localized numeric draft values without data loss', () => {
    const storage = createListingDraftStorage()
    const localizedValues = { ...completeValues, age: '٣', openingPrice: '٨٠٠٠٫٥' }

    expect(storage.save(localizedValues)).toBe(true)
    expect(storage.read()).toMatchObject({ status: 'restored', data: localizedValues })
  })

  it('rejects corrupt and incompatible drafts without throwing', () => {
    const storage = createListingDraftStorage()

    window.localStorage.setItem(LISTING_DRAFT_KEY, '{not-json')
    expect(storage.read()).toEqual({ status: 'invalid' })

    window.localStorage.setItem(LISTING_DRAFT_KEY, JSON.stringify({
      version: LISTING_DRAFT_VERSION + 1,
      savedAt: Date.now(),
      data: completeValues,
    }))
    expect(storage.read()).toEqual({ status: 'invalid' })
  })

  it('contains storage access failures and keeps the API safe', () => {
    const failingStorage = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
      removeItem: () => { throw new Error('blocked') },
    } as unknown as Storage
    const storage = createListingDraftStorage(() => failingStorage)

    expect(storage.read()).toEqual({ status: 'unavailable' })
    expect(storage.save(completeValues)).toBe(false)
    expect(storage.remove()).toBe(false)
  })
})
