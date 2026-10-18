import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export interface ThumbnailResult {
  previewBlob: Blob;
  previewDataUrl: string;
  pageCount: number;
}

/**
 * Generates an accurate, crisp first-page thumbnail from a PDF file or buffer.
 */
export async function generatePdfThumbnail(
  fileOrBuffer: File | ArrayBuffer | Uint8Array,
  maxDimension = 800
): Promise<ThumbnailResult> {
  let data: Uint8Array;

  if (fileOrBuffer instanceof File) {
    const arrayBuffer = await fileOrBuffer.arrayBuffer();
    data = new Uint8Array(arrayBuffer);
  } else if (fileOrBuffer instanceof ArrayBuffer) {
    data = new Uint8Array(fileOrBuffer);
  } else {
    data = fileOrBuffer;
  }

  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;

  // Render Page 1
  const page = await pdfDoc.getPage(1);
  const unscaledViewport = page.getViewport({ scale: 1 });
  
  // Calculate scale to fit within maxDimension
  const scale = Math.min(
    maxDimension / unscaledViewport.width,
    maxDimension / unscaledViewport.height,
    2.0
  );

  const viewport = page.getViewport({ scale: Math.max(scale, 1.0) });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not create 2D canvas context for PDF preview');
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // Academic canvas background
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  const previewDataUrl = canvas.toDataURL('image/jpeg', 0.88);

  const previewBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate thumbnail blob'));
      },
      'image/jpeg',
      0.88
    );
  });

  return {
    previewBlob,
    previewDataUrl,
    pageCount,
  };
}

/**
 * Loads a PDF document proxy for the reader.
 */
export async function loadPdfDocument(urlOrData: string | ArrayBuffer) {
  const loadingTask = typeof urlOrData === 'string' 
    ? pdfjsLib.getDocument({ url: urlOrData, withCredentials: false })
    : pdfjsLib.getDocument({ data: new Uint8Array(urlOrData) });

  return loadingTask.promise;
}
