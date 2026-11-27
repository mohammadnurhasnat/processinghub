import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { jsPDF } from 'jspdf';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

export interface CompressedAttachmentResult {
  name: string;
  mimeType: string;
  size: number;
  originalSize: number;
  dataUrl: string;
  base64Data: string;
  wasCompressed: boolean;
}

const IMAGE_TARGET_BYTES = 650 * 1024; // ~650 KB target for crisp text legibility & quota savings
const IMAGE_SKIP_COMPRESS_BYTES = 320 * 1024; // Keep small clear images untouched
const PDF_SKIP_COMPRESS_BYTES = 650 * 1024; // Keep small PDFs untouched
const PDF_TARGET_TOTAL_BYTES = 850 * 1024; // Target under ~850 KB for uploaded PDFs

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('ফাইল রিড করতে সমস্যা হয়েছে'));
    reader.readAsDataURL(blob);
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('ইমেজ প্রসেসিং ব্যর্থ হয়েছে'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}

function loadImageElement(file: File): Promise<{
  width: number;
  height: number;
  drawToCanvas: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  cleanup: () => void;
}> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        drawToCanvas: (ctx, w, h) => {
          ctx.drawImage(img, 0, 0, w, h);
        },
        cleanup: () => URL.revokeObjectURL(objectUrl),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('ছবিটি লোড করা যায়নি'));
    };
    img.src = objectUrl;
  });
}

async function compressImageFile(file: File): Promise<CompressedAttachmentResult> {
  const originalDataUrl = await blobToDataUrl(file);
  const originalBase64 = originalDataUrl.includes(',')
    ? originalDataUrl.split(',')[1]
    : originalDataUrl;

  if (file.size <= IMAGE_SKIP_COMPRESS_BYTES) {
    return {
      name: file.name,
      mimeType: file.type || 'image/jpeg',
      size: file.size,
      originalSize: file.size,
      dataUrl: originalDataUrl,
      base64Data: originalBase64,
      wasCompressed: false,
    };
  }

  let loader: Awaited<ReturnType<typeof loadImageElement>> | null = null;
  try {
    loader = await loadImageElement(file);
    const { width: origW, height: origH } = loader;
    if (!origW || !origH) {
      throw new Error('Invalid image dimensions');
    }

    const dimensionCaps = [1800, 1500, 1250];
    const qualities = [0.84, 0.76, 0.68, 0.6];

    let bestBlob: Blob | null = null;

    for (const maxSide of dimensionCaps) {
      const ratio = Math.min(1, maxSide / Math.max(origW, origH));
      const targetW = Math.max(1, Math.round(origW * ratio));
      const targetH = Math.max(1, Math.round(origH * ratio));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) break;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      loader.drawToCanvas(ctx, targetW, targetH);

      for (const quality of qualities) {
        const blob = await canvasToJpegBlob(canvas, quality);
        if (!bestBlob || blob.size < bestBlob.size) {
          bestBlob = blob;
        }
        if (blob.size <= IMAGE_TARGET_BYTES) {
          bestBlob = blob;
          break;
        }
      }

      if (bestBlob && bestBlob.size <= IMAGE_TARGET_BYTES) {
        break;
      }
    }

    if (bestBlob && bestBlob.size < file.size) {
      const compressedDataUrl = await blobToDataUrl(bestBlob);
      const compressedBase64 = compressedDataUrl.includes(',')
        ? compressedDataUrl.split(',')[1]
        : compressedDataUrl;

      const baseName = file.name.replace(/\.[^.]+$/, '');
      return {
        name: `${baseName}.jpg`,
        mimeType: 'image/jpeg',
        size: bestBlob.size,
        originalSize: file.size,
        dataUrl: compressedDataUrl,
        base64Data: compressedBase64,
        wasCompressed: true,
      };
    }
  } catch (err) {
    console.warn('Image compression fallback to original:', err);
  } finally {
    loader?.cleanup();
  }

  return {
    name: file.name,
    mimeType: file.type || 'image/jpeg',
    size: file.size,
    originalSize: file.size,
    dataUrl: originalDataUrl,
    base64Data: originalBase64,
    wasCompressed: false,
  };
}

async function compressPdfFile(file: File): Promise<CompressedAttachmentResult> {
  const originalDataUrl = await blobToDataUrl(file);
  const originalBase64 = originalDataUrl.includes(',')
    ? originalDataUrl.split(',')[1]
    : originalDataUrl;

  if (file.size <= PDF_SKIP_COMPRESS_BYTES) {
    return {
      name: file.name,
      mimeType: 'application/pdf',
      size: file.size,
      originalSize: file.size,
      dataUrl: originalDataUrl,
      base64Data: originalBase64,
      wasCompressed: false,
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;

    // Limit page rendering to avoid browser memory exhaustion while covering standard docs
    const pagesToProcess = Math.min(totalPages, 20);
    if (pagesToProcess === 0) {
      throw new Error('Empty PDF');
    }

    // Balance resolution and quality based on page count so documents stay crisp & readable
    const maxWidthPx = pagesToProcess <= 3 ? 1600 : pagesToProcess <= 8 ? 1350 : 1150;
    const targetPerPageBytes = Math.max(45 * 1024, Math.floor(PDF_TARGET_TOTAL_BYTES / pagesToProcess));

    let outPdf: jsPDF | null = null;

    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(2.0, Math.max(1.0, maxWidthPx / baseViewport.width));
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: ctx,
        viewport,
        canvas,
      }).promise;

      let chosenBlob: Blob | null = null;
      for (const quality of [0.8, 0.7, 0.6, 0.52]) {
        const blob = await canvasToJpegBlob(canvas, quality);
        chosenBlob = blob;
        if (blob.size <= targetPerPageBytes) {
          break;
        }
      }

      if (!chosenBlob) {
        throw new Error('Failed to encode PDF page');
      }

      const pageImgDataUrl = await blobToDataUrl(chosenBlob);
      const orientation = baseViewport.width > baseViewport.height ? 'landscape' : 'portrait';
      const pageW = baseViewport.width;
      const pageH = baseViewport.height;

      if (!outPdf) {
        outPdf = new jsPDF({
          orientation,
          unit: 'pt',
          format: [pageW, pageH],
          compress: true,
        });
      } else {
        outPdf.addPage([pageW, pageH], orientation);
      }

      outPdf.addImage(pageImgDataUrl, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
      page.cleanup();
    }

    await pdfDoc.cleanup();

    if (outPdf) {
      const compressedBlob = outPdf.output('blob');
      if (compressedBlob.size < file.size) {
        const compressedDataUrl = await blobToDataUrl(compressedBlob);
        const compressedBase64 = compressedDataUrl.includes(',')
          ? compressedDataUrl.split(',')[1]
          : compressedDataUrl;

        return {
          name: file.name,
          mimeType: 'application/pdf',
          size: compressedBlob.size,
          originalSize: file.size,
          dataUrl: compressedDataUrl,
          base64Data: compressedBase64,
          wasCompressed: true,
        };
      }
    }
  } catch (err) {
    console.warn('PDF compression fallback to original:', err);
  }

  return {
    name: file.name,
    mimeType: 'application/pdf',
    size: file.size,
    originalSize: file.size,
    dataUrl: originalDataUrl,
    base64Data: originalBase64,
    wasCompressed: false,
  };
}

export async function compressChatAttachment(file: File): Promise<CompressedAttachmentResult> {
  const mimeType =
    file.type ||
    (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');

  if (mimeType.startsWith('image/')) {
    return compressImageFile(file);
  }

  if (mimeType === 'application/pdf') {
    return compressPdfFile(file);
  }

  const dataUrl = await blobToDataUrl(file);
  const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return {
    name: file.name,
    mimeType,
    size: file.size,
    originalSize: file.size,
    dataUrl,
    base64Data,
    wasCompressed: false,
  };
}

export interface TargetPdfCompressionResult {
  fileName: string;
  blob: Blob;
  url: string;
  finalSizeBytes: number;
  originalTotalBytes: number;
  pageCount: number;
}

interface SourcePageCanvas {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

async function extractPagesFromFiles(files: File[]): Promise<SourcePageCanvas[]> {
  const pages: SourcePageCanvas[] = [];

  for (const file of files) {
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;
      const numPages = Math.min(pdfDoc.numPages, 25);

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const baseVp = page.getViewport({ scale: 1 });
        const targetMaxSide = 2000;
        const scale = Math.min(2.4, Math.max(1.1, targetMaxSide / Math.max(baseVp.width, baseVp.height)));
        const vp = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(vp.width);
        canvas.height = Math.round(vp.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport: vp,
          canvas,
        }).promise;

        pages.push({
          canvas,
          width: canvas.width,
          height: canvas.height,
        });
        page.cleanup();
      }
      await pdfDoc.cleanup();
    } else {
      // Any image format (JPG, PNG, WEBP, GIF, BMP, AVIF, etc.)
      const loader = await loadImageElement(file);
      try {
        const origW = loader.width || 1200;
        const origH = loader.height || 1600;
        const maxSide = 2200;
        const ratio = Math.min(1.5, maxSide / Math.max(origW, origH));
        const targetW = Math.max(400, Math.round(origW * ratio));
        const targetH = Math.max(400, Math.round(origH * ratio));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          loader.drawToCanvas(ctx, targetW, targetH);
          pages.push({
            canvas,
            width: targetW,
            height: targetH,
          });
        }
      } finally {
        loader.cleanup();
      }
    }
  }

  return pages;
}

async function buildPdfAtScaleAndQuality(
  sourcePages: SourcePageCanvas[],
  scaleFactor: number,
  jpegQuality: number
): Promise<ArrayBuffer> {
  let doc: jsPDF | null = null;

  for (const src of sourcePages) {
    const w = Math.max(200, Math.round(src.width * scaleFactor));
    const h = Math.max(200, Math.round(src.height * scaleFactor));

    let workCanvas = src.canvas;
    if (scaleFactor < 0.99) {
      workCanvas = document.createElement('canvas');
      workCanvas.width = w;
      workCanvas.height = h;
      const ctx = workCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(src.canvas, 0, 0, w, h);
      }
    }

    const jpegBlob = await canvasToJpegBlob(workCanvas, jpegQuality);
    const jpegDataUrl = await blobToDataUrl(jpegBlob);

    // Standard A4-proportioned points layout
    const isLandscape = w > h;
    const orientation = isLandscape ? 'landscape' : 'portrait';
    const pdfPageW = isLandscape ? 841.89 : 595.28;
    const pdfPageH = isLandscape ? 595.28 : 841.89;

    // Fit image inside page maintaining aspect ratio with clean margin
    const imgRatio = Math.min(pdfPageW / w, pdfPageH / h);
    const drawW = w * imgRatio;
    const drawH = h * imgRatio;
    const offsetX = (pdfPageW - drawW) / 2;
    const offsetY = (pdfPageH - drawH) / 2;

    if (!doc) {
      doc = new jsPDF({
        orientation,
        unit: 'pt',
        format: 'a4',
        compress: true,
      });
    } else {
      doc.addPage('a4', orientation);
    }

    doc.addImage(jpegDataUrl, 'JPEG', offsetX, offsetY, drawW, drawH, undefined, 'FAST');
  }

  if (!doc) {
    throw new Error('কোনো পৃষ্ঠা প্রসেস করা যায়নি');
  }

  return doc.output('arraybuffer');
}

function padPdfBufferToTargetRange(
  pdfBuffer: ArrayBuffer,
  minBytes: number,
  targetBytes: number
): Blob {
  if (pdfBuffer.byteLength >= minBytes) {
    return new Blob([pdfBuffer], { type: 'application/pdf' });
  }

  const needed = Math.max(0, targetBytes - pdfBuffer.byteLength);
  const header = '\n% IVAC-STANDARD-PDF-CALIBRATION-BLOCK\n%';
  const footer = '\n';
  const fillLen = Math.max(0, needed - header.length - footer.length);
  const paddingChunk = '0123456789ABCDEF'.repeat(Math.ceil(fillLen / 16)).slice(0, fillLen);
  const commentBlock = new TextEncoder().encode(header + paddingChunk + footer);

  return new Blob([pdfBuffer, commentBlock], { type: 'application/pdf' });
}

export async function convertFilesToTargetPdf350To400KB(
  files: File[]
): Promise<TargetPdfCompressionResult> {
  if (!files || files.length === 0) {
    throw new Error('অন্তত একটি ছবি বা পিডিএফ ফাইল নির্বাচন করুন');
  }

  const MIN_TARGET_BYTES = 352 * 1024; // 352 KB
  const IDEAL_TARGET_BYTES = 376 * 1024; // ~376 KB
  const MAX_TARGET_BYTES = 398 * 1024; // 398 KB (< 400 KB)

  const originalTotalBytes = files.reduce((acc, f) => acc + f.size, 0);
  const sourcePages = await extractPagesFromFiles(files);

  if (sourcePages.length === 0) {
    throw new Error('ফাইল থেকে কোনো ছবি বা পৃষ্ঠা পড়া যায়নি');
  }

  // Candidate profiles ordered from highest quality down to compact
  const profiles: { scale: number; quality: number }[] = [
    { scale: 1.0, quality: 0.92 },
    { scale: 1.0, quality: 0.82 },
    { scale: 0.9, quality: 0.75 },
    { scale: 0.82, quality: 0.68 },
    { scale: 0.74, quality: 0.60 },
    { scale: 0.65, quality: 0.52 },
    { scale: 0.56, quality: 0.45 },
    { scale: 0.48, quality: 0.38 },
    { scale: 0.40, quality: 0.32 },
  ];

  let chosenBuffer: ArrayBuffer | null = null;

  for (const prof of profiles) {
    const buf = await buildPdfAtScaleAndQuality(sourcePages, prof.scale, prof.quality);
    chosenBuffer = buf;

    if (buf.byteLength <= MAX_TARGET_BYTES) {
      // If it's slightly below 350 KB, try binary searching quality upward if this wasn't the first profile
      if (buf.byteLength < MIN_TARGET_BYTES && prof !== profiles[0]) {
        let lowQ = prof.quality;
        let highQ = Math.min(0.96, prof.quality + 0.18);
        for (let step = 0; step < 3; step++) {
          const midQ = (lowQ + highQ) / 2;
          const testBuf = await buildPdfAtScaleAndQuality(sourcePages, prof.scale, midQ);
          if (testBuf.byteLength <= MAX_TARGET_BYTES) {
            chosenBuffer = testBuf;
            lowQ = midQ;
            if (testBuf.byteLength >= MIN_TARGET_BYTES) break;
          } else {
            highQ = midQ;
          }
        }
      }
      break;
    }
  }

  if (!chosenBuffer) {
    throw new Error('পিডিএফ কম্প্রেস করতে সমস্যা হয়েছে');
  }

  const finalBlob = padPdfBufferToTargetRange(
    chosenBuffer,
    MIN_TARGET_BYTES,
    IDEAL_TARGET_BYTES
  );

  const baseName = files[0].name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_\-\u0980-\u09FF]/g, '_');
  const fileName = `${baseName || 'document'}_compressed_${Math.round(finalBlob.size / 1024)}KB.pdf`;
  const url = URL.createObjectURL(finalBlob);

  return {
    fileName,
    blob: finalBlob,
    url,
    finalSizeBytes: finalBlob.size,
    originalTotalBytes,
    pageCount: sourcePages.length,
  };
}

