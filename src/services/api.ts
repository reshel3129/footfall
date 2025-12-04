// Import socket.io-client
import { io } from 'socket.io-client';
import { 
  getMockDashboardStats, 
  getMockEvents, 
  getMockAnalytics,
  getMockStreamInfo 
} from './mockData';

// Enable mock data mode when backend is unavailable
const USE_MOCK_DATA = false; // Set to false when backend is ready

// TypeScript interfaces
export interface DashboardStats {
  entries: number;
  exits: number;
  current_occupancy: number;
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  last_updated: string;
}

export interface Event {
  id: number;
  timestamp: string;
  type: 'entry' | 'exit' | 'returning';
  event_type: 'entry' | 'exit' | 'returning';
  person_name: string;
  customer_name: string;
  visit_count: number;
  recognition_status: 'recognized' | 'pending' | 'unknown' | 'processed';
  is_returning: boolean;
  customer_type?: 'new' | 'returning';
}

export interface StreamInfo {
  stream_url: string;
  stream_active: boolean;
  resolution: string;
  fps: number;
}

export interface DailyStat {
  date: string;
  entries: number;
  exits: number;
  total_customers: number;
  net_flow: number;
}

// New interface for PDF export data
export interface PdfReportData {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totalUniqueVisitors: number;
  averageDailyFootfall: number;
  daysDiff: number;
  hourlyData: number[];
  hourlyLabels: string[];
  dailyData?: { date: string; visitors: number }[];
  newCustomers: number;
  returningCustomers: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ROIConfig {
  entry_line?: Point[];
  exit_line?: Point[];
  roi_area?: Point[];
  line_points: [number, number][];
  polygon_points: [number, number][];
  video_width?: number;
  video_height?: number;
}

// Base URL for API calls
const BASE_URL = 'https://footfall-cello.zainlee.com';

// API service class
class APIService {
  private socket: any = null;

  private async fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw new Error('Max retries exceeded');
  }

  connectSocket() {
    if (!this.socket) {
      this.socket = io(BASE_URL);
    }
    return this.socket;
  }

  onNewEvent(callback: (event: any) => void) {
    const socket = this.connectSocket();
    socket.on('new_event', callback);
    return socket;
  }

  offNewEvent(callback: (event: any) => void) {
    if (this.socket) {
      this.socket.off('new_event', callback);
    }
  }

  onDataUpdate(callback: (event: any) => void) {
    const socket = this.connectSocket();
    socket.on('data_updated', callback);
    return socket;
  }

  offDataUpdate(callback: (event: any) => void) {
    if (this.socket) {
      this.socket.off('data_updated', callback);
    }
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async getDashboardStats(filter: string = 'today', startDate?: string, endDate?: string) {
    // Return mock data if enabled
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(getMockDashboardStats()), 500);
      });
    }
    
    const params = new URLSearchParams();
    params.append('filter', filter);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = `${BASE_URL}/api/dashboard?${params.toString()}`;
    const response = await this.fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }



  async getStreamInfo() {
    // Return mock data if enabled
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(getMockStreamInfo()), 200);
      });
    }
    
    const url = `${BASE_URL}/api/stream-info`;
    const response = await this.fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }



  async getEvents(limit?: number, filter?: string, startDate?: string, endDate?: string) {
    // Return mock data if enabled
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(getMockEvents(limit || 50)), 300);
      });
    }
    
    const params = new URLSearchParams();
    
    if (limit) params.append('limit', limit.toString());
    if (filter) params.append('filter', filter);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = `${BASE_URL}/api/events?${params.toString()}`;
    const response = await this.fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getDailyStats(days: number) {
    const params = new URLSearchParams();
    params.append('days', days.toString());
    
    const url = `${BASE_URL}/api/daily-stats?${params.toString()}`;
    const response = await this.fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getAnalytics(filter: string = 'today', startDate?: string, endDate?: string) {
    // Return mock data if enabled
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(getMockAnalytics(filter)), 400);
      });
    }
    
    const params = new URLSearchParams();
    params.append('filter', filter);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = `${BASE_URL}/api/analytics?${params.toString()}`;
    const response = await this.fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // New method for PDF export data
  async getPdfReportData(startDate: string, endDate: string): Promise<PdfReportData> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Get analytics data for the date range
    const analyticsData = await this.getAnalytics('custom', startDate, endDate);
    
    // Get dashboard stats for total unique visitors
    const dashboardStats = await this.getDashboardStats('custom', startDate, endDate);
    
    // Get daily stats if multiple days
    let dailyData = undefined;
    if (daysDiff > 1) {
      const dailyStats = await this.getDailyStats(daysDiff);
      // Filter daily stats to match the exact date range
      dailyData = dailyStats
        .filter((stat: DailyStat) => {
          const statDate = new Date(stat.date);
          return statDate >= start && statDate <= end;
        })
        .map((stat: DailyStat) => ({
          date: stat.date,
          visitors: stat.entries
        }));
    }

    // Calculate new vs returning customers using historical database logic (same as dashboard)
    const events = await this.getEvents(1000, 'custom', startDate, endDate);
    
    // Get unique customers in the current period
    const uniqueCustomers = new Set<string>();
    events.forEach((event: Event) => {
      uniqueCustomers.add(event.customer_name);
    });
    
    // Get historical events before the start date to determine returning status
    const historicalStartDate = '2020-01-01';
    const dayBefore = new Date(startDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const historicalEndDate = dayBefore.toISOString().split('T')[0];
    
    const historicalEvents = await this.getEvents(10000, 'custom', historicalStartDate, historicalEndDate);
    const historicalCustomers = new Set<string>();
    historicalEvents.forEach((event: Event) => {
      historicalCustomers.add(event.customer_name);
    });
    
    let newCustomers = 0;
    let returningCustomers = 0;
    
    uniqueCustomers.forEach((customerName) => {
      if (historicalCustomers.has(customerName)) {
        returningCustomers++;
      } else {
        newCustomers++;
      }
    });

    return {
      dateRange: { startDate, endDate },
      totalUniqueVisitors: dashboardStats.total_customers || 0,
      averageDailyFootfall: daysDiff > 1 ? (dashboardStats.total_customers || 0) / daysDiff : (dashboardStats.total_customers || 0),
      daysDiff,
      hourlyData: analyticsData.hourly_analysis?.entries || [],
      hourlyLabels: analyticsData.hourly_analysis?.labels || [],
      dailyData,
      newCustomers: Math.max(0, newCustomers),
      returningCustomers: Math.max(0, returningCustomers)
    };
  }

  async getROIConfig() {
    const url = `${BASE_URL}/api/roi-config`;
    const response = await this.fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async saveROIConfig(config: ROIConfig) {
    const url = `${BASE_URL}/api/roi-config`;
    const response = await this.fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

// Export a singleton instance
export const apiService = new APIService(); 
export default apiService;