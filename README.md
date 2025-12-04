<div align="center">

# 🚶 Footfall UI - Real-Time Analytics Dashboard

### Modern React-TypeScript footfall analytics platform with AI-powered insights

[![React](https://img.shields.io/badge/React-19.1.0-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[🎬 Live Demo](#-live-demo) • [✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation)

</div>

---

## 🎬 Live Demo

<div align="center">

### Watch the Dashboard in Action

https://github.com/reshel3129/footfall/assets/dashboard-demo.mp4

**[📹 View Full Demo Video](./docs/videos/dashboard-demo.mp4)**

*Experience real-time footfall tracking, live video streams, and AI-powered analytics*

</div>

---

## ✨ Features

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">

### 📊 Real-Time Analytics
- Live footfall counting and tracking
- Interactive charts and visualizations
- Customizable date range filters
- Export reports to PDF

### 📹 Video Streaming
- HLS video stream support
- Multi-camera monitoring
- Real-time overlay annotations
- Stream quality controls

### 🎯 ROI Configuration
- Interactive canvas-based ROI setup
- Multiple region support
- Visual zone editing
- Save and load configurations

### 🤖 AI-Powered Insights
- Face recognition system
- Person tracking and identification
- Event detection and logging
- Smart notifications

### 🎨 Modern UI/UX
- Dark theme with smooth animations
- Responsive design for all devices
- Framer Motion animations
- Beautiful data visualizations

### ⚡ Performance
- Real-time WebSocket updates
- Optimized React components
- Efficient data caching
- Fast HLS streaming

</div>

---

## 🛠️ Technology Stack

```
Frontend Framework    React 19.1.0 with TypeScript
Styling              Tailwind CSS 3.4.17
State Management     React Hooks
Charts               Chart.js 4.5.0, Recharts 3.1.0
Animations           Framer Motion 11.0.0
Video Streaming      HLS.js 1.6.7
Real-time Updates    Socket.IO Client 4.8.1
PDF Generation       jsPDF 3.0.1, html2canvas 1.4.1
Build Tool           Create React App (react-scripts 5.0.1)
Icons                Lucide React 0.525.0
```

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 16.x
npm >= 8.x or yarn >= 1.22.x
```

### Installation

```bash
# Clone the repository
git clone https://github.com/reshel3129/footfall.git
cd footfall

# Install dependencies
npm install

# Configure environment
cp .env.development .env.local
# Edit .env.local with your API endpoints

# Start development server
npm start
```

The application will open at **http://localhost:3000** 🚀

### Build for Production

```bash
# Create optimized production build
npm run build

# The build folder is ready to deploy
```

---

## 📁 Project Structure

```
footfall-ui/
├── src/
│   ├── components/              # React components
│   │   ├── AnalyticsDashboard.tsx      # Main analytics view
│   │   ├── AnimatedBackground.tsx       # Animated background effects
│   │   ├── ChartCard.tsx                # Reusable chart component
│   │   ├── DashboardFilter.tsx          # Filter controls
│   │   ├── EventList.tsx                # Event log display
│   │   ├── FaceRegistrationModal.tsx    # Face registration UI
│   │   ├── MonitoringSections.tsx       # Monitoring panels
│   │   ├── PdfExportModal.tsx           # PDF export dialog
│   │   ├── PdfReportGenerator.tsx       # PDF generation logic
│   │   ├── PersonLogs.tsx               # Person tracking logs
│   │   ├── ROICanvas.tsx                # ROI canvas drawing
│   │   ├── ROIConfigurator.tsx          # ROI configuration UI
│   │   ├── StatsCard.tsx                # Statistics cards
│   │   ├── StreamViewer.tsx             # Video stream component
│   │   └── ui/                          # Reusable UI components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       └── card.tsx
│   ├── services/                # Services and API
│   │   ├── api.ts                       # API client
│   │   └── mockData.ts                  # Mock data for development
│   ├── App.tsx                  # Main application component
│   ├── App.css                  # Application styles
│   ├── index.tsx                # Application entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
├── docs/                        # Documentation
│   ├── images/                  # Documentation images
│   └── videos/                  # Demo videos
│       └── dashboard-demo.mp4   # Full demo video
├── screenshots/                 # UI screenshots
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

---

## 🎨 Screenshots

<div align="center">

### Dashboard Overview
![Dashboard](./screenshots/dashboard-main.png)
*Real-time analytics with live statistics and interactive charts*

### Analytics View
![Analytics](./screenshots/analytics-view.png)
*Comprehensive analytics with customizable filters and date ranges*

### Live Video Stream
![Video Stream](./screenshots/video-stream.png)
*HLS video streaming with real-time footfall overlay*

### ROI Configuration
![ROI Setup](./screenshots/roi-configuration.png)
*Interactive region of interest configuration tool*

</div>

> 📸 **Note**: Add your screenshots to the `screenshots/` directory - see [ADDING_MEDIA.md](./ADDING_MEDIA.md) for instructions

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 3000 |
| `npm test` | Run test suite in watch mode |
| `npm run build` | Create optimized production build |
| `npm run eject` | Eject from CRA (⚠️ irreversible) |

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# API Configuration
REACT_APP_API_URL=http://your-backend-url:3001
REACT_APP_WS_URL=ws://your-backend-url:3001

# Feature Flags
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_ENABLE_DEBUG=false

# Video Streaming
REACT_APP_HLS_STREAM_URL=http://your-stream-url/stream.m3u8
```

### API Integration

The application connects to a backend API for:
- Real-time footfall data
- Video stream URLs
- Person tracking information
- Event logs and notifications

Ensure your backend implements the required endpoints (see [API Documentation](./docs/API.md))

---

## 🌐 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=build
```

### Deploy with Nginx

```bash
# Build the application
npm run build

# Copy build files to nginx directory
sudo cp -r build/* /var/www/html/footfall/

# Configure nginx (see nginx.conf.example)
sudo systemctl restart nginx
```

### Deploy with PM2

```bash
# Install PM2
npm install -g pm2

# Start with ecosystem file
pm2 start ecosystem.config.js

# Save configuration
pm2 save
```

---

## 📖 Documentation

- 📘 [API Documentation](./docs/API.md)
- 🎨 [Dark Theme Transformation](./DARK_THEME_TRANSFORMATION.md)
- 🤖 [AI Integration Guide](./AI_TRANSFORMATION_SUMMARY.md)
- 💡 [Lighting Effects](./LIGHTING_EFFECTS.md)
- 📊 [Mock Data Information](./DUMMY_DATA_INFO.md)
- 📸 [Adding Screenshots & Videos](./ADDING_MEDIA.md)
- 🚀 [Quick Media Guide](./QUICK_MEDIA_GUIDE.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Issues & Support

Found a bug? Have a feature request? Please [open an issue](https://github.com/reshel3129/footfall/issues).

For support, please check the [documentation](./docs/) first or contact the maintainers.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide Icons](https://lucide.dev/)
- Charts powered by [Chart.js](https://www.chartjs.org/) and [Recharts](https://recharts.org/)

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ for smart footfall analytics**

[Report Bug](https://github.com/reshel3129/footfall/issues) • [Request Feature](https://github.com/reshel3129/footfall/issues) • [Documentation](./docs/)

</div>
