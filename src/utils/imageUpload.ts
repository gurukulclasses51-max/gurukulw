export async function uploadImageFile(file: File): Promise<string> {
  return uploadMediaFile(file);
}

export async function uploadMediaFile(file: File): Promise<string> {
  const dataUrl = await prepareUploadDataUrl(file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, dataUrl }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Upload failed.');
  }
  return String(data.file_url);
}

async function prepareUploadDataUrl(file: File): Promise<string> {
  const rawDataUrl = await readAsDataUrl(file);

  // Pass PDFs, SVGs, GIFs, and compact files through untouched
  if (
    file.type === 'application/pdf' ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif' ||
    !file.type.startsWith('image/') ||
    file.size <= 700 * 1024
  ) {
    return rawDataUrl;
  }

  // Compress large raster photos cleanly so uploads stay within Vercel's serverless body limits
  try {
    const img = await loadImage(rawDataUrl);
    const maxDim = 1600;
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (width > maxDim || height > maxDim) {
      if (width >= height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return rawDataUrl;

    ctx.drawImage(img, 0, 0, width, height);
    const outType = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
    const compressed = canvas.toDataURL(outType, 0.84);
    return compressed.length < rawDataUrl.length ? compressed : rawDataUrl;
  } catch {
    return rawDataUrl;
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read selected file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Invalid image file.'));
    img.src = src;
  });
}
