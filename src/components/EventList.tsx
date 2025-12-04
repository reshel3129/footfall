import React, { useState } from 'react';
import { ArrowUp, ArrowDown, User, Clock, AlertTriangle, Loader2, ChevronDown } from 'lucide-react';
import { Event } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface EventListProps {
  events: Event[];
  title: string;
  showAll?: boolean;
  hasMoreEvents?: boolean;
  loadingMoreEvents?: boolean;
  onLoadMore?: () => void;
}

const getOrdinalNumber = (num: number): string => {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const value = num % 100;
  return num + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
};

const EventList: React.FC<EventListProps> = ({ 
  events, 
  title, 
  showAll = false, 
  hasMoreEvents = false, 
  loadingMoreEvents = false, 
  onLoadMore 
}) => {
  const [viewAll, setViewAll] = useState(showAll);
  // If lazy loading is enabled (onLoadMore provided), show all events, otherwise use viewAll logic
  const displayEvents = onLoadMore ? events : (viewAll ? events : events.slice(0, 10));

  const getEventIcon = (event: Event) => {
    if (event.event_type === 'entry') {
      return <ArrowUp className="h-4 w-4 text-green-400" />;
    } else {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getEventColor = (event: Event) => {
    if (event.event_type === 'entry') {
      return 'border-l-green-400';
    } else {
      return 'border-l-red-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      
      // Check if the parsed date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      
      // Format as just time (HH:MM:SS)
      return date.toLocaleTimeString('en-US', { 
        hour12: false, // 24-hour format
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error parsing timestamp:', timestamp, error);
      return 'Invalid time';
    }
  };

  return (
    <div className="card">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <div className="flex items-center text-sm text-slate-400">
            <Clock className="h-4 w-4 mr-1" />
            Live Updates
          </div>
        </div>
      )}

      <div className="space-y-4">
        {displayEvents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-500 mb-2">
              <AlertTriangle className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-slate-400">No recent activity</p>
          </div>
        ) : (
          displayEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, x: 4 }}
              className={`bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border-l-4 ${getEventColor(event)} hover:bg-slate-800/70 transition-colors relative overflow-hidden group`}
            >
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 rounded-full blur-xl" />
              </div>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-slate-100">
                        {event.customer_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <User className="h-3 w-3" />
                      <span>{event.is_returning ? 'Returning visitor' : 'First-time visitor'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Lazy Loading Controls */}
      {onLoadMore && hasMoreEvents && (
        <div className="mt-4 text-center">
          <button 
            onClick={onLoadMore}
            disabled={loadingMoreEvents}
            className="inline-flex items-center px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30"
          >
            {loadingMoreEvents ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading more events...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Load More Events
              </>
            )}
          </button>
        </div>
      )}

      {/* Traditional View All/Show Less Controls (when lazy loading is not enabled) */}
      {!onLoadMore && !viewAll && events.length > 10 && (
        <div className="mt-4 text-center">
          <button 
            onClick={() => setViewAll(true)}
            className="btn-secondary"
          >
            View All Events ({events.length})
          </button>
        </div>
      )}

      {!onLoadMore && viewAll && events.length > 10 && (
        <div className="mt-4 text-center">
          <button 
            onClick={() => setViewAll(false)}
            className="btn-secondary"
          >
            Show Less
          </button>
        </div>
      )}

      {/* Show total count when lazy loading */}
      {onLoadMore && events.length > 0 && (
        <div className="mt-2 text-center">
          <span className="text-sm text-slate-400">
            Showing {events.length} events{!hasMoreEvents ? ' (all)' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default EventList; 