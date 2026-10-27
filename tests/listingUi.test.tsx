import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../src/app/App'
import {
  LISTING_DRAFT_KEY,
  LISTING_DRAFT_VERSION,
} from '../src/features/listing/services/listingDraftStorage'
import type { ListingFormValues } from '../src/features/listing/model/listingForm'

const restoredValues: ListingFormValues = {
  category: 'watches',
  type: 'preowned',
  breed: 'Datejust family',
  age: '3',
  openingPrice: '8000',
  city: 'Riyadh',
  description: 'A restored local draft.',
}

function renderApp(route = '/listing?lang=en') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

function storeDraft(values = restoredValues) {
  window.localStorage.setItem(LISTING_DRAFT_KEY, JSON.stringify({
    version: LISTING_DRAFT_VERSION,
    savedAt: Date.now(),
    data: values,
  }))
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('Add Item form', () => {
  it('shows localized required and numeric errors, then validates without publishing', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('button', { name: 'Validate demo item' }))
    expect(screen.getAllByText('This field is required.')).toHaveLength(7)
    expect(screen.getByLabelText('Category')).toHaveFocus()

    await user.selectOptions(screen.getByLabelText('Category'), 'watches')
    await user.selectOptions(screen.getByLabelText('Type'), 'preowned')
    await user.type(screen.getByLabelText('Breed'), 'Datejust family')
    await user.type(screen.getByLabelText('Age'), '0')
    await user.type(screen.getByLabelText('Opening Price'), '-10')
    await user.type(screen.getByLabelText('City'), 'Riyadh')
    await user.type(screen.getByLabelText('Description'), 'A complete demo item description.')
    await user.click(screen.getByRole('button', { name: 'Validate demo item' }))

    expect(screen.getByText('Enter a whole number greater than zero.')).toBeInTheDocument()
    expect(screen.getByText('Enter a number greater than zero.')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Age'))
    await user.type(screen.getByLabelText('Age'), '3')
    await user.clear(screen.getByLabelText('Opening Price'))
    await user.type(screen.getByLabelText('Opening Price'), '8000')
    await user.click(screen.getByRole('button', { name: 'Validate demo item' }))

    expect(screen.getByRole('status')).toHaveTextContent('Validation passed. Demo only—nothing was published.')
  })

  it('automatically saves edits in a versioned LocalStorage envelope', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.type(screen.getByLabelText('Breed'), 'Arabian')

    const stored = JSON.parse(window.localStorage.getItem(LISTING_DRAFT_KEY) ?? '{}') as {
      version?: number
      data?: ListingFormValues
    }
    expect(stored.version).toBe(LISTING_DRAFT_VERSION)
    expect(stored.data?.breed).toBe('Arabian')
    expect(screen.getByText('Draft saved locally')).toBeInTheDocument()
  })

  it('restores a saved Arabic draft and shows the exact required message', () => {
    storeDraft()
    renderApp('/listing')

    expect(screen.getByText('تمت استعادة المسودة بنجاح')).toBeInTheDocument()
    expect(screen.getByLabelText('السلالة')).toHaveValue('Datejust family')
    expect(screen.getByLabelText('السعر الافتتاحي')).toHaveValue('8000')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
  })

  it('accepts, saves, restores, and previews Arabic-Indic age and opening-price values', async () => {
    const user = userEvent.setup()
    const firstRender = renderApp('/listing')

    await user.type(screen.getByLabelText('العمر'), '٣')
    await user.type(screen.getByLabelText('السعر الافتتاحي'), '٨٬٠٠٠٫٥')

    expect(screen.getByLabelText('العمر')).toHaveValue('٣')
    expect(screen.getByLabelText('السعر الافتتاحي')).toHaveValue('٨٬٠٠٠٫٥')

    const stored = JSON.parse(window.localStorage.getItem(LISTING_DRAFT_KEY) ?? '{}') as { data?: ListingFormValues }
    expect(stored.data).toMatchObject({ age: '٣', openingPrice: '٨٬٠٠٠٫٥' })

    const preview = screen.getByRole('complementary', { name: 'معاينة تجريبية' })
    expect(within(preview).getByText('٣')).toBeInTheDocument()
    expect(within(preview).getByText((text) => text.includes('٨٬٠٠٠٫٥') && text.includes('ر.س'))).toBeInTheDocument()

    firstRender.unmount()
    renderApp('/listing')
    expect(screen.getByLabelText('العمر')).toHaveValue('٣')
    expect(screen.getByLabelText('السعر الافتتاحي')).toHaveValue('٨٬٠٠٠٫٥')
    expect(screen.getByText('تمت استعادة المسودة بنجاح')).toBeInTheDocument()
  })

  it('ignores corrupted data without claiming a restoration', () => {
    window.localStorage.setItem(LISTING_DRAFT_KEY, '{broken')
    renderApp('/listing')

    expect(screen.getByText('تم تجاهل مسودة محفوظة غير صالحة أو غير متوافقة.')).toBeInTheDocument()
    expect(screen.queryByText('تمت استعادة المسودة بنجاح')).not.toBeInTheDocument()
    expect(screen.getByLabelText('السلالة')).toHaveValue('')
  })

  it('clears the saved draft and form without immediate recreation, then resumes autosave', async () => {
    const user = userEvent.setup()
    storeDraft()
    renderApp()

    await user.click(screen.getByRole('button', { name: 'Clear draft' }))
    expect(screen.getByRole('group', { name: 'Clear saved draft?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Yes, clear draft' }))

    expect(screen.getByLabelText('Breed')).toHaveValue('')
    expect(window.localStorage.getItem(LISTING_DRAFT_KEY)).toBeNull()
    expect(screen.getByText('Draft cleared')).toBeInTheDocument()

    await user.type(screen.getByLabelText('City'), 'Jeddah')
    expect(window.localStorage.getItem(LISTING_DRAFT_KEY)).not.toBeNull()
  })

  it('reuses one responsive form in English LTR and Arabic RTL app mode', () => {
    const english = renderApp()
    expect(screen.getByTestId('listing-page')).toHaveAttribute('data-direction', 'ltr')
    expect(document.querySelectorAll('[data-responsive-layout="listing-form"]')).toHaveLength(1)
    english.unmount()

    renderApp('/listing?mode=app')
    expect(screen.getByTestId('listing-page')).toHaveClass('listing-page--app')
    expect(screen.getByTestId('listing-page')).toHaveAttribute('data-direction', 'rtl')
    expect(screen.getByRole('navigation', { name: 'تنقل التطبيق' })).toBeInTheDocument()
    expect(document.querySelectorAll('[data-responsive-layout="listing-form"]')).toHaveLength(1)
  })
})
