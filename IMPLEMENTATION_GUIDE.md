# Admin Dashboard Implementation Guide

## Overview

The TMAG Admin Dashboard has been created as a standalone React application cloned from the client app. This guide covers the implementation details and next steps.

## What's Been Created

### 1. **Project Structure**
- ✅ Cloned client app to `admin-dashboard/`
- ✅ Updated package.json (name: "admin-dashboard", port: 3001)
- ✅ Removed marketing pages (home, about, pricing, etc.)
- ✅ Created admin-specific directory structure

### 2. **Core Components**
- ✅ `AdminSidebar.tsx` - Collapsible navigation sidebar
- ✅ `AdminHeader.tsx` - Header with notifications and profile
- ✅ `AdminLayout.tsx` - Main layout wrapper

### 3. **Routing**
- ✅ Complete route structure in `routes/route.tsx`
- ✅ Lazy loading for all admin pages
- ✅ Auth routes (login, register, etc.)
- ✅ Protected admin routes

### 4. **Pages Implemented**

#### Fully Implemented:
1. **Dashboard** (`admin/dashboard.tsx`)
   - Stats cards (team, credits, plans, requests)
   - Quick actions
   - Recent activity feed

2. **Company Profile** (`admin/company/profile.tsx`)
   - Company details form
   - Invite code display with copy function
   - Billing currency selection

3. **Team Members** (`admin/team/members.tsx`)
   - Member list with search
   - Role badges
   - Action menu (change role, deactivate)
   - Link to onboarding status

4. **Invite Members** (`admin/team/invite.tsx`)
   - Single/multiple email invites
   - Bulk CSV upload
   - CSV format example

5. **Credits Overview** (`admin/credits/overview.tsx`)
   - Balance cards (total, used, remaining)
   - Tiered pricing for purchases
   - Recent transactions table

#### Placeholder Pages (Need Implementation):
- Invoices
- Travel Plans (list, details, create)
- Travel Requests
- Reports
- Onboarding Status
- Audit Log
- API Keys
- Settings
- Data Export

### 5. **Design System**
- ✅ Same color scheme as client app
- ✅ Consistent typography (Hanken Grotesk, Fraunces)
- ✅ Tailwind CSS configuration
- ✅ Lucide React icons

## Directory Structure

```
admin-dashboard/
├── src/
│   ├── api/                    # API client (from client app)
│   ├── components/
│   │   ├── admin/              # NEW: Admin-specific components
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── AdminHeader.tsx
│   │   ├── ui/                 # Reusable UI components
│   │   └── ...
│   ├── layouts/
│   │   ├── adminlayout.tsx     # NEW: Admin layout
│   │   └── authlayouts.tsx     # Auth layout
│   ├── pages/
│   │   ├── admin/              # NEW: All admin pages
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
│   │   └── auth/               # Login, register, etc.
│   ├── routes/
│   │   └── route.tsx           # UPDATED: Admin routes
│   ├── stores/                 # State management
│   ├── context/                # React contexts
│   └── main.tsx                # UPDATED: Entry point
├── public/                     # Static assets
├── README.md                   # NEW: Admin dashboard docs
└── package.json                # UPDATED: Name and port
```

## Next Steps

### Phase 1: Complete Core Pages (Priority)

1. **Travel Plans Management**
   - List view with filters (employee, destination, status)
   - Detail view with health alerts and recommendations
   - Create plan form
   - Edit/delete functionality

2. **Travel Requests Management**
   - List view with filters
   - Approve/reject actions (single and bulk)
   - Request detail modal
   - Status tracking

3. **Onboarding Status**
   - Employee list with completion status
   - Filter by completion status
   - Send reminder functionality
   - View individual progress

4. **Invoices**
   - Invoice list with download buttons
   - Filter by date range
   - PDF generation
   - Payment status tracking

### Phase 2: Advanced Features

5. **Reports & Analytics**
   - Usage reports
   - Plan history exports
   - Compliance documentation
   - CSV/PDF export options

6. **Audit Log**
   - Action log table
   - Filter by user, action type, date
   - Export functionality
   - Detailed action view

7. **API Keys Management**
   - Generate new keys
   - Revoke keys
   - View usage statistics
   - Permission management

8. **Settings**
   - Admin profile settings
   - Notification preferences
   - Billing settings
   - Subscription management

9. **Data Export**
   - Export all company data
   - GDPR compliance tools
   - Selective data export
   - Format options (CSV, JSON, PDF)

### Phase 3: Polish & Optimization

10. **Notifications Center**
    - In-app notification list
    - Mark as read/unread
    - Notification preferences
    - Real-time updates

11. **Advanced Search**
    - Global search across all entities
    - Advanced filters
    - Saved searches
    - Search history

12. **Bulk Operations**
    - Bulk approve/reject requests
    - Bulk invite members
    - Bulk role changes
    - Bulk data exports

## Implementation Guidelines

### API Integration

All pages need to connect to backend endpoints:

```typescript
// Example API structure
const adminApi = {
  // Company
  getCompany: () => api.get('/admin/company'),
  updateCompany: (data) => api.put('/admin/company', data),
  
  // Team
  getMembers: (params) => api.get('/admin/members', { params }),
  inviteMember: (data) => api.post('/admin/members/invite', data),
  updateMemberRole: (id, role) => api.put(`/admin/members/${id}/role`, { role }),
  
  // Credits
  getCredits: () => api.get('/admin/credits'),
  purchaseCredits: (amount) => api.post('/admin/credits/purchase', { amount }),
  
  // Plans
  getPlans: (params) => api.get('/admin/plans', { params }),
  createPlan: (data) => api.post('/admin/plans', data),
  
  // Requests
  getRequests: (params) => api.get('/admin/requests', { params }),
  approveRequest: (id) => api.post(`/admin/requests/${id}/approve`),
  
  // Audit
  getAuditLog: (params) => api.get('/admin/audit', { params }),
  
  // API Keys
  getApiKeys: () => api.get('/admin/api-keys'),
  generateApiKey: (data) => api.post('/admin/api-keys', data),
};
```

### State Management

Use TanStack Query for server state:

```typescript
// Example query hook
export function useCompanyMembers(params?: MemberParams) {
  return useQuery({
    queryKey: ['admin', 'members', params],
    queryFn: () => adminApi.getMembers(params),
  });
}

// Example mutation hook
export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.inviteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
      toast.success('Invitation sent successfully');
    },
  });
}
```

### Component Patterns

Follow these patterns for consistency:

```typescript
// Page component structure
const PageName = () => {
  // 1. Hooks
  const { data, isLoading } = useQuery(...);
  const mutation = useMutation(...);
  
  // 2. Local state
  const [filter, setFilter] = useState('');
  
  // 3. Handlers
  const handleAction = () => { ... };
  
  // 4. Render
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-heading mb-2">Title</h1>
        <p className="text-sm text-muted">Description</p>
      </div>
      {/* Content */}
    </div>
  );
};
```

### Styling Guidelines

Use consistent Tailwind classes:

```typescript
// Card
<div className="bg-white rounded-2xl border border-border-light/50 p-6">

// Button Primary
<button className="px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors">

// Button Secondary
<button className="px-4 py-2.5 rounded-xl border border-border-light text-sm font-medium text-heading hover:border-accent/50 transition-colors">

// Input
<input className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors" />

// Table
<table className="w-full">
  <thead className="bg-background-primary border-b border-border-light/50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
```

## Testing

### Manual Testing Checklist

- [ ] All routes load without errors
- [ ] Sidebar navigation works
- [ ] Sidebar collapse/expand works
- [ ] Header profile menu works
- [ ] Dashboard stats display correctly
- [ ] Company profile form saves
- [ ] Invite code copy works
- [ ] Team members list displays
- [ ] Search filters members
- [ ] Invite form validates emails
- [ ] CSV upload accepts files
- [ ] Credits balance displays
- [ ] Purchase tiers are clickable
- [ ] Transactions table loads

### Browser Testing

Test in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

### Responsive Testing

Test at breakpoints:
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

## Deployment

### Development

```bash
cd admin-dashboard
npm install
npm run dev  # Runs on http://localhost:3001
```

### Production Build

```bash
npm run build
```

Output: `dist/` directory

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

Production:

```env
VITE_API_URL=https://api.tmag.com/api/v1
```

### Hosting Options

1. **Vercel** (Recommended)
   - Connect GitHub repo
   - Auto-deploy on push
   - Custom domain support

2. **Netlify**
   - Drag & drop dist folder
   - Or connect GitHub

3. **AWS S3 + CloudFront**
   - Upload dist to S3
   - Configure CloudFront distribution

## Backend Requirements

The admin dashboard requires these backend endpoints:

### Company Management
- `GET /api/v1/admin/company` - Get company details
- `PUT /api/v1/admin/company` - Update company
- `GET /api/v1/admin/company/invite-code` - Get invite code

### Team Management
- `GET /api/v1/admin/members` - List members
- `POST /api/v1/admin/members/invite` - Invite member(s)
- `POST /api/v1/admin/members/bulk-invite` - Bulk CSV invite
- `PUT /api/v1/admin/members/:id/role` - Change role
- `PUT /api/v1/admin/members/:id/status` - Activate/deactivate
- `DELETE /api/v1/admin/members/:id` - Remove member
- `GET /api/v1/admin/members/onboarding-status` - Onboarding status

### Credits & Billing
- `GET /api/v1/admin/credits` - Get balance
- `GET /api/v1/admin/credits/transactions` - Transaction history
- `POST /api/v1/admin/credits/purchase` - Purchase credits
- `GET /api/v1/admin/invoices` - List invoices
- `GET /api/v1/admin/invoices/:id/download` - Download invoice

### Travel Plans
- `GET /api/v1/admin/plans` - List plans
- `POST /api/v1/admin/plans` - Create plan
- `GET /api/v1/admin/plans/:id` - Get plan details
- `PUT /api/v1/admin/plans/:id` - Update plan
- `DELETE /api/v1/admin/plans/:id` - Delete plan

### Travel Requests
- `GET /api/v1/admin/requests` - List requests
- `POST /api/v1/admin/requests/:id/approve` - Approve request
- `POST /api/v1/admin/requests/:id/reject` - Reject request
- `POST /api/v1/admin/requests/bulk-approve` - Bulk approve

### Reports & Audit
- `GET /api/v1/admin/reports/usage` - Usage report
- `GET /api/v1/admin/reports/compliance` - Compliance report
- `GET /api/v1/admin/audit-log` - Audit log
- `GET /api/v1/admin/data-export` - Export data

### API Keys
- `GET /api/v1/admin/api-keys` - List keys
- `POST /api/v1/admin/api-keys` - Generate key
- `DELETE /api/v1/admin/api-keys/:id` - Revoke key

## Security Considerations

1. **Authentication**
   - Verify JWT tokens on all requests
   - Check for Admin role
   - Implement token refresh

2. **Authorization**
   - Verify user belongs to company
   - Check admin permissions
   - Audit all actions

3. **Data Protection**
   - Sanitize all inputs
   - Validate file uploads
   - Encrypt sensitive data

4. **Rate Limiting**
   - Limit API requests
   - Prevent brute force
   - Monitor suspicious activity

## Performance Optimization

1. **Code Splitting**
   - Lazy load routes ✅
   - Lazy load heavy components
   - Dynamic imports for modals

2. **Caching**
   - Use TanStack Query cache
   - Set appropriate stale times
   - Implement optimistic updates

3. **Bundle Size**
   - Analyze bundle with `npm run build -- --analyze`
   - Remove unused dependencies
   - Use tree-shaking

## Support & Maintenance

### Documentation
- Keep README.md updated
- Document new features
- Add inline code comments

### Monitoring
- Set up error tracking (Sentry)
- Monitor performance (Web Vitals)
- Track user analytics

### Updates
- Keep dependencies updated
- Follow React best practices
- Monitor security advisories

---

**Status**: Phase 1 - Core Structure Complete  
**Next**: Implement remaining pages and API integration  
**Timeline**: 2-3 weeks for full implementation  
**Team**: Frontend + Backend coordination required
