import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/store/useEditorStore';
import type { InfographicElement } from '@/types';
import * as Icons from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface CanvasElementProps {
  element: InfographicElement;
  isSelected: boolean;
  onSelect: () => void;
  onDrag: (x: number, y: number) => void;
}

function CanvasElement({ element, isSelected, onSelect, onDrag }: CanvasElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({ x: e.clientX - element.x, y: e.clientY - element.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      onDrag(e.clientX - dragStart.x, e.clientY - dragStart.y);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove as any);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);
  
  const renderContent = () => {
    switch (element.type) {
      case 'heading':
        return (
          <h2 
            className="w-full h-full flex items-center justify-center"
            style={{
              fontSize: element.style.fontSize,
              fontWeight: element.style.fontWeight,
              color: element.style.color,
              textAlign: element.style.textAlign as any,
              fontFamily: element.style.fontFamily,
            }}
          >
            {element.content}
          </h2>
        );
        
      case 'text':
        return (
          <p 
            className="w-full h-full flex items-center"
            style={{
              fontSize: element.style.fontSize,
              fontWeight: element.style.fontWeight,
              color: element.style.color,
              textAlign: element.style.textAlign as any,
              fontFamily: element.style.fontFamily,
              lineHeight: element.style.lineHeight,
            }}
          >
            {element.content}
          </p>
        );
        
      case 'stat':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span 
              className="font-bold"
              style={{
                fontSize: element.style.fontSize,
                fontWeight: element.style.fontWeight,
                color: element.style.color,
              }}
            >
              {element.content}
            </span>
            {element.data && 'label' in element.data && (
              <span className="text-sm text-gray-500 mt-1">{element.data.label}</span>
            )}
          </div>
        );
        
      case 'chart':
        if (!element.data || !('labels' in element.data)) return null;
        const chartData = (element.data.labels as string[]).map((label: string, i: number) => ({
          name: label,
          value: (element.data as { values: number[] }).values[i],
        }));
        const colors = element.data.colors || ['#6B46C1', '#EC4899', '#06B6D4', '#10B981'];
        
        return (
          <div className="w-full h-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              {element.data.type === 'pie' || element.data.type === 'doughnut' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={element.data.type === 'doughnut' ? 40 : 0}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {chartData.map((_entry: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : element.data.type === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={colors[0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        );
        
      case 'icon':
        const IconComponent = (Icons as any)[element.iconName || 'Star'];
        return (
          <div className="w-full h-full flex items-center justify-center">
            {IconComponent && (
              <IconComponent 
                className="w-full h-full"
                style={{ color: element.style.color }}
              />
            )}
          </div>
        );
        
      case 'shape':
        return (
          <div 
            className="w-full h-full"
            style={{
              backgroundColor: element.style.backgroundColor,
              borderRadius: element.style.borderRadius,
              opacity: element.style.opacity,
              border: element.style.border,
            }}
          />
        );
        
      case 'image':
        return (
          <img 
            src={element.content} 
            alt=""
            className="w-full h-full object-cover"
            style={{ borderRadius: element.style.borderRadius }}
          />
        );
        
      case 'divider':
        return (
          <div 
            className="w-full h-full"
            style={{
              backgroundColor: element.style.backgroundColor || '#e5e5e5',
              height: element.style.height || 2,
            }}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      ref={elementRef}
      className={`canvas-element ${isSelected ? 'selected' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
      }}
      onMouseDown={handleMouseDown}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {renderContent()}
      
      {/* Resize Handles */}
      {isSelected && (
        <>
          <div className="resize-handle nw" />
          <div className="resize-handle ne" />
          <div className="resize-handle sw" />
          <div className="resize-handle se" />
        </>
      )}
    </motion.div>
  );
}

export function InfographicCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { 
    pages,
    activePageIndex,
    selectedElementId,
    setSelectedElement, 
    moveElement,
    canvasSettings,
    zoom,
  } = useEditorStore();
  
  // Temporary defaults for properties not yet implemented
  const showGrid = false;
  
  const currentPage = pages[activePageIndex];
  const elements = currentPage ? currentPage.elements : [];
  
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
    }
  };
  
  const handleElementDrag = (id: string, x: number, y: number) => {
    // Snap to grid if enabled
    const snapSize = 10;
    const snappedX = Math.round(x / snapSize) * snapSize;
    const snappedY = Math.round(y / snapSize) * snapSize;
    moveElement(id, Math.max(0, snappedX), Math.max(0, snappedY));
  };
  
  const getBackgroundStyle = () => {
    if (canvasSettings.backgroundGradient) {
      const { type, colors, angle } = canvasSettings.backgroundGradient;
      if (type === 'linear') {
        return {
          background: `linear-gradient(${angle || 135}deg, ${colors.join(', ')})`,
        };
      } else {
        return {
          background: `radial-gradient(circle, ${colors.join(', ')})`,
        };
      }
    }
    return {
      backgroundColor: canvasSettings.backgroundColor,
    };
  };
  
  return (
    <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-[#0a0a0c]">
      <div 
        className="relative shadow-2xl"
        style={{
          width: canvasSettings.width * (zoom / 100),
          height: canvasSettings.height * (zoom / 100),
          ...getBackgroundStyle(),
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center',
        }}
      >
        {/* Grid */}
        {showGrid && (
          <div 
            className="absolute inset-0 canvas-grid pointer-events-none opacity-30"
            style={{ backgroundSize: '20px 20px' }}
          />
        )}
        
        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="absolute inset-0"
          onClick={handleCanvasClick}
          data-infographic-canvas
        >
          {elements.map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              isSelected={selectedElementId === element.id}
              onSelect={() => setSelectedElement(element.id)}
              onDrag={(x, y) => handleElementDrag(element.id, x, y)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

