import React from 'react';
import { TrendingUp, TrendingDown, Users, BarChart3, Activity, Clock, PieChart } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { apiService } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsDashboardProps {
  analyticsData?: any;
  currentFilter: string;
  isCameraConnected?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analyticsData,
  currentFilter,
  isCameraConnected = true
}) => {
  // Use real data from API only
  let chartLabels, chartEntries, hours, hourlyEntries, newCustomers, returningCustomers;
  
  if (analyticsData && analyticsData.daily_overview && analyticsData.hourly_analysis) {
    // Use real data from API (backend already returns data in chronological order)
    chartLabels = analyticsData.daily_overview.labels || [];
    chartEntries = analyticsData.daily_overview.entries || [];
    
    hours = analyticsData.hourly_analysis.labels || [];
    hourlyEntries = analyticsData.hourly_analysis.entries || [];
    
    // Customer breakdown data
    newCustomers = analyticsData.customer_breakdown?.new_customers || 0;
    returningCustomers = analyticsData.customer_breakdown?.returning_customers || 0;
  } else {
    // No data available - use empty arrays
    chartLabels = [];
    chartEntries = [];
    
    hours = [];
    hourlyEntries = [];
    
    newCustomers = 0;
    returningCustomers = 0;
  }

  const totalEntries = chartEntries.reduce((sum: number, val: number) => sum + val, 0);
  const hourlyTotalEntries = hourlyEntries.reduce((sum: number, val: number) => sum + val, 0);
  const totalCustomers = newCustomers + returningCustomers;

  // Enhanced chart styling with gradients and better colors
  const activityChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Daily Visitors',
        data: chartEntries,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
        hoverBorderColor: 'rgba(59, 130, 246, 1)',
        hoverBorderWidth: 3,
      },
    ],
  };

  const patternChartData = {
    labels: hours,
    datasets: [
      {
        label: 'Hourly Traffic',
        data: hourlyEntries,
        backgroundColor: 'rgba(14, 165, 233, 0.8)', // Sky blue instead of purple
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(14, 165, 233, 0.9)',
        hoverBorderColor: 'rgba(14, 165, 233, 1)',
        hoverBorderWidth: 3,
      },
    ],
  };

  const customerBreakdownData = {
    labels: [`New Customers (${newCustomers})`, `Returning Customers (${returningCustomers})`],
    datasets: [
      {
        data: [newCustomers, returningCustomers],
        backgroundColor: [
          'rgba(6, 182, 212, 0.8)',   // Cyan/teal for new customers (fresh, new)
          'rgba(59, 130, 246, 0.8)',  // Blue for returning customers (consistent with theme)
        ],
        borderColor: [
          'rgba(6, 182, 212, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(6, 182, 212, 0.9)',
          'rgba(59, 130, 246, 0.9)',
        ],
        hoverBorderWidth: 3,
      },
    ],
  };

  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
          color: 'rgb(156, 163, 175)', // Dark theme color for legend labels
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = totalCustomers;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        displayColors: true,
        usePointStyle: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 11,
            family: 'Inter',
          },
          color: 'rgb(156, 163, 175)',
          padding: 8,
        },
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
        border: {
          display: false,
        },
      },
      x: {
        ticks: {
          font: {
            size: 11,
            family: 'Inter',
          },
          color: 'rgb(156, 163, 175)',
          padding: 8,
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 800,
      easing: 'easeInOutQuart',
    },
  };

  const EmptyState = ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: any }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/50 rounded-2xl p-6 mb-6 shadow-inner">
        <Icon className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 text-center max-w-xs">
        {subtitle}
      </p>
      <div className="mt-6 px-4 py-2 bg-gray-700/30 rounded-full">
        <span className="text-xs text-gray-500 font-medium">No data available</span>
      </div>
    </div>
  );

  // Calculate peak hour and trends
  const peakHour = hourlyEntries.indexOf(Math.max(...hourlyEntries));
  const peakTime = hours[peakHour] || 'N/A';
  // Since data is now in chronological order, most recent is at the end
  const todayTotal = chartEntries[chartEntries.length - 1] || 0;
  const yesterdayTotal = chartEntries[chartEntries.length - 2] || 0;
  const trend = todayTotal > yesterdayTotal ? 'up' : todayTotal < yesterdayTotal ? 'down' : 'same';
  const trendPercentage = yesterdayTotal > 0 ? Math.abs(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
        <div className="flex items-center space-x-3 mb-4 lg:mb-0">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
            <p className="text-sm text-gray-300 mt-1">Real-time insights and traffic patterns</p>
          </div>
        </div>
        
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Activity Overview */}
        <div className="bg-gray-800/50 rounded-2xl shadow-sm border border-gray-700/30 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">Activity Overview</h3>
                <p className="text-sm text-gray-400 mt-1">Last 7 days visitor trends</p>
              </div>
            </div>
            
            {trend !== 'same' && chartEntries.length > 1 && (
              <div className="flex items-center space-x-2">
                {trend === 'up' ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+{trendPercentage.toFixed(1)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm font-medium">-{trendPercentage.toFixed(1)}%</span>
                </div>
                )}
              </div>
            )}
          </div>

          <div className="h-64">
            {chartLabels.length === 0 ? (
              <EmptyState 
                title="No Activity Data" 
                subtitle="Visitor activity will appear here once data is available for the selected time period"
                icon={BarChart3}
              />
            ) : (
              <Bar data={activityChartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Pattern Analysis */}
        <div className="bg-gray-800/50 rounded-2xl shadow-sm border border-gray-700/30 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-sky-500/20 to-sky-600/10 p-3 rounded-xl">
                <Users className="h-6 w-6 text-sky-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">Pattern Analysis</h3>
                <p className="text-sm text-gray-400 mt-1">Today's hourly traffic breakdown</p>
              </div>
            </div>
            
            {peakTime !== 'N/A' && (
              <div className="text-right">
                <div className="text-xs text-gray-400">Peak Activity</div>
                <div className="text-lg font-bold text-sky-400">{peakTime}</div>
              </div>
            )}
          </div>

          <div className="h-64">
            {hours.length === 0 ? (
              <EmptyState 
                title="No Pattern Data" 
                subtitle="Hourly traffic patterns will be displayed here throughout the day"
                icon={Users}
              />
            ) : (
              <Bar data={patternChartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Customer Breakdown Pie Chart */}
        <div className="bg-gray-800/50 rounded-2xl shadow-sm border border-gray-700/30 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 p-3 rounded-xl">
                <PieChart className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">Customer Breakdown</h3>
                <p className="text-sm text-gray-400 mt-1">New vs returning customer distribution</p>
              </div>
            </div>
            
            {totalCustomers > 0 && (
              <div className="text-right">
                <div className="text-xs text-gray-400">Total Customers</div>
                <div className="text-lg font-bold text-cyan-400">{totalCustomers}</div>
              </div>
            )}
          </div>

          <div className="h-64">
            {totalCustomers === 0 ? (
              <EmptyState 
                title="No Customer Data" 
                subtitle="Customer breakdown will be displayed here when data is available"
                icon={PieChart}
              />
            ) : (
              <Pie data={customerBreakdownData} options={pieChartOptions} />
            )}
          </div>
        </div>
      </div>

             {/* Summary Cards */}
       {false && (totalEntries > 0 || hourlyTotalEntries > 0) && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
             <div className="flex items-center space-x-3">
               <div className="bg-blue-500 p-2 rounded-lg">
                 <BarChart3 className="h-5 w-5 text-white" />
               </div>
               <div>
                 <p className="text-sm font-medium text-blue-700">Weekly Activity</p>
                 <p className="text-2xl font-bold text-blue-900">{totalEntries}</p>
                 <p className="text-xs text-blue-600">Total visitors this week</p>
               </div>
             </div>
           </div>

           <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
             <div className="flex items-center space-x-3">
               <div className="bg-purple-500 p-2 rounded-lg">
                 <Users className="h-5 w-5 text-white" />
               </div>
               <div>
                 <p className="text-sm font-medium text-purple-700">Today's Traffic</p>
                 <p className="text-2xl font-bold text-purple-900">{hourlyTotalEntries}</p>
                 <p className="text-xs text-purple-600">Visitors detected today</p>
               </div>
             </div>
           </div>

           <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
             <div className="flex items-center space-x-3">
               <div className="bg-gray-500 p-2 rounded-lg">
                 <Clock className="h-5 w-5 text-white" />
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-700">Peak Time</p>
                 <p className="text-2xl font-bold text-gray-900">{peakTime}</p>
                 <p className="text-xs text-gray-600">Busiest hour today</p>
               </div>
             </div>
           </div>
         </div>
       )}
       
    </div>
  );
  };
  
  export default AnalyticsDashboard; 