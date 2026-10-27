import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { usePresentation } from '../../../app/providers/PresentationContext'
import { Button } from '../../../shared/components/Button'
import { useListingDraft } from '../hooks/useListingDraft'
import {
  hasListingContent,
  LISTING_FIELD_NAMES,
  normalizeListingNumber,
  validateListingForm,
  type ListingFieldName,
  type ListingValidationErrors,
} from '../model/listingForm'
import { ListingSelect } from './ListingSelect'
import { getListingCopy, type ListingCopy } from './listingCopy'

type FieldShellProps = {
  children: ReactNode
  copy: ListingCopy
  errorCode?: ListingValidationErrors[ListingFieldName]
  field: ListingFieldName
  helper?: string
}

function FieldShell({ children, copy, errorCode, field, helper }: FieldShellProps) {
  const errorId = `${field}-error`
  const helperId = helper ? `${field}-helper` : undefined

  return (
    <div className={`listing-field${errorCode ? ' listing-field--invalid' : ''}`}>
      <label htmlFor={`listing-${field}`}>
        {copy.fields[field]} <span aria-hidden="true">*</span>
      </label>
      {children}
      {helper && <small id={helperId}>{helper}</small>}
      {errorCode && <p id={errorId} role="alert">{copy.errors[errorCode]}</p>}
    </div>
  )
}

function describedBy(field: ListingFieldName, hasError: boolean, hasHelper = false): string | undefined {
  const ids = []
  if (hasHelper) ids.push(`${field}-helper`)
  if (hasError) ids.push(`${field}-error`)
  return ids.length > 0 ? ids.join(' ') : undefined
}

function optionLabel(options: Record<string, string>, value: string, emptyValue: string): string {
  return options[value] ?? emptyValue
}

export function AddItemForm() {
  const { direction, isAppMode, language } = usePresentation()
  const copy = getListingCopy(language)
  const { clearDraft, initialReadStatus, persistenceStatus, updateField, values, wasRestored } = useListingDraft()
  const [errors, setErrors] = useState<ListingValidationErrors>({})
  const [submitState, setSubmitState] = useState<'invalid' | 'valid' | null>(null)
  const [isConfirmingClear, setIsConfirmingClear] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const hasContent = hasListingContent(values)

  const handleValueChange = (field: ListingFieldName, value: string) => {
    updateField(field, value)
    setSubmitState(null)
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateListingForm(values)
    setErrors(nextErrors)
    const firstInvalidField = LISTING_FIELD_NAMES.find((field) => nextErrors[field])
    if (firstInvalidField) {
      setSubmitState('invalid')
      document.getElementById(`listing-${firstInvalidField}`)?.focus()
      return
    }
    setSubmitState('valid')
  }

  const confirmClear = () => {
    clearDraft()
    setErrors({})
    setSubmitState(null)
    setIsConfirmingClear(false)
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('.listing-select__trigger, input, textarea')?.focus())
  }

  const category = optionLabel(copy.categoryOptions, values.category, copy.emptyValue)
  const type = optionLabel(copy.typeOptions, values.type, copy.emptyValue)
  const numericPrice = Number(normalizeListingNumber(values.openingPrice))
  const previewPrice = values.openingPrice.trim() !== '' && Number.isFinite(numericPrice) && numericPrice > 0
    ? `${new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { maximumFractionDigits: 2 }).format(numericPrice)} ${copy.currencySuffix}`
    : copy.emptyValue

  return (
    <section
      className={`listing-page${isAppMode ? ' listing-page--app' : ''}`}
      data-direction={direction}
      data-testid="listing-page"
    >
      <header className="listing-page__intro">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.introduction}</p>
      </header>

      <div className="listing-page__layout" data-responsive-layout="listing-form">
        <form className="listing-form listing-surface" noValidate onSubmit={handleSubmit} ref={formRef}>
          <div className="listing-form__heading">
            <h2>{copy.basics}</h2>
            <span>{copy.demoOnly}</span>
          </div>

          <div aria-live="polite" className="listing-draft-status">
            {wasRestored && <p className="listing-toast listing-toast--restored">{copy.restored}</p>}
            {initialReadStatus === 'invalid' && <p className="listing-toast listing-toast--warning">{copy.invalidDraft}</p>}
            {persistenceStatus === 'unavailable' && <p className="listing-toast listing-toast--warning">{copy.unavailable}</p>}
            {persistenceStatus === 'saved' && <p className="listing-draft-status__quiet">{copy.saved}</p>}
            {persistenceStatus === 'removed' && <p className="listing-draft-status__quiet">{copy.removed}</p>}
          </div>

          <fieldset className="listing-form__category-type">
            <legend>{copy.categoryTypeGroup}</legend>
            <div className="listing-form__grid">
              <FieldShell copy={copy} errorCode={errors.category} field="category">
                <ListingSelect
                  describedBy={describedBy('category', Boolean(errors.category))}
                  direction={direction}
                  id="listing-category"
                  invalid={Boolean(errors.category)}
                  label={copy.fields.category}
                  name="category"
                  onChange={(value) => handleValueChange('category', value)}
                  options={Object.entries(copy.categoryOptions).map(([value, label]) => ({ label, value }))}
                  placeholder={copy.categoryPlaceholder}
                  value={values.category}
                />
              </FieldShell>
              <FieldShell copy={copy} errorCode={errors.type} field="type">
                <ListingSelect
                  describedBy={describedBy('type', Boolean(errors.type))}
                  direction={direction}
                  id="listing-type"
                  invalid={Boolean(errors.type)}
                  label={copy.fields.type}
                  name="type"
                  onChange={(value) => handleValueChange('type', value)}
                  options={Object.entries(copy.typeOptions).map(([value, label]) => ({ label, value }))}
                  placeholder={copy.typePlaceholder}
                  value={values.type}
                />
              </FieldShell>
            </div>
          </fieldset>

          <div className="listing-form__grid">
            <FieldShell copy={copy} errorCode={errors.breed} field="breed" helper={copy.requiredNote}>
              <input
                aria-describedby={describedBy('breed', Boolean(errors.breed), true)}
                aria-invalid={Boolean(errors.breed)}
                aria-label={copy.fields.breed}
                id="listing-breed"
                name="breed"
                onChange={(event) => handleValueChange('breed', event.target.value)}
                placeholder={copy.placeholders.breed}
                required
                type="text"
                value={values.breed}
              />
            </FieldShell>
            <FieldShell copy={copy} errorCode={errors.age} field="age">
              <input
                aria-describedby={describedBy('age', Boolean(errors.age))}
                aria-invalid={Boolean(errors.age)}
                aria-label={copy.fields.age}
                id="listing-age"
                name="age"
                inputMode="numeric"
                onChange={(event) => handleValueChange('age', event.target.value)}
                pattern="[0-9٠-٩۰-۹]+"
                placeholder={copy.placeholders.age}
                required
                type="text"
                value={values.age}
              />
            </FieldShell>
            <FieldShell copy={copy} errorCode={errors.openingPrice} field="openingPrice">
              <div className="listing-field__price">
                <input
                  aria-describedby={describedBy('openingPrice', Boolean(errors.openingPrice))}
                  aria-invalid={Boolean(errors.openingPrice)}
                  aria-label={copy.fields.openingPrice}
                  id="listing-openingPrice"
                  name="openingPrice"
                  inputMode="decimal"
                  onChange={(event) => handleValueChange('openingPrice', event.target.value)}
                  pattern="[0-9٠-٩۰-۹.,٫٬]+"
                  placeholder={copy.placeholders.openingPrice}
                  required
                  type="text"
                  value={values.openingPrice}
                />
                <span aria-hidden="true">{copy.currencySuffix}</span>
              </div>
            </FieldShell>
            <FieldShell copy={copy} errorCode={errors.city} field="city">
              <input
                aria-describedby={describedBy('city', Boolean(errors.city))}
                aria-invalid={Boolean(errors.city)}
                aria-label={copy.fields.city}
                id="listing-city"
                name="city"
                onChange={(event) => handleValueChange('city', event.target.value)}
                placeholder={copy.placeholders.city}
                required
                type="text"
                value={values.city}
              />
            </FieldShell>
          </div>

          <FieldShell copy={copy} errorCode={errors.description} field="description">
            <textarea
              aria-describedby={describedBy('description', Boolean(errors.description))}
              aria-invalid={Boolean(errors.description)}
              aria-label={copy.fields.description}
              id="listing-description"
              name="description"
              onChange={(event) => handleValueChange('description', event.target.value)}
              placeholder={copy.placeholders.description}
              required
              rows={5}
              value={values.description}
            />
          </FieldShell>

          {submitState && (
            <p className={`listing-submit-status listing-submit-status--${submitState}`} role={submitState === 'invalid' ? 'alert' : 'status'}>
              {submitState === 'valid' ? copy.validDemo : copy.invalidForm}
            </p>
          )}

          <div className="listing-form__actions">
            {isConfirmingClear ? (
              <div aria-label={copy.confirmClear} className="listing-clear-confirmation" role="group">
                <strong>{copy.confirmClear}</strong>
                <Button onClick={confirmClear} type="button" variant="secondary">{copy.confirmClearAction}</Button>
                <Button onClick={() => setIsConfirmingClear(false)} type="button" variant="secondary">{copy.keepDraft}</Button>
              </div>
            ) : (
              <Button
                disabled={!hasContent}
                onClick={() => setIsConfirmingClear(true)}
                type="button"
                variant="secondary"
              >
                {copy.clear}
              </Button>
            )}
            <Button type="submit">{copy.validate}</Button>
          </div>
        </form>

        <aside className="listing-preview listing-surface" aria-labelledby="listing-preview-title">
          <div className="listing-preview__heading">
            <h2 id="listing-preview-title">{copy.preview}</h2>
            <span>{copy.demoOnly}</span>
          </div>
          <figure>
            <img alt={copy.previewImageAlt} src="/images/auction/emerald-watch-front.png" />
            <figcaption>{copy.sampleImage}</figcaption>
          </figure>
          <dl>
            <div><dt>{copy.fields.category}</dt><dd>{category}</dd></div>
            <div><dt>{copy.fields.type}</dt><dd>{type}</dd></div>
            <div><dt>{copy.fields.breed}</dt><dd>{values.breed || copy.emptyValue}</dd></div>
            <div><dt>{copy.fields.age}</dt><dd>{values.age || copy.emptyValue}</dd></div>
            <div><dt>{copy.fields.openingPrice}</dt><dd>{previewPrice}</dd></div>
            <div><dt>{copy.fields.city}</dt><dd>{values.city || copy.emptyValue}</dd></div>
            <div><dt>{copy.fields.description}</dt><dd>{values.description || copy.emptyValue}</dd></div>
          </dl>
        </aside>
      </div>
    </section>
  )
}
