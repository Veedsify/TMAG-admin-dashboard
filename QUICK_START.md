# Quick Start Guide - TMAG Admin Dashboard

## 🚀 Get Running in 5 Minutes

### 1. Navigate to the project
```bash
cd /Users/dikewisdom/Documents/Projects/TMAG/travel-medicine-advisory-global/admin-dashboard
```

### 2. Install dependencies
```bash
npm install
# or
bun install
```

### 3. Create environment file
```bash
echo "VITE_API_URL=http://localhost:8080/api/v1" > .env
```

### 4. Start development server
```bash
npm run dev
```

### 5. Open in browser
```
http://localhost:3001
```

---

## 📱 What You'll See

### Login Page
- Navigate to `/auth/login`
- Use existing TMAG credentials
- Requires Admin role

### Dashboard
- Overview stats (team, credits, plans, requests)
- Quick actions
- Recent activity

### Navigation
- **Dashboard** - Main overview
- **Company Profile** - Edit company details, view invite code
- **Team Members** - Manage team, invite members
- **Credits & Billing** - Purchase credits, view transactions
- **Travel Plans** - (Placeholder) Manage employee plans
- **Travel Requests** - (Placeholder) Approve/reject requests
- **Reports** - (Placeholder) Generate reports
- **Audit Log** - (Placeholder) View action history
- **API Keys** - (Placeholder) Manage integrations
- **Settings** - (Placeholder) Admin preferences

---

## ✅ Fully Working Features

### 1. Company Profile
- Edit company name, industry, contact info
- View and copy invite code (TMA-XXXX)
- Change billing currency
- Save changes

### 2. Team Members
- View all team members
- Search by name or email
- See roles (Admin/Individual)
- See status (Active/Inactive)
- Access action menu (change role, deactivate)

### 3. Invite Members
- **Single/Multiple**: Add email addresses one by one
- **Bulk Upload**: Upload CSV file with multiple employees
- CSV format example provided
- Send invitations

### 4. Credits & Billing
- View balance (total, used, remaining)
- Purchase credits (50, 100, 200 tiers)
- View recent transactions
- See transaction details

### 5. Dashboard
- View key metrics
- Quick action buttons
- Recent activity feed

---

## 🔧 Testing the Features

### Test Company Profile
1. Go to **Company Profile**
2. Click the copy button next to invite code
3. Edit company name
4. Click "Save Changes"
5. See success toast

### Test Team Members
1. Go to **Team Members**
2. Use search bar to filter
3. Click three-dot menu on any member
4. See role change and deactivate options

### Test Invite Members
1. Go to **Team Members** → "Invite Members" button
2. Try single invite: enter email, click "Send Invitations"
3. Try bulk: switch to "Bulk Upload", select CSV file

### Test Credits
1. Go to **Credits & Billing**
2. View balance cards
3. Click "Purchase" on any tier
4. View transactions table

---

## 📝 Mock Data

The app currently uses mock data for demonstration:

### Company
- Name: TechCorp Global
- Invite Code: TMA-TC001
- Industry: Technology

### Team Members
- Sarah Chen (Admin)
- John Doe (Individual)
- Emma Wilson (Individual)
- Michael Brown (Inactive)

### Credits
- Total: 142
- Used: 58
- Remaining: 84

### Transactions
- Recent purchases and usage

---

## 🔌 Backend Integration

To connect to real backend:

### 1. Update API client
Edit `src/api/api.ts` to add admin endpoints:

```typescript
export const adminApi = {
  getCompany: () => api.get('/admin/company'),
  updateCompany: (data) => api.put('/admin/company', data),
  getMembers: (params) => api.get('/admin/members', { params }),
  // ... more endpoints
};
```

### 2. Create React Query hooks
Edit `src/api/hooks.ts`:

```typescript
export function useCompany() {
  return useQuery({
    queryKey: ['admin', 'company'],
    queryFn: adminApi.getCompany,
  });
}
```

### 3. Replace mock data
In each page component, replace mock data with API calls:

```typescript
// Before (mock)
const members = [{ id: 1, name: "Sarah" }];

// After (API)
const { data: members } = useCompanyMembers();
```

---

## 🎨 Customization

### Change Colors
Edit `src/index.css`:

```css
--color-accent: #2a7a6a;  /* Change this */
```

### Add New Page
1. Create file: `src/pages/admin/newpage.tsx`
2. Add route in `src/routes/route.tsx`
3. Add nav item in `src/components/admin/AdminSidebar.tsx`

### Modify Sidebar
Edit `src/components/admin/AdminSidebar.tsx`:

```typescript
const navItems = [
  { label: "New Page", href: "/admin/newpage", icon: LucideIcon },
  // ... existing items
];
```

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in package.json
"dev": "vite --port 3002"
```

### Dependencies not installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API connection errors
```bash
# Check .env file
cat .env

# Verify backend is running
curl http://localhost:8080/api/v1/health
```

### Build errors
```bash
# Clean build
rm -rf dist
npm run build
```

---

## 📚 Next Steps

1. **Review Documentation**
   - Read `README.md` for overview
   - Read `IMPLEMENTATION_GUIDE.md` for details
   - Read `ADMIN_DASHBOARD_SUMMARY.md` for status

2. **Implement Remaining Pages**
   - Travel Plans (list, details, create)
   - Travel Requests (list, approve/reject)
   - Onboarding Status
   - Invoices
   - Reports
   - Audit Log
   - API Keys
   - Settings
   - Data Export

3. **Connect to Backend**
   - Implement API endpoints
   - Add authentication checks
   - Test all CRUD operations

4. **Add Tests**
   - Unit tests for components
   - Integration tests for flows
   - E2E tests for critical paths

5. **Deploy**
   - Build production bundle
   - Deploy to hosting
   - Configure environment variables

---

## 💡 Tips

- **Use the sidebar collapse** - Click the arrow to save screen space
- **Check the console** - Useful for debugging
- **Use React DevTools** - Inspect component state
- **Test responsive** - Resize browser to test mobile views
- **Check network tab** - Monitor API calls (when connected)

---

## 🆘 Need Help?

- Check `IMPLEMENTATION_GUIDE.md` for detailed patterns
- Review existing implemented pages for examples
- Look at client app for similar components
- Check TanStack Query docs for data fetching
- Review Tailwind docs for styling

---

**Happy Coding! 🎉**

The admin dashboard is ready for development. Start by implementing the placeholder pages and connecting to your backend API.
