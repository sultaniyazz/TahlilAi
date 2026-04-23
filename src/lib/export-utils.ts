// Export utilities for high-resolution infographic export
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ExportOptions, CanvasSettings, Page } from '@/types';

/**
 * Export infographic as high-resolution PNG
 */
export async function exportAsPNG(
  canvasElement: HTMLElement,
  options: ExportOptions,
  canvasSettings: CanvasSettings
): Promise<string> {
  const { dpi = 300, quality = 1 } = options;

  // Calculate scale factor for high DPI
  const scale = dpi / 72; // 72 is the base DPI for web

  // Create canvas with high resolution
  const canvas = await html2canvas(canvasElement, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: canvasSettings.backgroundColor,
    logging: false,
    onclone: (clonedDoc) => {
      // Ensure all fonts are loaded in cloned document
      const clonedElement = clonedDoc.body.querySelector('[data-infographic-canvas]');
      if (clonedElement) {
        (clonedElement as HTMLElement).style.transform = 'none';
        (clonedElement as HTMLElement).style.zoom = '1';
      }
    },
  });

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      },
      'image/png',
      quality
    );
  });
}

/**
 * Export presentation pages as PDF
 */
export async function exportPagesAsPDF(
  pages: Page[],
  canvasElement: HTMLElement,
  options: ExportOptions,
  canvasSettings: CanvasSettings
): Promise<string> {
  const { dpi = 300, quality = 1 } = options;
  const scale = dpi / 72;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvasSettings.width, canvasSettings.height],
    compress: true,
  });

  for (let i = 0; i < pages.length; i++) {
    // Create canvas for each page
    const canvas = await html2canvas(canvasElement, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: canvasSettings.backgroundColor,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png', quality);

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(imgData, 'PNG', 0, 0, canvasSettings.width, canvasSettings.height, '', 'FAST');
  }

  const pdfBlob = pdf.output('blob');
  return URL.createObjectURL(pdfBlob);
}

/**
 * Export presentation pages as PPTX
 */
export async function exportPagesAsPPTX(pages: Page[]): Promise<string> {
  // Placeholder for PPTX export
  // In a real implementation, use pptxgenjs or similar library
  const pptxContent = `PPTX export placeholder for ${pages.length} pages`;
  const blob = new Blob([pptxContent], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  return URL.createObjectURL(blob);
}

/**
 * Export infographic as PDF
 */
export async function exportAsPDF(
  canvasElement: HTMLElement,
  options: ExportOptions,
  canvasSettings: CanvasSettings
): Promise<string> {
  const { dpi = 300, quality = 1 } = options;
  const scale = dpi / 72;

  // Create high-res canvas
  const canvas = await html2canvas(canvasElement, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: canvasSettings.backgroundColor,
    logging: false,
  });

  // Calculate PDF dimensions
  const imgData = canvas.toDataURL('image/png', quality);
  const imgWidth = canvas.width / scale;
  const imgHeight = canvas.height / scale;

  // Determine PDF orientation
  const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';

  // Create PDF with appropriate size
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [imgWidth, imgHeight],
    compress: true,
  });

  // Add image to PDF
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');

  // Generate blob URL
  const pdfBlob = pdf.output('blob');
  return URL.createObjectURL(pdfBlob);
}

/**
 * Export infographic as SVG (vector format)
 */
export function exportAsSVG(
  elements: HTMLElement[],
  canvasSettings: CanvasSettings
): string {
  const { width, height } = canvasSettings;
  
  // Create SVG namespace
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', width.toString());
  svg.setAttribute('height', height.toString());
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('xmlns', svgNS);
  
  // Add background
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('width', '100%');
  rect.setAttribute('height', '100%');
  rect.setAttribute('fill', canvasSettings.backgroundColor);
  svg.appendChild(rect);
  
  // Convert elements to SVG (simplified)
  elements.forEach((el) => {
    const type = el.getAttribute('data-element-type');
    const x = el.getAttribute('data-x') || '0';
    const y = el.getAttribute('data-y') || '0';
    const w = el.getAttribute('data-width') || '100';
    const h = el.getAttribute('data-height') || '100';
    
    if (type === 'text' || type === 'heading') {
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', String(parseInt(y) + parseInt(h) / 2));
      text.setAttribute('font-family', el.style.fontFamily || 'Arial');
      text.setAttribute('font-size', el.style.fontSize || '16');
      text.setAttribute('fill', el.style.color || '#000000');
      text.textContent = el.textContent || '';
      svg.appendChild(text);
    } else if (type === 'shape') {
      const shape = document.createElementNS(svgNS, 'rect');
      shape.setAttribute('x', x);
      shape.setAttribute('y', y);
      shape.setAttribute('width', w);
      shape.setAttribute('height', h);
      shape.setAttribute('fill', el.style.backgroundColor || 'transparent');
      shape.setAttribute('rx', el.style.borderRadius || '0');
      svg.appendChild(shape);
    }
  });
  
  // Serialize to string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  
  // Create blob URL
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}

// Generate blob URL from string
export function generateBlobUrl(content: string, type: string): string {
  const blob = new Blob([content], { type });
  return URL.createObjectURL(blob);
}

/**
 * Download file from URL
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up blob URL after download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generate shareable link for project
 */
export function generateShareableLink(projectId: string, isPublic: boolean): string {
  if (!isPublic) {
    throw new Error('Project must be public to generate shareable link');
  }
  
  const baseUrl = window.location.origin;
  return `${baseUrl}/share/${projectId}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Generate thumbnail from canvas
 */
export async function generateThumbnail(
  canvasElement: HTMLElement,
  maxSize: number = 300
): Promise<string> {
  const canvas = await html2canvas(canvasElement, {
    scale: 0.5,
    useCORS: true,
    allowTaint: true,
    logging: false,
  });
  
  // Resize if needed
  let { width, height } = canvas;
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width *= ratio;
    height *= ratio;
  }
  
  // Create resized canvas
  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = width;
  resizedCanvas.height = height;
  const ctx = resizedCanvas.getContext('2d');
  
  if (ctx) {
    ctx.drawImage(canvas, 0, 0, width, height);
  }
  
  return new Promise((resolve, reject) => {
    resizedCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error('Failed to create thumbnail'));
        }
      },
      'image/jpeg',
      0.8
    );
  });
}

/**
 * Get recommended export settings based on use case
 */
export function getRecommendedSettings(useCase: 'web' | 'print' | 'social'): ExportOptions {
  switch (useCase) {
    case 'web':
      return {
        format: 'png',
        dpi: 72,
        quality: 0.9,
      };
    case 'print':
      return {
        format: 'pdf',
        dpi: 300,
        quality: 1,
        includeBleed: true,
      };
    case 'social':
      return {
        format: 'png',
        dpi: 150,
        quality: 0.95,
      };
    default:
      return {
        format: 'png',
        dpi: 300,
        quality: 1,
      };
  }
}

/**
 * Calculate file size estimate
 */
export function estimateFileSize(
  canvasSettings: CanvasSettings,
  format: 'png' | 'pdf' | 'svg' | 'pptx',
  dpi: number
): string {
  const { width, height } = canvasSettings;
  const pixelCount = (width * dpi / 72) * (height * dpi / 72);
  
  let bytes = 0;
  switch (format) {
    case 'png':
      bytes = pixelCount * 4; // RGBA
      break;
    case 'pdf':
      bytes = pixelCount * 3 * 0.3; // Compressed RGB
      break;
    case 'svg':
      bytes = 50000; // Rough estimate for SVG
      break;
    case 'pptx':
      bytes = 100000; // Rough estimate for PPTX
      break;
  }
  
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

export default {
  exportAsPNG,
  exportAsPDF,
  exportAsSVG,
  downloadFile,
  generateShareableLink,
  copyToClipboard,
  generateThumbnail,
  getRecommendedSettings,
  estimateFileSize,
};
