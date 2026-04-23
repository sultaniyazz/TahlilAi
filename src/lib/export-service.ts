// Professional export: PNG (per slide), PDF (multi-page), PPTX (native)
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';
import type { Slide, Theme } from '@/types';

const SLIDE_W = 1920;
const SLIDE_H = 1080;

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function captureSlideEl(slideEl: HTMLElement, scale = 2): Promise<HTMLCanvasElement> {
  // Force the element to render at full resolution regardless of its current scale
  return html2canvas(slideEl, {
    scale,
    backgroundColor: null,
    useCORS: true,
    logging: false,
    width: SLIDE_W,
    height: SLIDE_H,
    windowWidth: SLIDE_W,
    windowHeight: SLIDE_H,
  });
}

export async function exportSlideAsPNG(slideEl: HTMLElement, filename = 'slide.png') {
  const canvas = await captureSlideEl(slideEl, 2);
  const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png', 1));
  downloadBlob(blob, filename);
}

export async function exportSlidesAsPDF(slideEls: HTMLElement[], filename = 'presentation.pdf') {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [SLIDE_W, SLIDE_H] });
  for (let i = 0; i < slideEls.length; i++) {
    const canvas = await captureSlideEl(slideEls[i], 2);
    const img = canvas.toDataURL('image/jpeg', 0.92);
    if (i > 0) pdf.addPage([SLIDE_W, SLIDE_H], 'landscape');
    pdf.addImage(img, 'JPEG', 0, 0, SLIDE_W, SLIDE_H);
  }
  const blob = pdf.output('blob');
  downloadBlob(blob, filename);
}

// Native PPTX with editable text — best fidelity for PowerPoint users
export async function exportSlidesAsPPTX(
  slides: Slide[],
  theme: Theme,
  filename = 'presentation.pptx',
) {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inch (16:9)
  pres.title = 'Presentation';

  const SLIDE_IN_W = 13.333;
  const SLIDE_IN_H = 7.5;
  const px2in = (px: number, total: number, totalIn: number) => (px / total) * totalIn;

  for (const s of slides) {
    const slide = pres.addSlide();
    slide.background = { color: (s.background || theme.background).replace('#', '') };

    if (s.notes) slide.addNotes(s.notes);

    for (const el of s.elements) {
      const x = px2in(el.x, SLIDE_W, SLIDE_IN_W);
      const y = px2in(el.y, SLIDE_H, SLIDE_IN_H);
      const w = px2in(el.width, SLIDE_W, SLIDE_IN_W);
      const h = px2in(el.height, SLIDE_H, SLIDE_IN_H);

      if (el.type === 'shape') {
        const fill = (el.style.backgroundColor ?? theme.primary).replace('#', '');
        slide.addShape(el.shapeType === 'circle' ? 'ellipse' : 'rect', {
          x, y, w, h,
          fill: { color: fill },
          line: { type: 'none' },
          rectRadius: el.style.borderRadius ? el.style.borderRadius / 96 : 0,
        });
      } else if (el.type === 'image' && el.content) {
        try {
          slide.addImage({ data: el.content, x, y, w, h });
        } catch {
          // ignore failed images
        }
      } else {
        slide.addText(el.content || '', {
          x, y, w, h,
          fontSize: Math.max(10, Math.round((el.style.fontSize ?? 24) * 0.55)),
          fontFace: el.style.fontFamily ?? theme.fontBody,
          color: (el.style.color ?? '#FFFFFF').replace('#', ''),
          bold: Number(el.style.fontWeight ?? 400) >= 600,
          italic: el.style.fontStyle === 'italic',
          align: (el.style.textAlign ?? 'left') as 'left' | 'center' | 'right',
          valign: 'top',
          lineSpacingMultiple: el.style.lineHeight ?? 1.2,
        });
      }
    }
  }

  await pres.writeFile({ fileName: filename });
}
