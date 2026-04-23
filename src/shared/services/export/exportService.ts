import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Page } from '@/types';

export async function exportElementAsPNG(element: HTMLElement): Promise<string> {
  const canvas = await html2canvas(element, { backgroundColor: '#ffffff' });
  return canvas.toDataURL('image/png');
}

export async function exportElementAsPDF(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, { backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  const blob = pdf.output('blob');
  return blob;
}

export async function exportPagesAsPDF(pages: Page[], canvasElement: HTMLElement): Promise<Blob> {
  const pdf = new jsPDF({ unit: 'px', format: [1080, 1080] });

  for (let i = 0; i < pages.length; i++) {
    // For now, export the current canvas for each page
    // In a real implementation, you'd render each page separately
    const canvas = await html2canvas(canvasElement, { backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');

    if (i > 0) {
      pdf.addPage();
    }
    pdf.addImage(imgData, 'PNG', 0, 0, 1080, 1080);
  }

  const blob = pdf.output('blob');
  return blob;
}

export async function exportPagesAsPPTX(pages: Page[]): Promise<Blob> {
  // For now, return a placeholder
  // In a real implementation, use pptxgenjs
  const pptxContent = `PPTX export for ${pages.length} pages`;
  return new Blob([pptxContent], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
}

export async function exportElementAsSVG(element: HTMLElement): Promise<string> {
  const serialized = new XMLSerializer().serializeToString(element.cloneNode(true) as Node);
  return `data:image/svg+xml;base64,${window.btoa(serialized)}`;
}
