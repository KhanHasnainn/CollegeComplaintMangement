import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.resolve(process.cwd(), 'storage', 'uploads');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf', '.docx'];

export interface StoredFileResult {
  storedPath: string;
  originalName: string;
  mimeType: string;
}

/**
 * Ensure private upload directory exists
 */
export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Validates uploaded buffer and MIME type
 */
export function validateUpload(fileBuffer: Buffer, originalName: string, mimeType: string): { valid: boolean; error?: string } {
  if (fileBuffer.length > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }

  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Invalid file extension: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` };
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: `Invalid MIME type: ${mimeType}` };
  }

  // Basic Magic Byte / Signature verification
  if (ext === '.pdf' && !fileBuffer.subarray(0, 4).toString().startsWith('%PDF')) {
    return { valid: false, error: 'Corrupted or invalid PDF magic bytes' };
  }
  if ((ext === '.jpg' || ext === '.jpeg') && (fileBuffer[0] !== 0xff || fileBuffer[1] !== 0xd8)) {
    return { valid: false, error: 'Corrupted or invalid JPEG image header' };
  }
  if (ext === '.png' && fileBuffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    return { valid: false, error: 'Corrupted or invalid PNG image header' };
  }

  return { valid: true };
}

/**
 * Save file securely to private storage with randomized UUID filename
 */
export async function saveUploadedFile(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<StoredFileResult> {
  ensureUploadDir();

  const sanitizeName = path.basename(originalName).replace(/[^a-zA-Z0-9.-]/g, '_');
  const ext = path.extname(sanitizeName).toLowerCase();
  const randomFileName = `${randomUUID()}${ext}`;
  const targetPath = path.join(UPLOAD_DIR, randomFileName);

  // Prevent path traversal
  if (!targetPath.startsWith(UPLOAD_DIR)) {
    throw new Error('Path traversal attempt detected');
  }

  await fs.promises.writeFile(targetPath, fileBuffer);

  return {
    storedPath: randomFileName, // store relative filename
    originalName: sanitizeName,
    mimeType,
  };
}

/**
 * Read stored file safely
 */
export async function getStoredFile(relativePath: string): Promise<Buffer | null> {
  const fullPath = path.join(UPLOAD_DIR, path.basename(relativePath));
  if (!fullPath.startsWith(UPLOAD_DIR) || !fs.existsSync(fullPath)) {
    return null;
  }
  return await fs.promises.readFile(fullPath);
}
