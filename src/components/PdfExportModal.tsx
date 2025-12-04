import React, { useState } from 'react';
import { X, FileDown, Calendar, Loader2 } from 'lucide-react';
import { apiService, PdfReportData } from '../services/api';
import PdfReportGenerator from './PdfReportGenerator';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<PdfReportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const validateDates = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return false;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      setError('Start date cannot be after end date');
      return false;
    }
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (start > today) {
      setError('Start date cannot be in the future');
      return false;
    }
    
    return true;
  };

  const handleGenerateReport = async () => {
    setError(null);
    
    if (!validateDates()) {
      return;
    }

    setLoading(true);
    
    try {
      const data = await apiService.getPdfReportData(startDate, endDate);
      setReportData(data);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setError(null);
    setReportData(null);
    setShowPreview(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Set default dates (last 7 days)
  React.useEffect(() => {
    if (isOpen && !startDate && !endDate) {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6);
      
      setEndDate(today.toISOString().split('T')[0]);
      setStartDate(weekAgo.toISOString().split('T')[0]);
    }
  }, [isOpen, startDate, endDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/50 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {showPreview && reportData ? (
          <PdfReportGenerator 
            reportData={reportData}
            onClose={handleClose}
            onBack={() => setShowPreview(false)}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50 flex-shrink-0 bg-slate-800/50">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-2 rounded-lg">
                  <FileDown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-100">Export PDF Report</h2>
                  <p className="text-sm text-slate-400 hidden sm:block">Generate detailed footfall analytics report</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mb-8">
                <h3 className="text-lg font-medium text-slate-100 mb-4">Select Date Range</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-800/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{ colorScheme: 'dark' }}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      End Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-800/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{ colorScheme: 'dark' }}
                        max={new Date().toISOString().split('T')[0]}
                        min={startDate}
                      />
                    </div>
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-400">
                      <strong>Report Period:</strong> {formatDate(startDate)} to {formatDate(endDate)}
                    </p>
                  </div>
                )}
              </div>

              {/* Report Features */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-slate-100 mb-4">Report Includes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-slate-200">Total Unique Visitors</h4>
                      <p className="text-sm text-slate-400">Count of unique visitors in the selected period</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-slate-200">Average Daily Footfall</h4>
                      <p className="text-sm text-slate-400">Daily average or single day footfall</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-slate-200">Hourly Traffic Chart</h4>
                      <p className="text-sm text-slate-400">Bar chart showing hourly visitor patterns</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-slate-200">Daily Footfall Chart</h4>
                      <p className="text-sm text-slate-400">Daily breakdown (for multi-day periods)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-slate-200">New vs Returning</h4>
                      <p className="text-sm text-slate-400">Pie chart showing visitor distribution</p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-slate-700/50 bg-slate-800/50 flex-shrink-0">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-slate-300 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={loading || !startDate || !endDate}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Generating...</span>
                    <span className="sm:hidden">Gen...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Generate Report</span>
                    <span className="sm:hidden">Generate</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PdfExportModal; 