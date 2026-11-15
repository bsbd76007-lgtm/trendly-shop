const MAX_SIDE = 1600;

export async function resizeToJpeg(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose a JPG, PNG or WebP photo");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("This photo format can't be opened here. Save it as JPG first.");
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Can't process the photo");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.86);
}
