import { useEffect, useRef, useState } from 'react'

export const MAX_LISTING_IMAGES = 5
export const MAX_LISTING_IMAGE_BYTES = 5 * 1024 * 1024

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ACCEPTED_IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i

export type ListingImage = {
  id: string
  file: File
  url: string
}

export type ListingImageError = {
  code: 'limit' | 'oversized' | 'unsupported'
  fileName?: string
}

function isAcceptedImage(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.has(file.type) || (file.type === '' && ACCEPTED_IMAGE_EXTENSIONS.test(file.name))
}

export function useListingImages() {
  const [images, setImages] = useState<ListingImage[]>([])
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null)
  const [errors, setErrors] = useState<ListingImageError[]>([])
  const imagesRef = useRef<ListingImage[]>([])
  const sequenceRef = useRef(0)

  const replaceImages = (nextImages: ListingImage[]) => {
    imagesRef.current = nextImages
    setImages(nextImages)
  }

  useEffect(() => () => {
    imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url))
  }, [])

  const addFiles = (files: FileList | readonly File[]) => {
    const nextErrors: ListingImageError[] = []
    const validFiles: File[] = []

    Array.from(files).forEach((file) => {
      if (!isAcceptedImage(file)) {
        nextErrors.push({ code: 'unsupported', fileName: file.name })
      } else if (file.size > MAX_LISTING_IMAGE_BYTES) {
        nextErrors.push({ code: 'oversized', fileName: file.name })
      } else {
        validFiles.push(file)
      }
    })

    const availableSlots = Math.max(0, MAX_LISTING_IMAGES - imagesRef.current.length)
    if (validFiles.length > availableSlots) {
      nextErrors.push({ code: 'limit' })
    }

    const acceptedFiles = validFiles.slice(0, availableSlots)
    const addedImages = acceptedFiles.map((file) => {
      sequenceRef.current += 1
      return {
        id: `${file.name}-${file.lastModified}-${file.size}-${sequenceRef.current}`,
        file,
        url: URL.createObjectURL(file),
      }
    })

    if (addedImages.length > 0) {
      const nextImages = [...imagesRef.current, ...addedImages]
      replaceImages(nextImages)
      setPrimaryImageId((current) => current ?? addedImages[0].id)
    }

    setErrors(nextErrors)
  }

  const removeImage = (imageId: string) => {
    const imageToRemove = imagesRef.current.find((image) => image.id === imageId)
    if (imageToRemove) URL.revokeObjectURL(imageToRemove.url)

    const nextImages = imagesRef.current.filter((image) => image.id !== imageId)
    replaceImages(nextImages)
    setPrimaryImageId((current) => current === imageId ? nextImages[0]?.id ?? null : current)
    setErrors([])
  }

  const clearImages = () => {
    imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url))
    replaceImages([])
    setPrimaryImageId(null)
    setErrors([])
  }

  const selectPrimaryImage = (imageId: string) => {
    if (imagesRef.current.some((image) => image.id === imageId)) {
      setPrimaryImageId(imageId)
    }
  }

  return {
    addFiles,
    clearImages,
    errors,
    images,
    primaryImage: images.find((image) => image.id === primaryImageId) ?? images[0] ?? null,
    primaryImageId,
    removeImage,
    selectPrimaryImage,
  }
}
