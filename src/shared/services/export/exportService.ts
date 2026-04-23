import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';
import type { Page, CanvasSettings } from '@/types';

const SLIDE_W = 1920;
const SLIDE_H = 1080;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadFile(blob: Blob, filename: string) {
  downloadBlob(blob, filename);
}

export function estimateFileSize(pages: Page[], format: 'png' | 'pdf' | 'pptx'): string {
  const base = pages.length;
  const kb = format === 'pdf' ? base * 280 : format === 'pptx' ? base * 320 : base * 180;
  return kb < 1024 ? `~${kb} KB` : `~${(kb / 1024).toFixed(1)} MB`;
}

async function snapshotElement(element: HTMLElement, scale = 2): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    backgroundColor: null,
    scale,
    useCORS: true,
    logging: false,
  });
}

export async function exportAsPNG(element: HTMLElement, filename = 'slide.png') {
  const canvas = await snapshotElement(element);
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, filename);
  }, 'image/png');
}

export async function exportPagesAsPNG(slideElements: HTMLElement[], baseName = 'slide') {
  for (let i = 0; i < slideElements.length; i++) {
    const canvas = await snapshotElement(slideElements[i]);
    await new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `${baseName}-${i + 1}.png`);
        resolve();
      }, 'image/png');
    });
  }
}

export async function exportPagesAsPDF(
  slideElements: HTMLElement[],
  filename = 'presentation.pdf',
  canvasSettings?: CanvasSettings
) {
  const w = canvasSettings?.width ?? SLIDE_W;
  const h = canvasSettings?.height ?? SLIDE_H;

  const pdf = new jsPDF({
    unit: 'px',
    format: [w, h],
    orientation: w >= h ? 'landscape' : 'portrait',
    hotfixes: ['px_scaling'],
  });

  for (let i = 0; i < slideElements.length; i++) {
    const canvas = await snapshotElement(slideElements[i]);
    const imgData = canvas.toDataURL('image/png');
    if (i > 0) pdf.addPage([w, h], w >= h ? 'landscape' : 'portrait');
    pdf.addImage(imgData, 'PNG', 0, 0, w, h, undefined, 'FAST');
  }

  pdf.save(filename);
}

export async function exportPagesAsPPTX(
  pages: Page[],
  slideElements: HTMLElement[],
  filename = 'presentation.pptx',
  canvasSettings?: CanvasSettings
) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = 'AI Presentation';

  const w = canvasSettings?.width ?? SLIDE_W;
  const h = canvasSettings?.height ?? SLIDE_H;
  const ratio = h / w;
  const slideW = 13.333;
  const slideH = slideW * ratio;

  pptx.defineLayout({ name: 'CUSTOM', width: slideW, height: slideH });
  pptx.layout = 'CUSTOM';

  for (let i = 0; i < slideElements.length; i++) {
    const slide = pptx.addSlide();
    const canvas = await snapshotElement(slideElements[i]);
    const imgData = canvas.toDataURL('image/png');

    slide.background = { color: '0F0F11' };
    slide.addImage({
      data: imgData,
      x: 0,
      y: 0,
      w: slideW,
      h: slideH,
    });

    const page = pages[i];
    if (page?.heading) {
      slide.addNotes(`${page.heading}\n\n${page.content || ''}`);
    }
  }

  await pptx.writeFile({ fileName: filename });
}
