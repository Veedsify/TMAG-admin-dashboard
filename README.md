# TMAG Admin Dashboard

A dedicated admin dashboard for company administrators to manage their organization's travel health management on the TMAG platform.

## Overview

This is a standalone React + Vite application cloned from the main client app, customized specifically for company admin users. It provides comprehensive tools for managing team members, credits, travel plans, and company settings.

## Features

### 1. **Company Profile Management**
- Edit company name, industry, logo, contact info
- Manage billing details and currency preferences
- View and share company invite code (TMA-XXXX format)

### 2. **Team Management**
- View all team members with roles and status
- Invite members individually or via bulk CSV upload
- Change member roles (Individual ↔ Admin)
- Assign/revoke HR roles
- Deactivate or remove members
- Track onboarding completion status

### 3. **Credit & Billing Management**
- View credit balance and transaction history
- Purchase credits with tiered pricing
- View and download invoices
- Set up auto-reload preferences
- Manage subscription settings

### 4. **Travel Plans Management**
- View all employee travel plans
- Create plans for employees
- View detailed plan information
- Edit and delete plans
- Filter by employee, destination, or status

### 5. **Travel Requests Management**
- View all pending and processed requests
- Approve/reject requests (single or bulk)
- Filter by employee, status, or date
- View request details and history

### 6. **Reports & Analytics**
- Generate usage reports
- Export plan history
- Compliance and duty-of-care documentation
- Export to CSV/PDF formats

### 7. **Audit Log**
- View all admin and HR actions
- Track invites sent, credits purchased, plans created
- Filter by user, action type, or date range
- Export audit trail for compliance

### 8. **API Key Management**
- Generate API keys for integrations
- Revoke keys
- View key usage statistics
- Manage permissions per key

### 9. **Data Export**
- Export all company data
- Employee lists with health profiles
- Travel plans and history
- Compliance documentation
- GDPR-compliant data portability

### 10. **Notification Center**
- View in-app notifications
- Mark as read/unread
- Dismiss notifications
- Filter by type or date

## Tech Stack

- **React 19** - UI framework
- **Vite 8** - Build tool
- **TypeScript** - Type safety
- **React Router 7** - Routing
- **TanStack Query** - Data fetching
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Access to TMAG backend API

### Installation

```bash
cd admin-dashboard
npm install  # or bun install
```

### Environment Setup

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Development

```bash
npm run dev  # Runs on port 3001
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
admin-dashboard/
├── src/
│   ├── api/              # API client and hooks
│   ├── components/
│   │   ├── admin/        # Admin-specific components
│   │   ├── ui/           # Reusable UI components
│   │   └── ...
│   ├── layouts/
│   │   ├── adminlayout.tsx    # Main admin layout
│   │   └── authlayouts.tsx    # Auth pages layout
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── dashboard.tsx
│   │   │   ├── company/
│   │   │   ├── team/
│   │   │   ├── credits/
│   │   │   ├── plans/
│   │   │   ├── requests/
│   │   │   ├── reports/
│   │   │   ├── audit/
│   │   │   ├── api-keys/
│   │   │   └── settings/
│   │   └── auth/         # Login, register, etc.
│   ├── routes/
│   │   └── route.tsx     # Route definitions
│   ├── stores/           # Zustand stores
│   ├── context/          # React contexts
│   └── main.tsx          # App entry point
├── public/               # Static assets
└── package.json
```

## Key Differences from Client App

### Removed Features
- Marketing pages (home, about, pricing, etc.)
- Individual user onboarding flow
- Public-facing content
- Blog and community features

### Added Features
- Company-wide management dashboard
- Team member management
- Bulk operations (invites, approvals)
- Audit logging
- API key management
- Advanced reporting and exports
- Admin-specific navigation and layouts

## Design System

The admin dashboard uses the same design tokens as the main client app:

### Colors
- **Primary**: `#2a7a6a` (Accent)
- **Background**: `#f6f0e9`
- **Text**: `#3d2c1e` (Heading), `#7a6a5a` (Muted)
- **Border**: `#d4c4b4`

### Typography
- **Sans**: Hanken Grotesk
- **Serif**: Fraunces
- **Mono**: SF Mono

### Components
All UI components maintain consistency with the main client app for a cohesive brand experience.

## API Integration

The admin dashboard connects to the same Spring Boot backend as the client app but uses admin-specific endpoints:

- `/api/v1/admin/*` - Admin operations
- `/api/v1/company/*` - Company management
- `/api/v1/employees/*` - Employee management
- `/api/v1/credits/*` - Credit operations
- `/api/v1/plans/*` - Travel plans
- `/api/v1/requests/*` - Travel requests

## Authentication

Admin users authenticate using the same JWT-based system as regular users but require the `Admin` role to access admin routes.

## Deployment

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment Variables

Production environment variables:

```env
VITE_API_URL=https://api.tmag.com/api/v1
```

### Hosting

Can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use Tailwind utility classes

### State Management
- Use TanStack Query for server state
- Use Zustand for client state
- Use React Context for auth state

### Performance
- Lazy load route components
- Optimize images
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

## Testing

```bash
npm run test  # Run tests
npm run test:coverage  # Coverage report
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - TMAG Platform

## Support

For issues or questions:
- Email: support@tmag.com
- Docs: https://docs.tmag.com/admin

---

**Version**: 1.0.0  
**Last Updated**: March 18, 2026  
**Port**: 3001 (development)
