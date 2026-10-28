import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

async function selectListingOption(
  user: ReturnType<typeof userEvent.setup>,
  field: string,
  option: string,
) {
  await user.click(screen.getByRole('combobox', { name: field }))
  await user.click(screen.getByRole('option', { name: option }))
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Add Item form', () => {
  it('selects images, changes the primary image, removes it, and revokes object URLs', async () => {
    const createObjectURL = vi.fn()
      .mockReturnValueOnce('blob:first')
      .mockReturnValueOnce('blob:second')
    const revokeObjectURL = vi.fn()
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: createObjectURL },
      revokeObjectURL: { configurable: true, value: revokeObjectURL },
    })
    const user = userEvent.setup()
    const view = renderApp()
    const first = new File(['first'], 'first.jpg', { type: 'image/jpeg' })
    const second = new File(['second'], 'second.webp', { type: 'image/webp' })

    await user.upload(screen.getByLabelText('Choose images'), [first, second])
    expect(createObjectURL).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('img', { name: 'Primary product image: first.jpg' })).toHaveAttribute('src', 'blob:first')

    await user.click(screen.getByRole('button', { name: 'Make primary' }))
    expect(screen.getByRole('img', { name: 'Primary product image: second.webp' })).toHaveAttribute('src', 'blob:second')

    await user.click(screen.getByRole('button', { name: 'Remove second.webp' }))
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:second')
    expect(screen.getByRole('img', { name: 'Primary product image: first.jpg' })).toHaveAttribute('src', 'blob:first')

    view.unmount()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:first')
  })

  it('rejects unsupported and oversized files and limits selection to five images', async () => {
    const createObjectURL = vi.fn((file: File) => `blob:${file.name}`)
    const revokeObjectURL = vi.fn()
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: createObjectURL },
      revokeObjectURL: { configurable: true, value: revokeObjectURL },
    })
    const user = userEvent.setup({ applyAccept: false })
    renderApp()
    const unsupported = new File(['text'], 'notes.txt', { type: 'text/plain' })
    const oversized = new File(['large'], 'large.png', { type: 'image/png' })
    Object.defineProperty(oversized, 'size', { value: 5 * 1024 * 1024 + 1 })
    const validImages = Array.from({ length: 6 }, (_, index) => (
      new File([`image-${index}`], `image-${index}.png`, { type: 'image/png' })
    ))

    await user.upload(screen.getByLabelText('Choose images'), [unsupported, oversized, ...validImages])

    expect(screen.getByText('notes.txt: Use a JPG, PNG, or WebP image.')).toBeInTheDocument()
    expect(screen.getByText('large.png: This image is larger than 5 MB.')).toBeInTheDocument()
    expect(screen.getByText('A product can have no more than 5 images.')).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Selected product images' })).getAllByRole('img')).toHaveLength(5)
    expect(createObjectURL).toHaveBeenCalledTimes(5)
  })

  it('shows localized required and numeric errors, then validates without publishing', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('button', { name: 'Validate demo item' }))
    expect(screen.getAllByText('This field is required.')).toHaveLength(7)
    expect(screen.getByLabelText('Category')).toHaveFocus()

    await selectListingOption(user, 'Category', 'Sheep')
    await selectListingOption(user, 'Type', 'Farm listed')
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

  it('supports accessible keyboard selection and Escape dismissal', async () => {
    const user = userEvent.setup()
    renderApp()

    const category = screen.getByRole('combobox', { name: 'Category' })
    category.focus()
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')

    expect(category).toHaveFocus()
    expect(category).toHaveAttribute('aria-expanded', 'false')
    expect(category).toHaveTextContent('Sheep')
    expect(window.localStorage.getItem(LISTING_DRAFT_KEY)).toContain('"category":"watches"')

    const type = screen.getByRole('combobox', { name: 'Type' })
    type.focus()
    await user.keyboard('{Enter}')
    expect(type).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox', { name: 'Type' })).toBeInTheDocument()
    await user.keyboard('{Escape}')

    expect(type).toHaveFocus()
    expect(type).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox', { name: 'Type' })).not.toBeInTheDocument()
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
    expect(screen.getAllByRole('combobox')[0].closest('.listing-select')).toHaveAttribute('dir', 'ltr')
    expect(document.querySelectorAll('[data-responsive-layout="listing-form"]')).toHaveLength(1)
    english.unmount()

    renderApp('/listing?mode=app')
    expect(screen.getByTestId('listing-page')).toHaveClass('listing-page--app')
    expect(screen.getByTestId('listing-page')).toHaveAttribute('data-direction', 'rtl')
    expect(screen.getAllByRole('combobox')[0].closest('.listing-select')).toHaveAttribute('dir', 'rtl')
    expect(screen.getByRole('navigation', { name: 'تنقل التطبيق' })).toBeInTheDocument()
    expect(document.querySelectorAll('[data-responsive-layout="listing-form"]')).toHaveLength(1)
  })
})
