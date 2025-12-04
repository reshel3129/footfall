import React, { useState, useEffect } from 'react';
import { Activity, Users, ArrowUp, ArrowDown, Eye, Wifi, AlertCircle, UserPlus, UserMinus, Brain, Sparkles, LogIn, LogOut, Download, Upload } from 'lucide-react';
import { apiService, DashboardStats, Event } from './services/api';
import StatsCard from './components/StatsCard';
import EventList from './components/EventList';
import StreamViewer from './components/StreamViewer';
import FaceRegistrationModal from './components/FaceRegistrationModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DashboardFilter, { FilterType } from './components/DashboardFilter';
import PdfExportModal from './components/PdfExportModal';
import AnimatedBackground from './components/AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [yesterdayStats, setYesterdayStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [loadingMoreEvents, setLoadingMoreEvents] = useState(false);

  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('today');
  const [customDateRange, setCustomDateRange] = useState<{startDate: string, endDate: string}>({
    startDate: '',
    endDate: ''
  });
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [refreshing, setRefreshing] = useState(false);
  const [isCameraConnected, setIsCameraConnected] = useState(false);

  // Set up data loading and periodic updates
  useEffect(() => {
    // Initial data load
    loadDashboardData();

    // Set up periodic data refresh every minute (60 seconds)
    const intervalId = setInterval(() => {
      console.log('Refreshing dashboard data...');
      loadDashboardData();
    }, 60000); // Refresh every 1 minute

    // Optional: Keep WebSocket for future use, but don't rely on it
    try {
      apiService.connectSocket();
    } catch (error) {
      console.warn('WebSocket connection failed, relying on polling:', error);
    }

    // Also refresh when window becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, refreshing data...');
        loadDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      try {
        apiService.disconnectSocket();
      } catch (error) {
        console.warn('Error disconnecting WebSocket:', error);
      }
    };
  }, [currentFilter, customDateRange]); // Recreate interval when filter changes

  const loadDashboardData = async (isRetry = false, overrideFilter?: FilterType, overrideDateRange?: {startDate: string, endDate: string}) => {
    try {
      setError(null);
      if (!isRetry) {
        setRefreshing(true);
      }
      
      // Use override parameters or current state
      const effectiveFilter = overrideFilter || currentFilter;
      const effectiveDateRange = overrideDateRange || customDateRange;
      
      // Load all data in parallel for faster loading
      // Decide what to show in Activity Overview
      const activityOverviewFilter = effectiveFilter === 'today' ? 'this-week' : effectiveFilter;
      const activityStart = activityOverviewFilter === 'custom' ? effectiveDateRange.startDate : undefined;
      const activityEnd = activityOverviewFilter === 'custom' ? effectiveDateRange.endDate : undefined;

      const promises = [
        apiService.getDashboardStats(effectiveFilter, effectiveDateRange.startDate, effectiveDateRange.endDate),
        apiService.getEvents(50, effectiveFilter, effectiveDateRange.startDate, effectiveDateRange.endDate),
        apiService.getAnalytics(activityOverviewFilter, activityStart, activityEnd), // Activity Overview period
        apiService.getAnalytics(effectiveFilter, effectiveDateRange.startDate, effectiveDateRange.endDate) // Current filter for hourly + breakdown
      ];
      
      // If showing today's data, also fetch yesterday's for comparison
      if (effectiveFilter === 'today') {
        promises.push(apiService.getDashboardStats('yesterday'));
      }
      
      const results = await Promise.all(promises);
      const [statsData, eventsData, overviewAnalytics, currentFilterAnalytics] = results;
      
      setDashboardStats(statsData);
      setEvents(eventsData);
      // Reset pagination state when loading fresh data
      setHasMoreEvents(eventsData.length >= 50);
      setLoadingMoreEvents(false);
      
      // Set yesterday's stats if we fetched it
      if (effectiveFilter === 'today' && results.length > 4) {
        setYesterdayStats(results[4]);
      } else {
        setYesterdayStats(null);
      }
      
      // Combine analytics: Use activity overview for the main chart, current filter for hourly + breakdown
      const combinedAnalytics = {
        ...overviewAnalytics, // This provides the Activity Overview data
        // Override hourly analysis and customer breakdown with current filter data
        hourly_analysis: {
          ...currentFilterAnalytics.hourly_analysis,
          labels: currentFilterAnalytics.hourly_analysis.labels,
          entries: currentFilterAnalytics.hourly_analysis.entries,
          total_unique_customers: currentFilterAnalytics.hourly_analysis.total_unique_customers
        },
        // Use customer breakdown from current filter data
        customer_breakdown: currentFilterAnalytics.customer_breakdown
      };
      setAnalyticsData(combinedAnalytics);
      
      setRetryCount(0); // Reset retry count on success
      setLastUpdated(new Date().toLocaleTimeString()); // Update last refresh time
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      
      if (!isRetry) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        
        // Simple retry after 5 seconds on error (only once)
        setTimeout(() => {
          loadDashboardData(true);
        }, 5000);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCameraConnectionChange = (isConnected: boolean) => {
    setIsCameraConnected(isConnected);
  };

  const handleFilterChange = async (filter: FilterType, customRange?: {startDate: string, endDate: string}) => {
    setCurrentFilter(filter);
    
    // Immediately reload dashboard data with new filter
    try {
      setRefreshing(true);
      if (filter !== 'custom') {
        // Clear custom date range and load data with empty date range
        setCustomDateRange({ startDate: '', endDate: '' });
        await loadDashboardData(false, filter, { startDate: '', endDate: '' });
      } else {
        // For custom filter, use provided range or existing date range
        const effectiveRange = customRange || customDateRange;
        await loadDashboardData(false, filter, effectiveRange);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleCustomDateRangeChange = async (startDate: string, endDate: string) => {
    setCustomDateRange({ startDate, endDate });
    // Note: Don't reload data here - let the caller (DashboardFilter) handle the flow
    // The DashboardFilter will call onFilterChange('custom') after this
  };

  const loadMoreEvents = async () => {
    if (loadingMoreEvents || !hasMoreEvents) return;
    
    setLoadingMoreEvents(true);
    try {
      // Use override parameters or current state for consistency
      const effectiveFilter = currentFilter;
      const effectiveDateRange = customDateRange;
      
      // Load a larger batch of events (we'll progressively increase the limit)
      const newLimit = events.length + 100; // Load 100 more events
      const allEvents = await apiService.getEvents(
        newLimit,
        effectiveFilter, 
        effectiveDateRange.startDate, 
        effectiveDateRange.endDate
      );
      
      setEvents(allEvents);
      // If we got fewer events than requested, we've reached the end
      setHasMoreEvents(allEvents.length >= newLimit);
    } catch (error) {
      console.error('Error loading more events:', error);
    } finally {
      setLoadingMoreEvents(false);
    }
  };

  // Calculate comparison text for today vs yesterday
  const getComparisonText = (currentEntries: number) => {
    if (currentFilter !== 'today' || !yesterdayStats) {
      // For non-today filters or when yesterday data isn't available, show simple text
      if (currentEntries === 0) return 'No activity';
      return `${currentEntries} ${currentFilter === 'yesterday' ? 'yesterday' : 
               currentFilter === 'this-week' ? 'this week' : 
               currentFilter === 'this-month' ? 'this month' : 
               'selected period'}`;
    }
    
    const yesterdayEntries = yesterdayStats.entries || 0;
    const difference = currentEntries - yesterdayEntries;
    
    if (difference === 0) {
      return 'Same as yesterday';
    } else if (difference > 0) {
      return `+${difference} vs yesterday`;
    } else {
      return `${difference} vs yesterday`; // difference is already negative
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="mx-auto mb-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              />
            </div>
          </motion.div>
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent"
          >
            Initializing AI Analytics...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="backdrop-blur-xl bg-slate-900/80 shadow-2xl border-b border-slate-700/50 sticky top-0 z-50 relative overflow-hidden"
      >
        {/* Top highlight bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        
        {/* Subtle moving light across header */}
        <motion.div
          className="absolute top-0 left-0 w-64 h-full opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.15), transparent)',
          }}
          animate={{
            x: ['-100%', '400%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="bg-gradient-to-br from-blue-600 to-blue-500 p-2 rounded-xl mr-3 shadow-lg relative overflow-hidden"
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.4)',
                    '0 0 40px rgba(59, 130, 246, 0.7)',
                    '0 0 20px rgba(59, 130, 246, 0.4)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Rotating light effect inside icon box */}
                <motion.div
                  className="absolute inset-0 opacity-50"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <Brain className="h-6 w-6 text-white relative z-10" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">
                  AI Footfall Analytics
                </h1>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-1"
                >
                  <Sparkles className="h-3 w-3 text-blue-400" />
                  <span className="text-xs text-slate-400 font-medium">Powered by Computer Vision</span>
                </motion.div>
              </div>
            </motion.div>
            <div className="flex items-center space-x-4">
              {/* Hidden Face Registration Button - DO NOT DELETE */}
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Register Face</span>
              </button>
              
              <motion.div 
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30"
                animate={{ 
                  borderColor: ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.6)', 'rgba(34, 197, 94, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div 
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-sm font-medium text-green-400">Live</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="space-y-6">
          
          {/* Error Banner */}
          {/* @ts-ignore - AnimatePresence React 19 compatibility */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error-banner"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 shadow-lg"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-300">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Layout - 2 Column Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6"
          >
            
            {/* Left Column - Stats, Filters, Video+Activity - 8 columns */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Today's Unique Customers */}
                <StatsCard
                  title="Today's Visitors"
                  value={dashboardStats?.entries || 0}
                  icon={<UserPlus className="h-5 w-5" />}
                  color="info"
                  change={`${dashboardStats?.entries || 0} unique visitors today`}
                />
                
                {/* All Time Total Customers */}
                <StatsCard
                  title="All Time Total"
                  value={dashboardStats?.total_customers || 0}
                  icon={<UserPlus className="h-5 w-5" />}
                  color="success"
                  change={`${dashboardStats?.total_customers || 0} total customers`}
                />
              </motion.div>

              {/* Dashboard Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <DashboardFilter
                  currentFilter={currentFilter}
                  onFilterChange={handleFilterChange}
                  customDateRange={customDateRange}
                  onCustomDateRangeChange={handleCustomDateRangeChange}
                  onExportPDF={() => setShowPdfExportModal(true)}
                  isLoading={refreshing}
                />
              </motion.div>

              {/* Video Stream + Activity Log */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-6"
              >
                
                {/* Video Stream Section - 3 columns */}
                <div className="lg:col-span-3">
                  <motion.div 
                    className="backdrop-blur-xl bg-slate-900/80 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden"
                    whileHover={{ scale: 1.01, boxShadow: '0 20px 50px rgba(59, 130, 246, 0.2)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Eye className="h-5 w-5 text-blue-600" />
                          </motion.div>
                          <h3 className="text-lg font-semibold text-slate-100">Live Camera Feed</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.div 
                            className="w-2 h-2 bg-red-400 rounded-full"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <span className="text-sm text-slate-400 font-medium">Recording</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Video Container with 16:9 aspect ratio */}
                    <div className="relative bg-gray-900" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                      <div className="absolute inset-0">
                        <StreamViewer onConnectionStatusChange={handleCameraConnectionChange} />
                      </div>
                    </div>
                    
                    {/* Stream Info */}
                    <div className="p-4 bg-slate-800/50 border-t border-slate-700/50">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Entry Point</span>
                          <span className="font-medium text-slate-200">Camera 1</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Resolution</span>
                          <span className="font-medium text-slate-200">2560×1440</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Activity Log Section - 2 columns */}
                <div className="lg:col-span-2">
                  <motion.div 
                    className="backdrop-blur-xl bg-slate-900/80 rounded-2xl shadow-2xl border border-slate-700/50 h-full"
                    whileHover={{ scale: 1.01, boxShadow: '0 20px 50px rgba(59, 130, 246, 0.2)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
                      <div className="flex items-center space-x-2">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <Activity className="h-5 w-5 text-blue-400" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-slate-100">Activity Log</h3>
                      </div>
                    </div>
                    <div className="p-4 h-[500px] overflow-auto">
                      <EventList 
                        events={events}
                        title=""
                        showAll={false}
                        hasMoreEvents={hasMoreEvents}
                        loadingMoreEvents={loadingMoreEvents}
                        onLoadMore={loadMoreEvents}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Analytics Dashboard (Moved Up) - 4 columns */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="xl:col-span-4"
            >
              <motion.div 
                className="backdrop-blur-xl bg-slate-900/80 rounded-2xl shadow-2xl border border-slate-700/50"
                whileHover={{ scale: 1.01, boxShadow: '0 20px 50px rgba(59, 130, 246, 0.2)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4">
                  <AnalyticsDashboard
                    analyticsData={analyticsData}
                    currentFilter={currentFilter}
                    isCameraConnected={isCameraConnected}
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Face Registration Modal - Hidden but available */}
      <FaceRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
      />

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={showPdfExportModal}
        onClose={() => setShowPdfExportModal(false)}
      />
    </div>
  );
}

export default App;

