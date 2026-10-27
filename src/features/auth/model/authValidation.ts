export type PhoneValidationError = 'required' | 'invalid'

export type PhoneValidationResult =
  | { valid: true; normalizedPhone: string }
  | { valid: false; error: PhoneValidationError }

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const EASTERN_ARABIC_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

export function normalizeDigits(value: string): string {
  return Array.from(value, (character) => {
    const arabicIndex = ARABIC_DIGITS.indexOf(character)
    if (arabicIndex >= 0) return String(arabicIndex)

    const easternArabicIndex = EASTERN_ARABIC_DIGITS.indexOf(character)
    return easternArabicIndex >= 0 ? String(easternArabicIndex) : character
  }).join('')
}

export function validateMobilePhone(value: string): PhoneValidationResult {
  const entered = normalizeDigits(value).trim()
  if (!entered) return { valid: false, error: 'required' }

  const compact = entered.replace(/[\s()-]/g, '')
  if (/^05\d{8}$/.test(compact)) {
    return { valid: true, normalizedPhone: `+966${compact.slice(1)}` }
  }

  if (/^(?:\+|00)?9665\d{8}$/.test(compact)) {
    return {
      valid: true,
      normalizedPhone: `+${compact.replace(/^(?:\+|00)?/, '')}`,
    }
  }

  return { valid: false, error: 'invalid' }
}

export function normalizeOtp(value: string): string {
  return normalizeDigits(value).replace(/\D/g, '')
}
