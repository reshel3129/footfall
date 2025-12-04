import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface StreamViewerProps {
  onConnectionStatusChange?: (isConnected: boolean) => void;
}

const StreamViewer: React.FC<StreamViewerProps> = ({ onConnectionStatusChange }) => {
  const [streamError, setStreamError] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RETRIES = 10;
  const RETRY_DELAY = 3000; // 3 seconds
  const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

  const loadStreamInfo = async () => {
    try {
      setLoading(true);
      const streamInfo = await apiService.getStreamInfo();
      setStreamUrl(streamInfo.stream_url);
      setStreamError(false);
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to load stream info:', error);
      setStreamError(true);
      setIsVideoPlaying(false);
      onConnectionStatusChange?.(false);
      
      // Retry loading stream info
      if (retryCount < MAX_RETRIES) {
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadStreamInfo();
        }, RETRY_DELAY);
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeHls = (video: HTMLVideoElement, url: string) => {
    // @ts-ignore
    if (!window.Hls || !window.Hls.isSupported()) {
      console.error('HLS.js not supported');
      return null;
    }

    // @ts-ignore
    const hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      maxBufferSize: 60 * 1000 * 1000,
      maxBufferHole: 0.5,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 10,
      liveDurationInfinity: true,
      // Aggressive retry settings
      manifestLoadingTimeOut: 10000,
      manifestLoadingMaxRetry: 10,
      manifestLoadingRetryDelay: 1000,
      levelLoadingTimeOut: 10000,
      levelLoadingMaxRetry: 10,
      levelLoadingRetryDelay: 1000,
      fragLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 10,
      fragLoadingRetryDelay: 1000,
    });

    // @ts-ignore
    hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
      console.log('HLS: Media attached');
    });

    // @ts-ignore
    hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
      console.log('HLS: Manifest parsed, attempting to play');
      video.play().catch(err => {
        console.log('Autoplay prevented:', err);
        // Try again after a short delay
        setTimeout(() => {
          video.play().catch(e => console.log('Second autoplay attempt failed:', e));
        }, 1000);
      });
    });

    // @ts-ignore
    hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
      console.error('HLS Error:', data.type, data.details, data);
      
      if (data.fatal) {
        // @ts-ignore
        switch (data.type) {
          // @ts-ignore
          case window.Hls.ErrorTypes.NETWORK_ERROR:
            console.log('HLS: Fatal network error, attempting recovery');
            // Try to recover by reloading
            setTimeout(() => {
              hls.startLoad();
            }, 1000);
            break;
          // @ts-ignore
          case window.Hls.ErrorTypes.MEDIA_ERROR:
            console.log('HLS: Fatal media error, attempting recovery');
            hls.recoverMediaError();
            break;
          default:
            console.log('HLS: Fatal error, destroying and recreating HLS instance');
            // Destroy and recreate
            hls.destroy();
            setTimeout(() => {
              if (videoRef.current && streamUrl) {
                hlsRef.current = initializeHls(videoRef.current, streamUrl);
              }
            }, 2000);
            break;
        }
      } else {
        // Non-fatal error, just log it
        console.warn('HLS: Non-fatal error:', data.details);
      }
    });

    // @ts-ignore
    hls.on(window.Hls.Events.FRAG_LOADED, () => {
      // Fragment loaded successfully, stream is healthy
      setStreamError(false);
      setIsVideoPlaying(true);
      onConnectionStatusChange?.(true);
    });

    hls.loadSource(url);
    hls.attachMedia(video);

    return hls;
  };

  const setupStream = () => {
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;

    // For HLS streams, we need to use different approaches for different browsers
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari and some mobile browsers support HLS natively
      console.log('Using native HLS support');
      video.src = streamUrl;
      video.play().catch(err => console.log('Autoplay prevented:', err));
    } else {
      // Load hls.js if not already loaded
      // @ts-ignore
      if (window.Hls && window.Hls.isSupported()) {
        console.log('Setting up HLS.js');
        hlsRef.current = initializeHls(video, streamUrl);
      } else {
        // Load hls.js script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.onload = () => {
          console.log('HLS.js loaded, setting up stream');
          // @ts-ignore
          if (window.Hls && window.Hls.isSupported()) {
            hlsRef.current = initializeHls(video, streamUrl);
          } else {
            // Fallback to native video
            video.src = streamUrl;
            video.play().catch(err => console.log('Autoplay prevented:', err));
          }
        };
        script.onerror = () => {
          console.error('Failed to load HLS.js, using native video');
          video.src = streamUrl;
          video.play().catch(err => console.log('Autoplay prevented:', err));
        };
        // Check if script is already added
        if (!document.querySelector('script[src="https://cdn.jsdelivr.net/npm/hls.js@latest"]')) {
          document.head.appendChild(script);
        }
      }
    }

    // Set up periodic health check
    healthCheckIntervalRef.current = setInterval(() => {
      if (video.paused && !video.ended) {
        console.log('Stream appears paused, attempting to resume');
        video.play().catch(err => console.log('Failed to resume:', err));
      }
      
      // Check if video is stalled
      if (video.readyState < 3) {
        console.log('Stream may be stalled, checking connection...');
        // The HLS.js error handlers will take care of reconnection
      }
    }, HEALTH_CHECK_INTERVAL);
  };

  useEffect(() => {
    loadStreamInfo();

    // Cleanup on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (streamUrl) {
      setupStream();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [streamUrl]);

  const handleRefresh = () => {
    setRetryCount(0);
    setStreamError(false);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    loadStreamInfo();
  };

  const handleVideoError = (e: any) => {
    console.error('Video element error:', e);
    setStreamError(true);
    setIsVideoPlaying(false);
    onConnectionStatusChange?.(false);

    // Auto-retry on video error
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying stream (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        handleRefresh();
      }, RETRY_DELAY);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="relative bg-black rounded-lg overflow-hidden w-full h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Loading stream...</p>
              {retryCount > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Retry attempt {retryCount}/{MAX_RETRIES}
                </p>
              )}
            </div>
          </div>
        ) : !streamError && streamUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            controls
            onError={handleVideoError}
            onPlaying={() => {
              console.log('Video playing');
              setIsVideoPlaying(true);
              setStreamError(false);
              onConnectionStatusChange?.(true);
            }}
            onPause={() => {
              console.log('Video paused');
              setIsVideoPlaying(false);
            }}
            onWaiting={() => {
              console.log('Video waiting/buffering');
            }}
            onStalled={() => {
              console.log('Video stalled');
            }}
            onLoadStart={() => {
              console.log('Video load start');
              setIsVideoPlaying(false);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Stream Error</h3>
              <p className="text-sm mb-4">Unable to load camera stream</p>
              {retryCount > 0 && retryCount < MAX_RETRIES && (
                <p className="text-xs text-gray-400 mb-4">
                  Auto-retrying... ({retryCount}/{MAX_RETRIES})
                </p>
              )}
              <button 
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Stream</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamViewer;
