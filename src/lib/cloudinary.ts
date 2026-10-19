/**
 * Cloudinary storage for public media (ad photos, voice notes, avatars, artisan work photos,
 * booking photos). Uploads use an unsigned preset, so no secret is stored in the app.
 *
 * ID documents from partner applications are NOT uploaded here: they stay in Firestore,
 * where security rules limit them to the applicant and admins.
 */

/** Cloudinary account settings (not secret). Fill in from the Cloudinary dashboard. */
export const CLOUDINARY_CLOUD_NAME = 'j1hpbhhy';
export const CLOUDINARY_UPLOAD_PRESET = 'cykuxii0';

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

/**
 * Uploads a photo or voice note (data: URL or Blob) and returns its public https URL.
 * Images are delivered in an automatic format/quality and at most 1280px wide.
 */
export async function uploadMedia(file: string | Blob, folder: string): Promise<string> {
  if (!isCloudinaryConfigured()) throw new Error('Media storage is not set up yet.');
  // Send as a file: Cloudinary rejects data: URLs with extra parameters such as "audio/webm;codecs=opus"
  const blob = typeof file === 'string' ? await (await fetch(file)).blob() : file;
  const extension = (blob.type.split('/')[1] || 'bin').split(';')[0];
  const form = new FormData();
  form.append('file', blob, `upload.${extension}`);
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  form.append('folder', `haraka/${folder}`);
  // "auto" accepts images and audio (Cloudinary stores audio as a video resource).
  // Slow mobile connections get a time limit and one more try.
  const send = async () => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => controller?.abort(), 45_000);
    try {
      return await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: form,
        signal: controller?.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };
  let response: Response;
  try {
    response = await send();
    if (response.status >= 500) response = await send();
  } catch {
    response = await send();
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.warn('Cloudinary upload failed', response.status, detail);
    throw new Error(`Upload failed (${response.status}): ${detail.slice(0, 200)}`);
  }
  const data: { secure_url: string; resource_type: string } = await response.json();
  return data.resource_type === 'image'
    ? data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,c_limit,w_1280/')
    : data.secure_url;
}

/** Smaller version of a Cloudinary image for lists and thumbnails; other URLs are returned unchanged. */
export function thumbnailUrl(url: string | null | undefined, width = 480): string | undefined {
  if (!url) return undefined;
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace(/\/upload\/(f_auto,q_auto,c_limit,w_\d+\/)?/, `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
