export const LISTING_FIELD_NAMES = [
  'category',
  'type',
  'breed',
  'age',
  'openingPrice',
  'city',
  'description',
] as const

export type ListingFieldName = (typeof LISTING_FIELD_NAMES)[number]

export type ListingFormValues = Record<ListingFieldName, string>

export type ListingValidationCode = 'positive-integer' | 'positive-number' | 'required'

export type ListingValidationErrors = Partial<Record<ListingFieldName, ListingValidationCode>>

export const EMPTY_LISTING_FORM: ListingFormValues = {
  category: '',
  type: '',
  breed: '',
  age: '',
  openingPrice: '',
  city: '',
  description: '',
}

export function normalizeListingNumber(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٬,]/g, '')
    .replace(/[٫]/g, '.')
}

function isPositiveInteger(value: string): boolean {
  if (value.trim() === '') return false
  const parsed = Number(normalizeListingNumber(value))
  return Number.isSafeInteger(parsed) && parsed > 0
}

function isPositiveNumber(value: string): boolean {
  if (value.trim() === '') return false
  const parsed = Number(normalizeListingNumber(value))
  return Number.isFinite(parsed) && parsed > 0
}

export function validateListingForm(values: ListingFormValues): ListingValidationErrors {
  const errors: ListingValidationErrors = {}

  for (const field of LISTING_FIELD_NAMES) {
    if (values[field].trim() === '') errors[field] = 'required'
  }

  if (values.age.trim() !== '' && !isPositiveInteger(values.age)) {
    errors.age = 'positive-integer'
  }
  if (values.openingPrice.trim() !== '' && !isPositiveNumber(values.openingPrice)) {
    errors.openingPrice = 'positive-number'
  }

  return errors
}

export function hasListingContent(values: ListingFormValues): boolean {
  return LISTING_FIELD_NAMES.some((field) => values[field].trim() !== '')
}

export function isListingFormValues(value: unknown): value is ListingFormValues {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return LISTING_FIELD_NAMES.every((field) => typeof candidate[field] === 'string')
}
