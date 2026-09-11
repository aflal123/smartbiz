# SmartBiz Admin Panel

AI-Powered Business Management Suite — Admin Dashboard

## 🖥️ Tech Stack
- React JS (Vite)
- Material UI (MUI)
- React Router DOM
- React Query (TanStack)
- Axios
- React Hot Toast

## ✨ Features

### Authentication
- ✅ Secure admin login
- ✅ JWT token management
- ✅ Auto logout on token expiry

### Dashboard
- ✅ Total businesses count
- ✅ Total sales & revenue
- ✅ Total products across platform
- ✅ This month statistics
- ✅ Recent registrations list
- ✅ Top businesses by revenue

### Businesses Management
- ✅ View all registered businesses
- ✅ Search by name, business, email
- ✅ View detailed business stats
- ✅ Activate / Deactivate businesses
- ✅ Sales count per business

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- SmartBiz Backend running on port 8000

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/aflal123/smartbiz.git
cd smartbiz/admin-panel
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Start the development server
```bash
npm run dev
```

#### 4. Open in browser
```
http://localhost:5174
```

### Default Admin Credentials
```
Email:    admin@smartbiz.com
Password: admin123
```

> ⚠️ Change the password after first login!

## 📁 Project Structure
```
admin-panel/
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   └── businesses/
│   │       └── BusinessesPage.jsx
│   ├── components/
│   │   └── layout/
│   │       └── MainLayout.jsx
│   ├── context/
│   │   └── AdminAuthContext.jsx
│   ├── services/
│   │   └── api.js
│   └── main.jsx
├── public/
├── index.html
└── package.json
```

## 🔐 Security Notes
- Admin tokens are separate from user tokens
- Token type validation (`type: 'admin'`)
- Super admin role required for creating new admins
- All routes protected by `protectAdmin` middleware

## 🔗 Related Projects
- [SmartBiz Backend](../backend)
- [SmartBiz Frontend Web](../frontend-web)
- [SmartBiz Mobile App](../mobile-app)