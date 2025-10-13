import { generateReactHelpers } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

/**
 * React helpers for UploadThing file uploads
 *
 * These helpers provide convenient functions for handling file uploads
 * with the UploadThing service.
 *
 * @property {Function} useUploadThing - React hook for UploadThing state management
 * @property {Function} uploadFiles - Function to upload files to UploadThing
 */
export const { useUploadThing, uploadFiles } =
    generateReactHelpers<OurFileRouter>()

/**
 * Interface representing an error from the UploadThing service
 *
 * @interface UploadThingError
 * @property {string} message - The error message
 * @property {string} [cause] - Optional cause of the error
 */
export type UploadThingError = {
    message: string
    cause?: string
}
