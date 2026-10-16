/**
 * Cloudinary storage for public media (ad photos, voice notes, avatars, artisan work photos,
 * booking photos). Uploads use an unsigned preset, so no secret is stored in the app.
 *
 * ID documents from partner applications are NOT uploaded here: they stay in Firestore,
 * where security rules limit them to the applicant and admins.
 */

/** Cloudinary account settings (not secret). Fill in from the Cloudinary dashboard. */
export const CLOUDINARY_CLOUD_NAME = '';
export const CLOUDINARY_UPLOAD_PRESET = '';

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

/**
 * Uploads a photo or voice note (data: URL or Blob) and returns its public https URL.
 * Images are delivered in an automatic format/quality and at most 1280px wide.
 */
export async function uploadMedia(file: string | Blob, folder: string): Promise<string> {
  if (!isCloudinaryConfigured()) throw new Error('Media storage is not set up yet.');
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  form.append('folder', `haraka/${folder}`);
  // "auto" accepts images and audio (Cloudinary stores audio as a video resource)
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) {
    console.warn('Cloudinary upload failed', response.status, await response.text().catch(() => ''));
    throw new Error('Upload failed. Check your connection and try again.');
  }
  const data: { secure_url: string; resource_type: string } = await response.json();
  return data.resource_type === 'image'
    ? data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,c_limit,w_1280/')
    : data.secure_url;
}

/** Smaller version of a Cloudinary image for lists and thumbnails; other URLs are returned unchanged. */
export function thumbnailUrl(url: string, width = 480): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace(/\/upload\/(f_auto,q_auto,c_limit,w_\d+\/)?/, `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
