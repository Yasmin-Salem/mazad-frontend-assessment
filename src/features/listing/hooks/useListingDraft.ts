import { useCallback, useState } from 'react'
import {
  EMPTY_LISTING_FORM,
  hasListingContent,
  type ListingFieldName,
  type ListingFormValues,
} from '../model/listingForm'
import {
  browserListingDraftStorage,
  type DraftReadResult,
  type ListingDraftStorage,
} from '../services/listingDraftStorage'

export type DraftPersistenceStatus = 'idle' | 'removed' | 'saved' | 'unavailable'

function initialValues(result: DraftReadResult): ListingFormValues {
  return result.status === 'restored' ? result.data : { ...EMPTY_LISTING_FORM }
}

export function useListingDraft(storage: ListingDraftStorage = browserListingDraftStorage) {
  const [initialRead] = useState<DraftReadResult>(() => storage.read())
  const [values, setValues] = useState<ListingFormValues>(() => initialValues(initialRead))
  const [wasRestored, setWasRestored] = useState(initialRead.status === 'restored')
  const [persistenceStatus, setPersistenceStatus] = useState<DraftPersistenceStatus>(
    initialRead.status === 'unavailable' ? 'unavailable' : 'idle',
  )
  const updateField = useCallback((field: ListingFieldName, value: string) => {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)
    if (hasListingContent(nextValues)) {
      setPersistenceStatus(storage.save(nextValues) ? 'saved' : 'unavailable')
    } else {
      setPersistenceStatus(storage.remove() ? 'removed' : 'unavailable')
    }
  }, [storage, values])

  const clearDraft = useCallback(() => {
    setValues({ ...EMPTY_LISTING_FORM })
    setWasRestored(false)
    setPersistenceStatus(storage.remove() ? 'removed' : 'unavailable')
  }, [storage])

  return {
    clearDraft,
    initialReadStatus: initialRead.status,
    persistenceStatus,
    updateField,
    values,
    wasRestored,
  }
}
