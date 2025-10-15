import { UploadButton, UploadDropzone, Uploader } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

export { UploadButton, UploadDropzone, Uploader }

// Properly typed UploadDropzone components for specific endpoints
export const BiodataUploadDropzone = ({ onClientUploadComplete, onUploadError }: {
    onClientUploadComplete?: (res: any) => void
    onUploadError?: (error: Error) => void
}) => (
    <UploadDropzone<OurFileRouter, "biodataUploader">
        endpoint="biodataUploader"
        onClientUploadComplete={onClientUploadComplete}
        onUploadError={onUploadError}
    />
)

export const ConsentUploadDropzone = ({ onClientUploadComplete, onUploadError }: {
    onClientUploadComplete?: (res: any) => void
    onUploadError?: (error: Error) => void
}) => (
    <UploadDropzone<OurFileRouter, "consentUploader">
        endpoint="consentUploader"
        onClientUploadComplete={onClientUploadComplete}
        onUploadError={onUploadError}
    />
)
