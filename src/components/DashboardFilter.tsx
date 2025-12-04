import React, { useState } from 'react';
import { Calendar, Filter, X, ChevronDown, ChevronUp, FileDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type FilterType = 'today' | 'yesterday' | 'this-week' | 'this-month' | 'custom';

interface DashboardFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType, customRange?: {startDate: string, endDate: string}) => void | Promise<void>;
  customDateRange?: {
    startDate: string;
    endDate: string;
  };
  onCustomDateRangeChange?: (startDate: string, endDate: string) => void | Promise<void>;
  onExportPDF?: () => void;
  isLoading?: boolean;
}

const DashboardFilter: React.FC<DashboardFilterProps> = ({
  currentFilter,
  onFilterChange,
  customDateRange,
  onCustomDateRangeChange,
  onExportPDF,
  isLoading
}) => {
  const [showFilterSection, setShowFilterSection] = useState(false); // Default to closed
  const [showCustomDateRange, setShowCustomDateRange] = useState(false); // Separate state for custom date range
  const [startDate, setStartDate] = useState(customDateRange?.startDate || '');
  const [endDate, setEndDate] = useState(customDateRange?.endDate || '');
  const [applying, setApplying] = useState(false);

  const quickFilters = [
    { id: 'today' as FilterType, label: 'Today' },
    { id: 'yesterday' as FilterType, label: 'Yesterday' },
    { id: 'this-week' as FilterType, label: 'This Week' },
    { id: 'this-month' as FilterType, label: 'This Month' }
  ];

  const handleQuickFilterClick = (filter: FilterType) => {
    onFilterChange(filter);
  };

  const handleToggleFilterSection = () => {
    setShowFilterSection(!showFilterSection);
    // When closing filter section, also close custom date range
    if (showFilterSection) {
      setShowCustomDateRange(false);
    }
  };

  const handleSelectRangeClick = () => {
    setShowCustomDateRange(!showCustomDateRange);
  };

  const handleApplyRange = async () => {
    if (startDate && endDate && onCustomDateRangeChange) {
      // Validate that dates are not in the future
      const today = new Date().toISOString().split('T')[0];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const todayDate = new Date(today);
      
      if (start > todayDate || end > todayDate) {
        alert('Cannot select future dates. Please select dates up to today.');
        return;
      }
      
      if (start > end) {
        alert('Start date must be before end date.');
        return;
      }
      
      setApplying(true);
      try {
        await Promise.resolve(onCustomDateRangeChange(startDate, endDate));
        await Promise.resolve(onFilterChange('custom', { startDate, endDate }));
      } finally {
        // Let parent loading take over visual state; keep slight delay to avoid flicker
        setTimeout(() => setApplying(false), 150);
      }
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    onFilterChange('this-week');
  };

  const handleCancel = () => {
    setStartDate(customDateRange?.startDate || '');
    setEndDate(customDateRange?.endDate || '');
    setShowCustomDateRange(false);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setShowFilterSection(false);
    setShowCustomDateRange(false);
    onFilterChange('today');
  };

  const getFilterDisplayName = (filter: FilterType) => {
    switch (filter) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'this-week': return 'This Week';
      case 'this-month': return 'This Month';
      case 'custom': return 'Custom Range';
      default: return 'This Week';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="backdrop-blur-xl bg-slate-900/80 rounded-2xl shadow-2xl border border-slate-700/50 p-4 lg:p-6"
    >
      {/* Header - Always Visible */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <motion.div 
            className="bg-gradient-to-br from-blue-600 to-blue-500 p-2 rounded-xl shadow-lg relative overflow-hidden"
            whileHover={{ 
              rotate: 180,
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)'
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Quick flash on hover */}
            <motion.div
              className="absolute inset-0 bg-white/30"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5 }}
            />
            <Filter className="h-5 w-5 text-white relative z-10" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Dashboard Filter</h3>
            <p className="text-sm text-slate-400">
              Currently showing: <motion.span 
                key={currentFilter}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-medium text-blue-400"
              >
                {getFilterDisplayName(currentFilter)}
              </motion.span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleToggleFilterSection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-slate-300 hover:text-slate-100 border border-slate-600 rounded-xl hover:bg-slate-800/50 transition-all"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <motion.div
                animate={{ rotate: showFilterSection ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </motion.button>
            <motion.button
              onClick={handleClear}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-all"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </motion.button>
          </div>
          
          {/* Export PDF Button - Prominent like header button */}
          <motion.button
            onClick={onExportPDF}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg"
          >
            <FileDown className="h-4 w-4" />
            <span>Export PDF</span>
          </motion.button>
        </div>
      </div>

      {/* Expandable Filter Section - Shows quick filters + Select Range button */}
      {/* @ts-ignore - AnimatePresence React 19 compatibility */}
      <AnimatePresence mode="wait">
        {showFilterSection && (
          <motion.div 
            key="filter-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-6 overflow-hidden"
          >
            {/* Quick Filters */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Quick Filters</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {quickFilters.map((filter, index) => {
                  const isSelected = currentFilter === filter.id;
                  return (
                    <motion.button
                      key={filter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickFilterClick(filter.id)}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                        isSelected
                          ? 'bg-blue-600 text-white border-transparent shadow-lg shadow-blue-500/30'
                          : 'bg-slate-800/50 backdrop-blur-sm text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 shadow-sm'
                      }`}
                    >
                      <span>{filter.label}</span>
                    </motion.button>
                  );
                })}
                
                {/* Select Range Button - Outlined Style */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: quickFilters.length * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSelectRangeClick}
                  className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 border-dashed border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 transition-all text-sm font-medium bg-slate-800/30 backdrop-blur-sm"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Select Range</span>
                </motion.button>
              </div>
            </div>

            {/* Custom Date Range Section */}
            {/* @ts-ignore - AnimatePresence React 19 compatibility */}
            <AnimatePresence mode="wait">
              {showCustomDateRange && (
                <motion.div 
                  key="custom-date-range"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-slate-700/50 pt-6 overflow-hidden"
                >
              <h4 className="text-sm font-medium text-slate-300 mb-4">Custom Date Range</h4>
              
              {/* Date Range Inputs */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer hover:border-slate-500 transition-colors"
                      style={{ colorScheme: 'dark' }}
                      placeholder="Select start date"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer hover:border-slate-500 transition-colors"
                      style={{ colorScheme: 'dark' }}
                      placeholder="Select end date"
                      autoComplete="off"
                    />
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center space-x-3 justify-end">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 border border-slate-600 rounded-lg hover:bg-slate-800/50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 border border-slate-600 rounded-lg hover:bg-slate-800/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyRange}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={!startDate || !endDate || applying || isLoading}
                    aria-busy={applying || !!isLoading}
                  >
                    {(applying || isLoading) ? (<>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Applying…</span>
                    </>) : 'Apply Range'}
                  </button>
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardFilter; 