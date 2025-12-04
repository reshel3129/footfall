import React from 'react';
import { Eye, Video, Wifi, Activity, RefreshCw } from 'lucide-react';
import StreamViewer from './StreamViewer';

interface MonitoringSectionsProps {
  isConnected: boolean;
  streamUrl?: string;
}

const MonitoringSections: React.FC<MonitoringSectionsProps> = ({ 
  isConnected, 
  streamUrl = '/api/stream' 
}) => {
  const handleRetryStream = () => {
    // Reload the stream iframes
    const iframes = document.querySelectorAll('iframe[src*="stream"]');
    iframes.forEach(iframe => {
      const src = iframe.getAttribute('src');
      if (src) {
        iframe.setAttribute('src', '');
        setTimeout(() => {
          iframe.setAttribute('src', src);
        }, 100);
      }
    });
  };

  const StreamSection = ({ title, icon: Icon, color, bgColor, streamId }: {
    title: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    streamId: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`${bgColor} p-2 rounded-lg`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">
                Monitoring entry detection traffic
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Live</span>
              </div>
            )}
            {!isConnected && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-600">Offline</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Stream Container */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
          <StreamViewer />
        </div>
        
        {/* Stream Info */}
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Camera</span>
            <span className="font-semibold text-gray-900">
              Entry Point
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Resolution</span>
            <span className="font-semibold text-gray-900">1920×1080</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <StreamSection
        title="Entry Detection Active"
        icon={Eye}
        color="text-green-600"
        bgColor="bg-green-100"
        streamId="entry"
      />
    </div>
  );
};

export default MonitoringSections; 