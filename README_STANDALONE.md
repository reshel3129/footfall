# Footfall UI - Frontend Repository

This is a standalone repository containing the Footfall UI frontend application, backed up from the Cello deployment.

## 📦 Technology Stack

- **Framework**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS 3.4.17
- **Charts**: Chart.js, Recharts
- **Animations**: Framer Motion
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Video Streaming**: HLS.js
- **Real-time Updates**: Socket.IO Client
- **PDF Generation**: jsPDF, html2canvas

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone or extract this repository
```bash
cd footfall-ui-backup
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
   - Copy `.env.development` or `.env.production` as needed
   - Update the API endpoint URLs for your backend

4. Start development server
```bash
npm start
```
The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## 📁 Project Structure

```
footfall-ui-backup/
├── src/
│   ├── components/          # React components
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── AnimatedBackground.tsx
│   │   ├── ChartCard.tsx
│   │   ├── DashboardFilter.tsx
│   │   ├── EventList.tsx
│   │   ├── FaceRegistrationModal.tsx
│   │   ├── MonitoringSections.tsx
│   │   ├── PdfExportModal.tsx
│   │   ├── PdfReportGenerator.tsx
│   │   ├── PersonLogs.tsx
│   │   ├── ROICanvas.tsx
│   │   ├── ROIConfigurator.tsx
│   │   ├── StatsCard.tsx
│   │   ├── StreamViewer.tsx
│   │   └── ui/              # Reusable UI components
│   ├── services/            # API and data services
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## 🎨 Features

- Real-time footfall analytics dashboard
- Live video stream monitoring with HLS support
- ROI (Region of Interest) configuration
- Face registration system
- Event logging and tracking
- PDF report generation
- Dark theme with modern animations
- Responsive design

## 📚 Documentation

Additional documentation files included:
- `AI_TRANSFORMATION_SUMMARY.md` - AI-assisted development notes
- `DARK_THEME_TRANSFORMATION.md` - Dark theme implementation details
- `DUMMY_DATA_INFO.md` - Information about mock data
- `LIGHTING_EFFECTS.md` - Visual effects documentation

## 🔧 Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (one-way operation)

## 🌐 Deployment

The application can be deployed to various platforms:
- Nginx/Apache as static files
- PM2 for Node.js process management
- Cloud platforms (Vercel, Netlify, AWS, etc.)

## 📝 Notes

- This is a backup from the Cello production environment
- Make sure to update API endpoints before deployment
- Node modules are not included - run `npm install` first
- The `ecosystem.config.js` file is included for PM2 deployment

## 🔗 Backend Integration

This frontend requires a compatible Footfall backend API. Make sure to:
1. Configure the correct API base URL in environment files
2. Ensure WebSocket/Socket.IO connection settings are correct
3. Verify CORS settings on the backend

## 📄 License

[Add your license information here]

---

**Backup Created**: December 4, 2025
**Source**: Footfall Cello Deployment

