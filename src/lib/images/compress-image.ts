/** Downscale/compress camera photos before Server Action upload. */
export async function compressImageForUpload(
  file: File,
  options?: { maxEdge?: number; quality?: number; maxBytes?: number }
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const maxEdge = options?.maxEdge ?? 1600;
  const quality = options?.quality ?? 0.72;
  const maxBytes = options?.maxBytes ?? 2.5 * 1024 * 1024;

  if (file.size <= maxBytes && file.size <= 1.2 * 1024 * 1024) {
    // Still resize huge-dimension small files? Skip if already small enough.
    if (file.size <= 900 * 1024) return file;
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
    if (!blob) return file;

    const name = file.name.replace(/\.\w+$/, "") || "beleg";
    return new File([blob], `${name}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
