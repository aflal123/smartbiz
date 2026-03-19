# SmartBiz Frontend Web

AI-Powered Business Management Suite — Web Dashboard

## 🖥️ Tech Stack
- React JS (Vite)
- Material UI (MUI)
- React Router DOM
- React Query (TanStack)
- Recharts
- jsPDF + jsPDF-AutoTable
- Axios
- React Hot Toast

## ✨ Features

### Authentication
- ✅ Register with OTP email verification
- ✅ Login with JWT
- ✅ Forgot & Reset Password

### Dashboard
- ✅ Today's revenue, expenses, profit
- ✅ Weekly revenue chart
- ✅ Recent sales list
- ✅ Low stock alerts
- ✅ AI insights button

### Products
- ✅ Add, edit, delete products
- ✅ Image upload with preview
- ✅ Quick category creation
- ✅ Barcode display
- ✅ Stock level indicators

### Customers
- ✅ Add, edit, delete customers
- ✅ Search by name, phone, email
- ✅ Outstanding balance tracking

### Suppliers
- ✅ Add, edit, delete suppliers
- ✅ Company name tracking
- ✅ Search functionality

### Sales
- ✅ Create sales with multiple items
- ✅ Auto price fill from product
- ✅ Live total calculation
- ✅ View invoice details
- ✅ Download invoice as PDF
- ✅ Print invoice
- ✅ Cancel sale (restores stock)

### Expenses
- ✅ Record and track expenses
- ✅ Category filtering
- ✅ Color coded categories
- ✅ Edit and delete

### Reports
- ✅ Date range selection
- ✅ Daily revenue chart
- ✅ Payment method pie chart
- ✅ Top selling products bar chart
- ✅ Export report as PDF

### AI Features
- ✅ Business insights analyzer
- ✅ Email composer
- ✅ Social media post generator
- ✅ Business chatbot

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- SmartBiz Backend running on port 8000

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/aflal123/smartbiz.git
cd smartbiz/frontend-web
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
http://localhost:5173
```

## 📁 Project Structure
```
frontend-web/
├── src/
│   ├── pages/
│   │   ├── auth/          # Login, Register, OTP, Reset
│   │   ├── dashboard/     # Dashboard with charts
│   │   ├── products/      # Product management
│   │   ├── customers/     # Customer management
│   │   ├── suppliers/     # Supplier management
│   │   ├── sales/         # Sales & invoices
│   │   ├── expenses/      # Expense tracking
│   │   ├── reports/       # Sales reports
│   │   └── ai/            # AI features
│   ├── components/
│   │   └── layout/        # Sidebar, Topbar, MainLayout
│   ├── context/
│   │   └── AuthContext    # Global auth state
│   ├── services/
│   │   └── api.js         # All API calls
│   └── main.jsx           # App entry point
├── public/
├── index.html
└── package.json
```

## 🔗 Related Projects
- [SmartBiz Backend](../backend)
- [SmartBiz Admin Panel](../admin-panel)
- [SmartBiz Mobile App](../mobile-app)