import { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { useEditorStore } from '@/store/useEditorStore';
import { ScaledSlide } from './ScaledSlide';

const SLIDE_W = 1920;
const SLIDE_H = 1080;

export function EditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(0.5);
  const {
    slides,
    activeSlideIndex,
    selectedElementId,
    selectElement,
    updateElement,
    theme,
    zoom,
  } = useEditorStore();

  const slide = slides[activeSlideIndex];

  useEffect(() => {
    const compute = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const sx = (clientWidth - 80) / SLIDE_W;
      const sy = (clientHeight - 80) / SLIDE_H;
      setAutoScale(Math.max(0.1, Math.min(sx, sy)));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const scale = autoScale * (zoom / 100);

  if (!slide) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0c] text-white/40">
        Slayd tanlanmagan
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-[#0a0a0c] overflow-auto custom-scrollbar"
      onClick={() => selectElement(null)}
    >
      <div
        className="relative shadow-2xl"
        style={{ width: SLIDE_W * scale, height: SLIDE_H * scale }}
        onClick={(e) => e.stopPropagation()}
        data-slide-canvas
      >
        {/* Read-only render layer (used by export) */}
        <ScaledSlide slide={slide} theme={theme} scale={scale} />

        {/* Interactive overlay with Rnd handles */}
        <div
          className="absolute top-0 left-0"
          style={{
            width: SLIDE_W,
            height: SLIDE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {slide.elements.map((el) => (
            <Rnd
              key={el.id}
              size={{ width: el.width, height: el.height }}
              position={{ x: el.x, y: el.y }}
              bounds="parent"
              onDragStop={(_, d) => updateElement(el.id, { x: d.x, y: d.y })}
              onResizeStop={(_, __, ref, ___, position) => {
                updateElement(el.id, {
                  width: parseFloat(ref.style.width),
                  height: parseFloat(ref.style.height),
                  x: position.x,
                  y: position.y,
                });
              }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                selectElement(el.id);
              }}
              style={{
                outline:
                  selectedElementId === el.id ? `3px solid ${theme.primary}` : 'none',
                outlineOffset: 4,
                zIndex: el.zIndex,
              }}
              enableResizing={selectedElementId === el.id}
              disableDragging={selectedElementId !== el.id}
            >
              <div className="w-full h-full" />
            </Rnd>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hidden offscreen renderer used by export — renders slide at 1:1 1920x1080
export function OffscreenSlideRenderer({
  slideIndex,
  refCallback,
}: {
  slideIndex: number;
  refCallback: (el: HTMLDivElement | null) => void;
}) {
  const { slides, theme } = useEditorStore();
  const slide = slides[slideIndex];
  if (!slide) return null;
  return (
    <div
      ref={refCallback}
      style={{
        position: 'absolute',
        left: -99999,
        top: 0,
        width: SLIDE_W,
        height: SLIDE_H,
      }}
    >
      <ScaledSlide slide={slide} theme={theme} scale={1} />
    </div>
  );
}
