import React from 'react';
import { User, Clock, Check, X } from 'lucide-react';

interface PersonStatus {
  id: number;
  name: string;
  track_id: number;
  has_entered: boolean;
  has_exited: boolean;
  is_inside: boolean;
  last_entry_time?: string;
  last_exit_time?: string;
  total_entries: number;
  total_exits: number;
}

interface PersonLogsProps {
  personStatuses: PersonStatus[];
  title: string;
}

const PersonLogs: React.FC<PersonLogsProps> = ({ personStatuses, title }) => {
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="person-logs-container bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col h-[680px]">
      <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          Live Status
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-4 min-h-0">
        <div className="space-y-4">
          {personStatuses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <User className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-gray-500">No person activity detected</p>
            </div>
          ) : (
            personStatuses.map((person, index) => (
            <div
              key={person.id}
              className={`bg-gradient-to-r ${
                person.is_inside 
                  ? 'from-green-50 to-emerald-50 border-l-green-500' 
                  : 'from-gray-50 to-gray-100 border-l-gray-400'
              } rounded-lg p-4 border-l-4 hover:shadow-md transition-all duration-200 animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <User className={`h-4 w-4 ${person.is_inside ? 'text-green-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {person.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        (Track ID: {person.track_id})
                      </span>
                    </div>
                    
                    {/* Entry/Exit Checkboxes */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          person.has_entered 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          {person.has_entered && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Entry</span>
                        {person.last_entry_time && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {formatTimestamp(person.last_entry_time)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          person.has_exited 
                            ? 'bg-red-500 border-red-500' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          {person.has_exited && <X className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Exit</span>
                        {person.last_exit_time && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {formatTimestamp(person.last_exit_time)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Status and Statistics */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        person.is_inside 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {person.is_inside ? 'Inside' : 'Outside'}
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">Entries: {person.total_entries}</span>
                      <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs">Exits: {person.total_exits}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  );
};

export default PersonLogs; 