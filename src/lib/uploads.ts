import { mkdir, writeFile, unlink } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads')
export const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx'])

function buildStoredFileName(prefix: string, extension: string) {
  const safePrefix = prefix.replace(/[^a-z0-9-_]/gi, '').toLowerCase() || 'file'
  return `${safePrefix}-${randomUUID()}${extension}`
}

export async function saveUploadedFile(applicationId: string, file: File, prefix: string) {
  const uploadsDir = path.join(UPLOAD_ROOT, applicationId)
  await mkdir(uploadsDir, { recursive: true })

  const extension = path.extname(file.name ?? '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported file type: ${extension || 'unknown'}`)
  }

  const fileName = buildStoredFileName(prefix, extension)
  const filePath = path.join(uploadsDir, fileName)
  const arrayBuffer = await file.arrayBuffer()
  await writeFile(filePath, Buffer.from(arrayBuffer))

  return `/uploads/${applicationId}/${fileName}`
}

export async function deleteUploadedFile(filePath?: string | null) {
  if (!filePath) {
    return
  }

  const normalized = filePath.replace(/^\/+/, '')
  const absolutePath = path.join(process.cwd(), 'public', normalized)

  try {
    await unlink(absolutePath)
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      throw error
    }
  }
}
