// Professional export: PNG (per slide), PDF (multi-page), PPTX (native)
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';
import type { Slide, Theme, SlideElement } from '@/types';

const SLIDE_W = 1920;
const SLIDE_H = 1080;
const SLIDE_IN_W = 13.333;
const SLIDE_IN_H = 7.5;

const px2in = (px: number, total: number, totalIn: number) => (px / total) * totalIn;
const cleanColor = (color: string) => color.replace('#', '');

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
  downloadBlob(pdf.output('blob'), filename);
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function addTitleSlide(slide: pptxgen.Slide, s: Slide, theme: Theme) {
  slide.addShape('rect', {
    x: 0, y: 0, w: SLIDE_IN_W, h: SLIDE_IN_H,
    fill: { color: cleanColor(s.background || theme.background) },
    line: { type: 'none' },
  });

  slide.addShape('rect', {
    x: 0, y: 0, w: 0.08, h: SLIDE_IN_H,
    fill: { color: cleanColor(theme.primary) },
    line: { type: 'none' },
  });

  slide.addShape('ellipse', {
    x: SLIDE_IN_W - 2.5, y: -1, w: 3.5, h: 3.5,
    fill: { color: cleanColor(theme.primary), transparency: 80 },
    line: { type: 'none' },
  });

  slide.addShape('ellipse', {
    x: -1, y: SLIDE_IN_H - 2, w: 3, h: 3,
    fill: { color: cleanColor(theme.accent), transparency: 85 },
    line: { type: 'none' },
  });

  const titleEl = s.elements.find((e: SlideElement) => e.type === 'heading' || e.type === 'text');
  const subtitleEl = s.elements.find((e: SlideElement) => e.type === 'subheading');

  slide.addText(titleEl?.content || s.title || '', {
    x: 0.8, y: 2.2, w: SLIDE_IN_W - 1.6, h: 1.8,
    fontSize: 54,
    fontFace: theme.fontHeading,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    valign: 'middle',
    lineSpacingMultiple: 1.1,
  });

  if (subtitleEl?.content) {
    slide.addText(subtitleEl.content, {
      x: 1.5, y: 4.2, w: SLIDE_IN_W - 3, h: 0.8,
      fontSize: 22,
      fontFace: theme.fontBody,
      color: cleanColor(theme.accent),
      align: 'center',
      valign: 'middle',
    });
  }

  slide.addShape('rect', {
    x: 2, y: 6.8, w: SLIDE_IN_W - 4, h: 0.03,
    fill: { color: cleanColor(theme.primary), transparency: 40 },
    line: { type: 'none' },
  });
}

function addContentSlide(slide: pptxgen.Slide, s: Slide, theme: Theme) {
  slide.addShape('rect', {
    x: 0, y: 0, w: SLIDE_IN_W, h: 1.1,
    fill: { color: cleanColor(theme.primary) },
    line: { type: 'none' },
  });

  slide.addShape('rect', {
    x: SLIDE_IN_W - 1.5, y: 0, w: 1.5, h: 1.1,
    fill: { color: cleanColor(theme.accent), transparency: 30 },
    line: { type: 'none' },
  });

  const headingEl = s.elements.find((e: SlideElement) => e.type === 'heading');
  slide.addText(headingEl?.content || s.title || '', {
    x: 0.4, y: 0.15, w: SLIDE_IN_W - 2, h: 0.8,
    fontSize: 28,
    fontFace: theme.fontHeading,
    color: 'FFFFFF',
    bold: true,
    valign: 'middle',
  });

  const bulletEls = s.elements.filter((e: SlideElement) =>
    e.type === 'bullet' || e.type === 'text' || e.type === 'subheading'
  );
  const startY = 1.4;
  const rowH = (SLIDE_IN_H - startY - 0.4) / Math.max(bulletEls.length, 1);

  bulletEls.forEach((el: SlideElement, i: number) => {
    const y = startY + i * rowH;

    slide.addShape('ellipse', {
      x: 0.35, y: y + rowH / 2 - 0.08, w: 0.16, h: 0.16,
      fill: { color: cleanColor(theme.accent) },
      line: { type: 'none' },
    });

    const fontSize = el.style.fontSize ? Math.max(12, Math.round((el.style.fontSize) * 0.6)) : 16;
    slide.addText(el.content || '', {
      x: 0.65, y, w: SLIDE_IN_W - 1, h: rowH,
      fontSize: fontSize,
      fontFace: el.style.fontFamily ?? theme.fontBody,
      color: cleanColor(el.style.color ?? '#E2E8F0'),
      bold: Number(el.style.fontWeight ?? 400) >= 600,
      italic: el.style.fontStyle === 'italic',
      valign: 'middle',
      lineSpacingMultiple: 1.3,
    });
  });

  slide.addShape('rect', {
    x: 0, y: SLIDE_IN_H - 0.08, w: SLIDE_IN_W, h: 0.08,
    fill: { color: cleanColor(theme.accent) },
    line: { type: 'none' },
  });
}

function addTwoColumnSlide(slide: pptxgen.Slide, s: Slide, theme: Theme) {
  slide.addShape('rect', {
    x: 0, y: 0, w: SLIDE_IN_W, h: 1.1,
    fill: { color: cleanColor(theme.secondary) },
    line: { type: 'none' },
  });

  const headingEl = s.elements.find((e: SlideElement) => e.type === 'heading');
  slide.addText(headingEl?.content || s.title || '', {
    x: 0.4, y: 0.15, w: SLIDE_IN_W - 0.8, h: 0.8,
    fontSize: 28,
    fontFace: theme.fontHeading,
    color: 'FFFFFF',
    bold: true,
    valign: 'middle',
  });

  slide.addShape('rect', {
    x: SLIDE_IN_W / 2 - 0.02, y: 1.3, w: 0.04, h: SLIDE_IN_H - 1.7,
    fill: { color: cleanColor(theme.primary), transparency: 50 },
    line: { type: 'none' },
  });

  const contentEls = s.elements.filter((e: SlideElement) =>
    e.type === 'bullet' || e.type === 'text'
  );
  const half = Math.ceil(contentEls.length / 2);
  const leftEls = contentEls.slice(0, half);
  const rightEls = contentEls.slice(half);
  const colW = SLIDE_IN_W / 2 - 0.5;
  const startY = 1.4;

  [leftEls, rightEls].forEach((colEls: SlideElement[], col: number) => {
    const baseX = col === 0 ? 0.3 : SLIDE_IN_W / 2 + 0.3;
    const rowH = (SLIDE_IN_H - startY - 0.4) / Math.max(colEls.length, 1);

    colEls.forEach((el: SlideElement, i: number) => {
      const y = startY + i * rowH;

      slide.addShape('rect', {
        x: baseX, y: y + 0.15, w: 0.06, h: rowH * 0.6,
        fill: { color: cleanColor(col === 0 ? theme.primary : theme.accent) },
        line: { type: 'none' },
      });

      slide.addText(el.content || '', {
        x: baseX + 0.15, y, w: colW - 0.15, h: rowH,
        fontSize: el.style.fontSize ? Math.max(12, Math.round((el.style.fontSize) * 0.6)) : 14,
        fontFace: theme.fontBody,
        color: cleanColor(el.style.color ?? '#E2E8F0'),
        valign: 'middle',
        lineSpacingMultiple: 1.2,
      });
    });
  });
}

function addStatsSlide(slide: pptxgen.Slide, s: Slide, theme: Theme) {
  slide.addShape('rect', {
    x: 0, y: 0, w: SLIDE_IN_W, h: 1.1,
    fill: { color: cleanColor(theme.primary) },
    line: { type: 'none' },
  });

  const headingEl = s.elements.find((e: SlideElement) => e.type === 'heading');
  slide.addText(headingEl?.content || s.title || '', {
    x: 0.4, y: 0.15, w: SLIDE_IN_W - 0.8, h: 0.8,
    fontSize: 28,
    fontFace: theme.fontHeading,
    color: 'FFFFFF',
    bold: true,
    valign: 'middle',
    align: 'center',
  });

  const statEls = s.elements.filter((e: SlideElement) =>
    e.type === 'bullet' || e.type === 'text'
  );
  const cardW = (SLIDE_IN_W - 1) / Math.max(statEls.length, 1);
  const cardColors = [theme.primary, theme.secondary, theme.accent];

  statEls.forEach((el: SlideElement, i: number) => {
    const x = 0.5 + i * cardW;
    const color = cardColors[i % cardColors.length];

    slide.addShape('rect', {
      x, y: 1.5, w: cardW - 0.3, h: 4.5,
      fill: { color: cleanColor(color), transparency: 15 },
      line: { color: cleanColor(color), pt: 1, transparency: 40 },
      rectRadius: 0.1,
    });

    slide.addShape('rect', {
      x, y: 1.5, w: cardW - 0.3, h: 0.12,
      fill: { color: cleanColor(color) },
      line: { type: 'none' },
      rectRadius: 0.05,
    });

    slide.addText(el.content || '', {
      x: x + 0.15, y: 1.7, w: cardW - 0.6, h: 4.1,
      fontSize: el.style.fontSize ? Math.max(12, Math.round((el.style.fontSize) * 0.6)) : 14,
      fontFace: theme.fontBody,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
      lineSpacingMultiple: 1.3,
    });
  });
}

function addQuoteSlide(slide: pptxgen.Slide, s: Slide, theme: Theme) {
  slide.addShape('rect', {
    x: 0, y: 0, w: SLIDE_IN_W, h: SLIDE_IN_H,
    fill: { color: cleanColor(theme.primary), transparency: 85 },
    line: { type: 'none' },
  });

  slide.addShape('rect', {
    x: 0.5, y: 1.5, w: 0.12, h: SLIDE_IN_H - 3,
    fill: { color: cleanColor(theme.accent) },
    line: { type: 'none' },
  });

  slide.addText('"', {
    x: 0.3, y: 0.5, w: 2, h: 1.5,
    fontSize: 120,
    fontFace: theme.fontHeading,
    color: cleanColor(theme.accent),
    transparency: 30,
  });

  const quoteEl = s.elements.find((e: SlideElement) =>
    e.type === 'text' || e.type === 'bullet'
  );
  slide.addText(quoteEl?.content || s.title || '', {
    x: 1, y: 1.8, w: SLIDE_IN_W - 2, h: 3.5,
    fontSize: 28,
    fontFace: theme.fontHeading,
    color: 'FFFFFF',
    italic: true,
    align: 'center',
    valign: 'middle',
    lineSpacingMultiple: 1.4,
  });

  slide.addShape('rect', {
    x: 2, y: 5.8, w: SLIDE_IN_W - 4, h: 0.04,
    fill: { color: cleanColor(theme.accent) },
    line: { type: 'none' },
  });
}

function addClosingSlide(slide: pptxgen.Slide, s: Slide, theme: Theme) {
  slide.addShape('rect', {
    x: 0, y: 0, w: SLIDE_IN_W, h: SLIDE_IN_H,
    fill: { color: cleanColor(s.background || theme.background) },
    line: { type: 'none' },
  });

  slide.addShape('ellipse', {
    x: -1.5, y: -1.5, w: 5, h: 5,
    fill: { color: cleanColor(theme.primary), transparency: 70 },
    line: { type: 'none' },
  });

  slide.addShape('ellipse', {
    x: SLIDE_IN_W - 3.5, y: SLIDE_IN_H - 3.5, w: 5, h: 5,
    fill: { color: cleanColor(theme.secondary), transparency: 70 },
    line: { type: 'none' },
  });

  slide.addShape('rect', {
    x: SLIDE_IN_W / 2 - 1.5, y: 3.3, w: 3, h: 0.06,
    fill: { color: cleanColor(theme.accent) },
    line: { type: 'none' },
  });

  const headingEl = s.elements.find((e: SlideElement) =>
    e.type === 'heading' || e.type === 'text'
  );
  slide.addText(headingEl?.content || s.title || 'Rahmat!', {
    x: 0.5, y: 2.2, w: SLIDE_IN_W - 1, h: 1.2,
    fontSize: 56,
    fontFace: theme.fontHeading,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  const subEl = s.elements.find((e: SlideElement) =>
    e.type === 'subheading' || e.type === 'bullet'
  );
  if (subEl?.content) {
    slide.addText(subEl.content, {
      x: 1.5, y: 3.6, w: SLIDE_IN_W - 3, h: 0.8,
      fontSize: 20,
      fontFace: theme.fontBody,
      color: cleanColor(theme.accent),
      align: 'center',
      valign: 'middle',
    });
  }
}

// ─── Main export function ─────────────────────────────────────────────────────

export async function exportSlidesAsPPTX(
  slides: Slide[],
  theme: Theme,
  filename = 'presentation.pptx',
) {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = filename.replace('.pptx', '');
  pres.author = 'InfographAI';

  for (const s of slides) {
    const slide = pres.addSlide();
    slide.background = { color: cleanColor(s.background || theme.background) };
    if (s.notes) slide.addNotes(s.notes);

    switch (s.layout) {
      case 'title':
        addTitleSlide(slide, s, theme);
        break;
      case 'two-column':
        addTwoColumnSlide(slide, s, theme);
        break;
      case 'stats':
        addStatsSlide(slide, s, theme);
        break;
      case 'quote':
        addQuoteSlide(slide, s, theme);
        break;
      case 'closing':
        addClosingSlide(slide, s, theme);
        break;
      default:
        addContentSlide(slide, s, theme);
    }

    // Shapes and images
    for (const el of s.elements) {
      if (el.type === 'shape') {
        const x = px2in(el.x, SLIDE_W, SLIDE_IN_W);
        const y = px2in(el.y, SLIDE_H, SLIDE_IN_H);
        const w = px2in(el.width, SLIDE_W, SLIDE_IN_W);
        const h = px2in(el.height, SLIDE_H, SLIDE_IN_H);

        slide.addShape(el.shapeType === 'circle' ? 'ellipse' : 'rect', {
          x, y, w, h,
          fill: { color: cleanColor(el.style.backgroundColor ?? theme.primary) },
          line: { type: 'none' },
          rectRadius: el.style.borderRadius ? el.style.borderRadius / 96 : 0,
        });
      } else if (el.type === 'image' && el.content) {
        const x = px2in(el.x, SLIDE_W, SLIDE_IN_W);
        const y = px2in(el.y, SLIDE_H, SLIDE_IN_H);
        const w = px2in(el.width, SLIDE_W, SLIDE_IN_W);
        const h = px2in(el.height, SLIDE_H, SLIDE_IN_H);
        try {
          // Handle both data URLs and regular URLs
          if (el.content.startsWith('data:') || el.content.startsWith('blob:')) {
            slide.addImage({ data: el.content, x, y, w, h });
          } else {
            // For regular URLs, use them as-is - pptxgenjs will handle them
            slide.addImage({ path: el.content, x, y, w, h });
          }
        } catch (err) {
          console.warn('Failed to add image:', err);
          // Add placeholder rectangle if image fails
          slide.addShape('rect', {
            x, y, w, h,
            fill: { color: 'CCCCCC' },
            line: { color: '999999', pt: 1 },
          });
        }
      }
    }

    // Add custom text elements that weren't handled by layout functions
    // Only add 'text' type elements; heading/subheading are handled by layout functions
    const customTexts = s.elements.filter((el: SlideElement) => el.type === 'text');

    for (const el of customTexts) {
      const x = px2in(el.x, SLIDE_W, SLIDE_IN_W);
      const y = px2in(el.y, SLIDE_H, SLIDE_IN_H);
      const w = px2in(el.width, SLIDE_W, SLIDE_IN_W);
      const h = px2in(el.height, SLIDE_H, SLIDE_IN_H);

      slide.addText(el.content || '', {
        x, y, w, h,
        fontSize: Math.max(10, (el.style.fontSize ?? 18) * 0.75),
        fontFace: el.style.fontFamily ?? theme.fontBody,
        color: cleanColor(el.style.color ?? '#E2E8F0'),
        bold: Number(el.style.fontWeight ?? 400) >= 600,
        italic: el.style.fontStyle === 'italic',
        align: (el.style.textAlign ?? 'left') as 'left' | 'center' | 'right',
        valign: 'top',
        lineSpacingMultiple: 1.2,
      });
    }
  }

  await pres.writeFile({ fileName: filename });
}