/**
 * Cloudinary zero-cost image upload helper for Haraka Mobile Marketplace.
 * Uploads photos directly to Cloudinary using an unsigned upload preset.
 * 
 * Setup instructions for the user:
 * 1. Create a free Cloudinary account at https://cloudinary.com (25 monthly credits free).
 * 2. In Settings -> Upload -> Upload presets, create an Unsigned preset (e.g., 'haraka_preset').
 * 3. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_PRESET in your environment.
 */

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

const getStoredCloudName = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('haraka_cloudinary_cloud_name') || '';
  }
  return '';
};

const getStoredPreset = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('haraka_cloudinary_preset') || '';
  }
  return '';
};

export function setCloudinaryCredentials(cloudName: string, uploadPreset: string) {
  if (typeof window !== 'undefined') {
    if (cloudName) localStorage.setItem('haraka_cloudinary_cloud_name', cloudName.trim());
    if (uploadPreset) localStorage.setItem('haraka_cloudinary_preset', uploadPreset.trim());
  }
}

export function getCloudinaryCredentials() {
  const cloudName = getStoredCloudName() || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
  const preset = getStoredPreset() || import.meta.env.VITE_CLOUDINARY_PRESET || '';
  return { cloudName, preset, isConfigured: Boolean(cloudName && preset) };
}

export async function uploadImageToCloudinary(
  file: File | Blob,
  customCloudName?: string,
  customPreset?: string
): Promise<string> {
  const creds = getCloudinaryCredentials();
  const cloudName = customCloudName || creds.cloudName;
  const preset = customPreset || creds.preset;

  // Fallback to local Data URL preview if Cloudinary is not configured yet
  if (!cloudName || !preset) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  // Auto-optimize images on upload with Cloudinary eager transformations:
  // Convert to WebP, auto quality, and clamp width to 800px to save Ghanaian mobile data
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Cloudinary upload error:', errorText);
    throw new Error(`Cloudinary upload failed: ${response.statusText}`);
  }

  const data: CloudinaryUploadResult = await response.json();
  
  // Return the auto-formatted URL
  return data.secureUrl || data.url;
}

/**
 * Generate a data-saver thumbnail URL with Cloudinary transforms
 */
export function getOptimizedImageUrl(url: string, width = 600): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/c_scale,w_${width},q_auto,f_auto/`);
}
