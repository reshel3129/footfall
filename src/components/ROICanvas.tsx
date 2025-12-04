import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ROIConfig, Point } from '../services/api';

interface ROICanvasProps {
  config: ROIConfig;
  onChange: (config: ROIConfig) => void;
  streamUrl: string;
  previewMode: boolean;
}

type DrawingMode = 'line' | 'polygon' | 'none';

const ROICanvas: React.FC<ROICanvasProps> = ({ config, onChange, streamUrl, previewMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number>(-1);
  const [dragType, setDragType] = useState<'line' | 'polygon'>('line');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 360 });

  // Convert coordinates from canvas to processing resolution (640x360)
  const canvasToProcessing = useCallback((point: Point, canvas: HTMLCanvasElement): [number, number] => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = 640 / rect.width;
    const scaleY = 360 / rect.height;
    return [Math.round(point.x * scaleX), Math.round(point.y * scaleY)];
  }, []);

  // Convert coordinates from processing resolution to canvas
  const processingToCanvas = useCallback((point: [number, number], canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / 640;
    const scaleY = rect.height / 360;
    return { x: point[0] * scaleX, y: point[1] * scaleY };
  }, []);

  // Draw ROI on canvas
  const drawROI = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!config) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the current image if loaded
    if (imageRef.current && imageLoaded) {
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }

    // Draw detection line (green)
    if (config.line_points && config.line_points.length >= 2) {
      const startPoint = processingToCanvas(config.line_points[0], canvas);
      const endPoint = processingToCanvas(config.line_points[1], canvas);

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();

      // Draw control points
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Add label
      ctx.fillStyle = '#10B981';
      ctx.font = '14px Arial';
      ctx.fillText('Detection Line', startPoint.x - 50, startPoint.y - 15);
    }

    // Draw polygon area (blue)
    if (config.polygon_points && config.polygon_points.length >= 3) {
      const canvasPoints = config.polygon_points.map(p => processingToCanvas(p, canvas));

      // Draw filled polygon with transparency
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.beginPath();
      ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
      for (let i = 1; i < canvasPoints.length; i++) {
        ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y);
      }
      ctx.closePath();
      ctx.fill();

      // Draw polygon outline
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
      for (let i = 1; i < canvasPoints.length; i++) {
        ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw control points
      ctx.fillStyle = '#3B82F6';
      canvasPoints.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Add label
      if (canvasPoints.length > 0) {
        ctx.fillStyle = '#3B82F6';
        ctx.font = '14px Arial';
        ctx.fillText('Detection Area', canvasPoints[0].x, canvasPoints[0].y - 15);
      }
    }
  }, [config, imageLoaded, processingToCanvas]);

  // Update canvas when config changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawROI(ctx, canvas);
  }, [config, drawROI, imageLoaded]);

  // Load current stream image (use snapshots for ROI drawing stability)
  useEffect(() => {
    const loadImage = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageLoaded(true);
        if (imageRef.current) {
          imageRef.current = img;
        }
      };
      img.onerror = (error) => {
        console.warn('Failed to load stream image:', error);
        setImageLoaded(false);
        // Retry after 2 seconds
        setTimeout(loadImage, 2000);
      };
      
      // Use snapshots for ROI drawing (more stable than live stream)
      const imageUrl = `/api/camera/snapshot?t=${Date.now()}`;
      img.src = imageUrl;
      
      if (imageRef.current) {
        imageRef.current = img;
      }
    };

    loadImage();
    
    // Refresh image every 3 seconds for near real-time updates
    const interval = setInterval(loadImage, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = { x, y };

    // Check if clicking on existing points
    const checkLinePoints = () => {
      if (!config.line_points) return false;
      
      for (let i = 0; i < config.line_points.length; i++) {
        const canvasPoint = processingToCanvas(config.line_points[i], canvas);
        const distance = Math.sqrt(
          Math.pow(x - canvasPoint.x, 2) + Math.pow(y - canvasPoint.y, 2)
        );
        
        if (distance <= 10) {
          setIsDragging(true);
          setDragIndex(i);
          setDragType('line');
          return true;
        }
      }
      return false;
    };

    const checkPolygonPoints = () => {
      if (!config.polygon_points) return false;
      
      for (let i = 0; i < config.polygon_points.length; i++) {
        const canvasPoint = processingToCanvas(config.polygon_points[i], canvas);
        const distance = Math.sqrt(
          Math.pow(x - canvasPoint.x, 2) + Math.pow(y - canvasPoint.y, 2)
        );
        
        if (distance <= 10) {
          setIsDragging(true);
          setDragIndex(i);
          setDragType('polygon');
          return true;
        }
      }
      return false;
    };

    // Check for existing point selection first
    if (checkLinePoints() || checkPolygonPoints()) {
      return;
    }

    // Handle new point creation based on drawing mode
    if (drawingMode === 'line') {
      const processingPoint = canvasToProcessing(point, canvas);
      const newLinePoints: [number, number][] = [...(config.line_points || [])];
      
      if (newLinePoints.length < 2) {
        newLinePoints.push(processingPoint);
      } else {
        // Replace the second point
        newLinePoints[1] = processingPoint;
      }
      
      onChange({
        ...config,
        line_points: newLinePoints
      });
    } else if (drawingMode === 'polygon') {
      const processingPoint = canvasToProcessing(point, canvas);
      const newPolygonPoints: [number, number][] = [...(config.polygon_points || [])];
      newPolygonPoints.push(processingPoint);
      
      onChange({
        ...config,
        polygon_points: newPolygonPoints
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = { x, y };
    const processingPoint = canvasToProcessing(point, canvas);

    if (dragType === 'line' && dragIndex >= 0) {
      const newLinePoints = [...config.line_points];
      newLinePoints[dragIndex] = processingPoint;
      onChange({
        ...config,
        line_points: newLinePoints
      });
    } else if (dragType === 'polygon' && dragIndex >= 0) {
      const newPolygonPoints = [...config.polygon_points];
      newPolygonPoints[dragIndex] = processingPoint;
      onChange({
        ...config,
        polygon_points: newPolygonPoints
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragIndex(-1);
  };

  const clearLine = () => {
    onChange({
      ...config,
      line_points: []
    });
  };

  const clearPolygon = () => {
    onChange({
      ...config,
      polygon_points: []
    });
  };

  return (
    <div className="space-y-4">
      {/* Drawing Tools */}
      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Drawing Mode:</span>
        <button
          onClick={() => setDrawingMode('line')}
          className={`px-3 py-1 rounded text-sm ${
            drawingMode === 'line' 
              ? 'bg-green-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Detection Line
        </button>
        <button
          onClick={() => setDrawingMode('polygon')}
          className={`px-3 py-1 rounded text-sm ${
            drawingMode === 'polygon' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Detection Area
        </button>
        <button
          onClick={() => setDrawingMode('none')}
          className={`px-3 py-1 rounded text-sm ${
            drawingMode === 'none' 
              ? 'bg-gray-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Select/Move
        </button>
        
        <div className="ml-4 flex items-center space-x-2">
          <button
            onClick={clearLine}
            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Clear Line
          </button>
          <button
            onClick={clearPolygon}
            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Clear Area
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-auto cursor-crosshair"
          style={{ maxWidth: '100%', height: 'auto' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Loading stream...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 space-y-1">
        <p><strong>Instructions:</strong></p>
        <ul className="space-y-1 ml-4">
          <li>• Select a drawing mode above</li>
          <li>• <strong>Detection Line:</strong> Click two points to create a crossing detection line</li>
          <li>• <strong>Detection Area:</strong> Click multiple points to create a polygon detection area</li>
          <li>• <strong>Select/Move:</strong> Click and drag existing points to modify them</li>
          <li>• Use Clear buttons to remove existing shapes</li>
        </ul>
      </div>
    </div>
  );
};

export default ROICanvas; 