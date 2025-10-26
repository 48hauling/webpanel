# 48 Hauling Web Panel

Complete logistics and fleet management web application for hauling operations.

## 🚀 Features

### Core Business Features
- **Loads Management** - Create, assign, and track deliveries with pickup/delivery details
- **Driver Management** - Manage driver profiles, licenses, and vehicle assignments
- **DVIR Reports** - Digital Vehicle Inspection Reports with signature capture
- **BOL Documents** - Bill of Lading document viewer and management
- **Messaging & Announcements** - Admin-driver communication system
- **GPS Tracking** - Real-time location tracking with route history
- **Analytics** - Performance metrics, revenue tracking, and driver statistics
- **Settings** - Application configuration and preferences

### Technical & Monitoring
- **Audit Logs** - Complete activity tracking for compliance
- **Database Management** - SQL query executor and schema browser
- **Live Device Status** - Monitor driver connectivity in real-time
- **Error Logs** - Application error tracking and debugging
- **User Issues** - Issue reporting and resolution system
- **API Observability** - Monitor API health and performance

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Backend**: DevAPI REST API (15+ endpoints)
- **Database**: PostgreSQL
- **Maps**: Leaflet with OpenStreetMap
- **Authentication**: JWT tokens via DevAPI

## 📋 Project Structure

```
api-main/
├── web-panel/              # Next.js application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/          # DevAPI client & utilities
│   │   └── types/        # TypeScript definitions
│   ├── public/           # Static assets
│   └── package.json
├── sql/                  # Database schemas
└── README.md
```

## 🏃 Quick Start

### 1. Installation

```bash
git clone https://github.com/48hauling/webpanel.git
cd webpanel/web-panel
npm install
```

### 2. Environment Setup

Create `web-panel/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.azdevops.io/api
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 API Integration

The web panel integrates with **DevAPI** - a custom Node.js/Express REST API.

**API Endpoints**: See [API_ENDPOINTS.md](./API_ENDPOINTS.md)
**API Documentation**: https://www.azdevops.io

All API requests use JWT Bearer token authentication.

## 🔐 Authentication

1. Login at `/login` with admin credentials
2. JWT token stored in cookies
3. Token validated on each API request
4. Auto-logout on token expiration

## 📊 Key Components

### Business Components
- `LoadsManagement` - Job creation and tracking
- `DriverManagement` - Driver CRUD operations
- `DvirManagement` - Vehicle inspection forms
- `BolViewer` - Document management
- `MessagingTab` - Communication system
- `GpsTracking` - Live map view
- `AnalyticsTab` - Business metrics

### Technical Components
- `DatabaseManagement` - SQL query interface
- `AuditLogsTab` - Activity tracking
- `LiveStatusTab` - Device monitoring
- `ErrorLogsTab` - Error management
- `SettingsTab` - Configuration panel

## 🚀 Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://api.azdevops.io/api
   ```
3. Deploy automatically on push to `main`

### Production Checklist

- [ ] Environment variables configured
- [ ] DevAPI backend running at production URL
- [ ] Database schema deployed
- [ ] Admin user created
- [ ] SSL certificates valid
- [ ] CORS configured for production domain

## 📝 Database Schema

See `/sql/` directory for complete PostgreSQL schemas:

- `schema.sql` - Core tables (jobs, drivers, locations)
- `audit_logs_table.sql` - Audit trail
- Additional migration files for specific features

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (Admin/Driver/User)
- Audit logging on all actions
- SQL injection protection
- XSS prevention
- CORS configuration
- Rate limiting on DevAPI

## 📚 Documentation

- **[API Endpoints](./API_ENDPOINTS.md)** - Complete REST API reference
- **[Production Roadmap](./PRODUCTION_ROADMAP.md)** - Feature roadmap

## 🤝 Contributing

Created by **Andy** (GitHub: [@AndyBodnar](https://github.com/AndyBodnar)) and **Dev Collective**

For questions or support: https://www.azdevops.io

## 📄 License

Proprietary - 48 Hauling

---

**Built with ❤️ for the hauling industry**
