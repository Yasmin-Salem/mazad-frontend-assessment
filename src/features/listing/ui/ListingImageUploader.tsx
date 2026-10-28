import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import type { ListingImage, ListingImageError } from '../hooks/useListingImages'
import type { ListingCopy } from './listingCopy'

type ListingImageUploaderProps = {
  copy: ListingCopy
  errors: readonly ListingImageError[]
  images: readonly ListingImage[]
  onAddFiles: (files: FileList | readonly File[]) => void
  onRemove: (imageId: string) => void
  onSelectPrimary: (imageId: string) => void
  primaryImageId: string | null
}

export function ListingImageUploader({
  copy,
  errors,
  images,
  onAddFiles,
  onRemove,
  onSelectPrimary,
  primaryImageId,
}: ListingImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragDepth = useRef(0)

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) onAddFiles(event.target.files)
    event.target.value = ''
  }

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    dragDepth.current += 1
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    dragDepth.current = 0
    setIsDragging(false)
    if (event.dataTransfer.files.length > 0) onAddFiles(event.dataTransfer.files)
  }

  const errorMessage = (error: ListingImageError) => {
    const message = copy.imageErrors[error.code]
    return error.fileName ? `${error.fileName}: ${message}` : message
  }

  return (
    <section className="listing-uploader" aria-labelledby="listing-images-title">
      <div className="listing-uploader__heading">
        <div>
          <h3 id="listing-images-title">{copy.imagesTitle}</h3>
          <span>{copy.optional}</span>
        </div>
        <small>{copy.imagesCount(images.length)}</small>
      </div>

      <div
        className={`listing-uploader__dropzone${isDragging ? ' is-dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          id="listing-images"
          multiple
          onChange={handleFiles}
          type="file"
        />
        <span aria-hidden="true" className="listing-uploader__icon">+</span>
        <div>
          <strong>{copy.uploadPrompt}</strong>
          <p>{copy.dropPrompt}</p>
        </div>
        <label className="listing-uploader__button" htmlFor="listing-images">{copy.chooseImages}</label>
      </div>

      <p className="listing-uploader__requirements">{copy.imageRequirements}</p>
      <p className="listing-uploader__session-note">{copy.imagesSessionOnly}</p>

      {errors.length > 0 && (
        <ul className="listing-uploader__errors" aria-live="polite">
          {errors.map((error, index) => <li key={`${error.code}-${error.fileName ?? 'all'}-${index}`}>{errorMessage(error)}</li>)}
        </ul>
      )}

      {images.length > 0 && (
        <ul className="listing-uploader__thumbnails" aria-label={copy.uploadedImages}>
          {images.map((image) => {
            const isPrimary = image.id === primaryImageId
            return (
              <li className={isPrimary ? 'is-primary' : ''} key={image.id}>
                <img alt={image.file.name} src={image.url} />
                {isPrimary && <span className="listing-uploader__primary-badge">{copy.primaryImage}</span>}
                <div className="listing-uploader__thumbnail-actions">
                  <button
                    aria-pressed={isPrimary}
                    disabled={isPrimary}
                    onClick={() => onSelectPrimary(image.id)}
                    type="button"
                  >
                    {isPrimary ? copy.primaryImage : copy.makePrimary}
                  </button>
                  <button aria-label={copy.removeImage(image.file.name)} onClick={() => onRemove(image.id)} type="button">
                    {copy.remove}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
