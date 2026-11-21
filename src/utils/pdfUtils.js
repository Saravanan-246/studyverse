export function encodePdfUrl(fileUrl) {
  return encodeURI(fileUrl).replace(/&/g, "%26");
}

export function downloadSinglePdf(fileUrl, fileName) {
  const link = document.createElement("a");
  link.href = encodePdfUrl(fileUrl);
  link.download = fileName || fileUrl.split("/").pop() || "document.pdf";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadBatchPdfs(items, onProgress) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (onProgress) onProgress(i + 1, items.length, item.title);
    downloadSinglePdf(item.fileUrl, item.fileName);
    if (i < items.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 420));
    }
  }
}