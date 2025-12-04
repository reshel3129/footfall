// Mock data for demonstration purposes
import { DashboardStats, Event } from './api';

// Generate mock dashboard stats
export const getMockDashboardStats = (): DashboardStats => {
  const entries = Math.floor(Math.random() * 150) + 50;
  const newCustomers = Math.floor(entries * 0.6); // 60% new customers
  const returningCustomers = entries - newCustomers; // 40% returning
  return {
    entries: entries,
    exits: Math.floor(entries * 0.9), // Most people who enter also exit
    current_occupancy: Math.floor(Math.random() * 30) + 5,
    total_customers: Math.floor(Math.random() * 500) + 200,
    new_customers: newCustomers,
    returning_customers: returningCustomers,
    last_updated: new Date().toISOString()
  };
};

// Generate mock events/activity logs
export const getMockEvents = (count: number = 50): Event[] => {
  const events: Event[] = [];
  const now = Date.now();
  
  const names = [
    'Sarah Johnson', 'Michael Chen', 'Emma Williams', 'David Rodriguez', 'Lisa Anderson',
    'James Martinez', 'Jennifer Taylor', 'Robert Brown', 'Maria Garcia', 'John Davis',
    'Regular Visitor', 'New Customer', 'Returning Customer', 'VIP Guest', 'Walk-in Customer'
  ];
  
  const types: ('entry' | 'exit' | 'returning')[] = ['entry', 'exit', 'returning'];
  const statuses: ('recognized' | 'pending' | 'unknown' | 'processed')[] = ['recognized', 'pending', 'unknown', 'processed'];
  
  for (let i = 0; i < count; i++) {
    const timestamp = now - (i * 60000 * Math.floor(Math.random() * 10 + 2)); // Random intervals 2-12 minutes
    const type = types[Math.floor(Math.random() * types.length)];
    const isReturning = Math.random() > 0.4; // 60% returning customers
    const name = names[Math.floor(Math.random() * names.length)];
    
    events.push({
      id: i + 1,
      timestamp: new Date(timestamp).toISOString(),
      type: type,
      event_type: type,
      person_name: name,
      customer_name: name,
      visit_count: isReturning ? Math.floor(Math.random() * 10) + 2 : 1,
      recognition_status: statuses[Math.floor(Math.random() * statuses.length)],
      is_returning: isReturning
    });
  }
  
  return events;
};

// Generate mock analytics data
export const getMockAnalytics = (filter: string = 'this-week') => {
  // Generate daily overview data (last 7 days)
  const getDailyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const entries = days.map(() => Math.floor(Math.random() * 100) + 20);
    return { labels: days, entries };
  };

  // Generate hourly data (24 hours)
  const getHourlyData = () => {
    const hours: string[] = [];
    const entries: number[] = [];
    
    for (let i = 0; i < 24; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
      // Simulate business hours having more traffic
      if (i >= 9 && i <= 21) {
        entries.push(Math.floor(Math.random() * 50) + 10);
      } else {
        entries.push(Math.floor(Math.random() * 10));
      }
    }
    
    return { labels: hours, entries };
  };

  const dailyData = getDailyData();
  const hourlyData = getHourlyData();
  const totalUniqueCustomers = Math.floor(Math.random() * 300) + 100;
  const newCustomers = Math.floor(totalUniqueCustomers * 0.6);
  const returningCustomers = totalUniqueCustomers - newCustomers;

  return {
    daily_overview: {
      labels: dailyData.labels,
      entries: dailyData.entries
    },
    hourly_analysis: {
      labels: hourlyData.labels,
      entries: hourlyData.entries,
      total_unique_customers: totalUniqueCustomers
    },
    customer_breakdown: {
      new_customers: newCustomers,
      returning_customers: returningCustomers
    },
    peak_hour: hourlyData.labels[hourlyData.entries.indexOf(Math.max(...hourlyData.entries))],
    total_entries: dailyData.entries.reduce((a, b) => a + b, 0)
  };
};

// Stream info mock
export const getMockStreamInfo = () => {
  return {
    stream_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    stream_name: 'Demo Camera',
    status: 'active'
  };
};

