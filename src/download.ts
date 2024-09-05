export function download(parts: BlobPart[], type: string, filename: string) {
  // Create a blob object and a URL representing it
  const blob = new Blob(parts, { type });
  const url = URL.createObjectURL(blob);

  // Create a download link
  const a = document.createElement("a");
  a.style.display = "none";
  a.download = filename;
  a.href = url;

  // Insert the link and trigger the download
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
}
