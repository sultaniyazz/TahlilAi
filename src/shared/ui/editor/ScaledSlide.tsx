// Renders a single slide at exact 1920x1080 resolution.
// Used both in the editor (scaled via transform) and offscreen for export.
import type { Slide, Theme, SlideElement } from '@/types';
import * as Icons from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';

interface ScaledSlideProps {
  slide: Slide;
  theme: Theme;
  scale?: number;
  selectedId?: string | null;
  onSelectElement?: (id: string | null) => void;
  interactive?: boolean;
}

const SLIDE_W = 1920;
const SLIDE_H = 1080;

export function ScaledSlide({
  slide,
  theme,
  scale = 1,
  selectedId,
  onSelectElement,
  interactive = false,
}: ScaledSlideProps) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: SLIDE_W * scale,
        height: SLIDE_H * scale,
        backgroundColor: slide.background ?? theme.background,
      }}
      onClick={() => interactive && onSelectElement?.(null)}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width: SLIDE_W,
          height: SLIDE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {slide.elements
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => (
            <ElementView
              key={el.id}
              element={el}
              theme={theme}
              isSelected={selectedId === el.id}
              interactive={interactive}
              onSelect={() => onSelectElement?.(el.id)}
            />
          ))}
      </div>
    </div>
  );
}

interface ElementViewProps {
  element: SlideElement;
  theme: Theme;
  isSelected: boolean;
  interactive: boolean;
  onSelect: () => void;
}

function ElementView({ element, theme, isSelected, interactive, onSelect }: ElementViewProps) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    cursor: interactive ? 'pointer' : 'default',
    outline: interactive && isSelected ? `3px solid ${theme.primary}` : 'none',
    outlineOffset: 4,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    onSelect();
  };

  const textStyle: React.CSSProperties = {
    fontSize: element.style.fontSize,
    fontFamily: element.style.fontFamily,
    fontWeight: element.style.fontWeight,
    fontStyle: element.style.fontStyle,
    color: element.style.color,
    textAlign: element.style.textAlign,
    lineHeight: element.style.lineHeight,
    letterSpacing: element.style.letterSpacing,
    opacity: element.style.opacity,
    padding: element.style.padding,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  if (element.type === 'shape') {
    return (
      <div
        style={{
          ...baseStyle,
          backgroundColor: element.style.backgroundColor,
          borderRadius:
            element.shapeType === 'circle' ? '50%' : (element.style.borderRadius ?? 0),
          border: element.style.borderWidth
            ? `${element.style.borderWidth}px solid ${element.style.borderColor ?? '#fff'}`
            : undefined,
          opacity: element.style.opacity,
        }}
        onClick={handleClick}
      />
    );
  }

  if (element.type === 'icon') {
    const IconCmp = (Icons as unknown as Record<string, React.FC<{ size?: number; color?: string }>>)[
      element.iconName ?? 'Sparkles'
    ];
    return (
      <div style={baseStyle} onClick={handleClick}>
        {IconCmp && (
          <IconCmp
            size={Math.min(element.width, element.height)}
            color={element.style.color ?? theme.accent}
          />
        )}
      </div>
    );
  }

  if (element.type === 'image') {
    return (
      <div style={baseStyle} onClick={handleClick}>
        <img
          src={element.content}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: element.style.borderRadius,
          }}
        />
      </div>
    );
  }

  if (element.type === 'chart' && element.chartData) {
    const data = element.chartData.labels.map((l, i) => ({
      name: l,
      value: element.chartData!.values[i] ?? 0,
    }));
    const colors = element.chartData.colors ?? [theme.primary, theme.secondary, theme.accent];
    return (
      <div style={baseStyle} onClick={handleClick}>
        <ResponsiveContainer width="100%" height="100%">
          {element.chartData.type === 'pie' || element.chartData.type === 'doughnut' ? (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={Math.min(element.width, element.height) / 3}
                innerRadius={element.chartData.type === 'doughnut' ? Math.min(element.width, element.height) / 5 : 0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : element.chartData.type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={3} />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Bar dataKey="value" fill={colors[0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  }

  // text-like elements
  return (
    <div style={baseStyle} onClick={handleClick}>
      <div style={textStyle}>{element.content}</div>
    </div>
  );
}
