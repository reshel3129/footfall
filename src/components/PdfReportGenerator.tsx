import React, { useRef, useState } from 'react';
import { ArrowLeft, Download, Loader2, Users, BarChart3, PieChart, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PdfReportData } from '../services/api';

interface PdfReportGeneratorProps {
  reportData: PdfReportData;
  onClose: () => void;
  onBack: () => void;
}

const PdfReportGenerator: React.FC<PdfReportGeneratorProps> = ({ reportData, onClose, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Prepare chart data
  const hourlyChartData = reportData.hourlyLabels.map((label, index) => ({
    hour: label,
    visitors: reportData.hourlyData[index] || 0
  }));

  const dailyChartData = reportData.dailyData?.map(item => ({
    date: formatShortDate(item.date),
    visitors: item.visitors
  })) || [];

  const pieChartData = [
    { name: 'New Visitors', value: reportData.newCustomers, color: '#3b82f6' },
    { name: 'Returning Visitors', value: reportData.returningCustomers, color: '#10b981' }
  ];

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    try {
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Capture the report content as canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        height: reportRef.current.scrollHeight,
        width: reportRef.current.scrollWidth
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      if (imgHeight <= pdfHeight - 20) {
        // Single page
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      } else {
        // Multiple pages
        let position = 0;
        let remainingHeight = imgHeight;
        
        while (remainingHeight > 0) {
          const pageHeight = Math.min(remainingHeight, pdfHeight - 20);
          
          pdf.addImage(imgData, 'PNG', 10, 10 - position, imgWidth, imgHeight);
          
          remainingHeight -= pageHeight;
          position += pageHeight;
          
          if (remainingHeight > 0) {
            pdf.addPage();
          }
        }
      }
      
      // Generate filename
      const filename = `footfall-report-${reportData.dateRange.startDate}-to-${reportData.dateRange.endDate}.pdf`;
      
      // Download PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">PDF Report Preview</h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {formatDate(reportData.dateRange.startDate)} to {formatDate(reportData.dateRange.endDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <button
            onClick={downloadPDF}
            disabled={isGenerating}
            className="px-3 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm sm:text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Generating PDF...</span>
                <span className="sm:hidden">Gen...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">Download</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-6">
        <div 
          ref={reportRef}
          className="bg-white rounded-lg shadow-lg p-4 sm:p-8 max-w-4xl mx-auto"
          style={{ minHeight: '800px' }}
        >
          {/* Report Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Footfall Analytics Report</h1>
            <p className="text-lg text-gray-600">
              {formatDate(reportData.dateRange.startDate)} to {formatDate(reportData.dateRange.endDate)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Generated on {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Summary Statistics */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="h-6 w-6 mr-2" />
              Summary Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {reportData.totalUniqueVisitors.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-blue-600">Total Unique Visitors</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {reportData.daysDiff > 1 
                      ? reportData.averageDailyFootfall.toFixed(1)
                      : reportData.totalUniqueVisitors.toLocaleString()
                    }
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {reportData.daysDiff > 1 ? 'Average Daily Footfall' : 'Daily Footfall'}
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-700 mb-2">
                    {reportData.daysDiff}
                  </div>
                  <div className="text-sm font-medium text-purple-600">
                    {reportData.daysDiff === 1 ? 'Day' : 'Days'} Analyzed
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Traffic Chart */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2" />
              {reportData.daysDiff > 1 ? 'Average Hourly Traffic' : 'Hourly Traffic Pattern'}
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12 }}
                    interval={1}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any) => [value, 'Visitors']}
                    labelStyle={{ color: '#1f2937' }}
                  />
                  <Bar dataKey="visitors" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Footfall Chart (only for multi-day) */}
          {reportData.daysDiff > 1 && reportData.dailyData && reportData.dailyData.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-2" />
                Daily Footfall Trend
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: any) => [value, 'Visitors']}
                      labelStyle={{ color: '#1f2937' }}
                    />
                    <Bar dataKey="visitors" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* New vs Returning Visitors */}
          {(reportData.newCustomers > 0 || reportData.returningCustomers > 0) && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <PieChart className="h-6 w-6 mr-2" />
                New vs Returning Visitors
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Tooltip 
                        formatter={(value: any, name: string) => [value, name]}
                      />
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">New Visitors</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {reportData.newCustomers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">Returning Visitors</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {reportData.returningCustomers}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-4">
                    <p>
                      <strong>Total Ratio:</strong> {' '}
                      {reportData.newCustomers + reportData.returningCustomers > 0 
                        ? `${((reportData.newCustomers / (reportData.newCustomers + reportData.returningCustomers)) * 100).toFixed(1)}% new, ${((reportData.returningCustomers / (reportData.newCustomers + reportData.returningCustomers)) * 100).toFixed(1)}% returning`
                        : 'No visitor data available'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report Footer */}
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              This report was automatically generated by the Footfall Analytics System
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PdfReportGenerator; 