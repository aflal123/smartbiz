# SmartBiz Backend API

AI-Powered Business Management Suite — REST API

## 🛠️ Tech Stack
- Node.js + Express JS
- MySQL + Sequelize ORM
- JWT Authentication
- OpenAI (GPT-3.5-turbo)
- Nodemailer (Gmail SMTP)
- Multer + Sharp (Image Upload & Compression)
- PDFKit (Invoice PDF Generation)
- bwip-js (Barcode Generation)
- bcryptjs

## ✨ Features

### Authentication
- ✅ Register with OTP email verification
- ✅ JWT login
- ✅ Forgot & Reset Password

### Products & Inventory
- ✅ CRUD with image upload
- ✅ Image compression (WebP)
- ✅ Barcode generation
- ✅ Low stock alerts
- ✅ Category management

### Sales & Invoices
- ✅ Create sales with multiple items
- ✅ Auto invoice number generation
- ✅ Auto stock reduction
- ✅ Invoice PDF download
- ✅ Cancel sale with stock restore

### Customers & Suppliers
- ✅ Full CRUD
- ✅ Input validation

### Expenses & Dashboard
- ✅ Expense tracking by category
- ✅ Dashboard with revenue, profit, stats
- ✅ Low stock alerts

### Reports
- ✅ Date range sales reports
- ✅ Top selling products
- ✅ Daily breakdown
- ✅ Payment method breakdown

### AI Integration (OpenAI)
- ✅ Business insights generator
- ✅ Email composer
- ✅ Social media post generator
- ✅ Business chatbot

### Admin Panel API
- ✅ Admin authentication (separate JWT)
- ✅ System-wide statistics
- ✅ Business management
- ✅ Toggle user status

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8+
- OpenAI API Key
- Gmail App Password

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/aflal123/smartbiz.git
cd smartbiz/backend
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Create `.env` file
```bash
cp .env.example .env
```

Fill in your values:
```env
PORT=8000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smartbiz_db
JWT_SECRET=your_super_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key
```

#### 4. Create MySQL database
```sql
CREATE DATABASE smartbiz_db;
```

#### 5. Start the server
```bash
npm run dev
```

> ✅ Server runs on: `http://localhost:8000`

## 📁 Project Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js     # Sequelize connection
│   │   └── openai.js       # OpenAI client
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── category.controller.js
│   │   ├── customer.controller.js
│   │   ├── supplier.controller.js
│   │   ├── sale.controller.js
│   │   ├── expense.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── ai.controller.js
│   │   ├── admin.controller.js
│   │   └── admin.auth.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── admin.middleware.js
│   │   └── upload.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Customer.js
│   │   ├── Supplier.js
│   │   ├── Sale.js
│   │   ├── SaleItem.js
│   │   ├── Expense.js
│   │   ├── Admin.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── category.routes.js
│   │   ├── customer.routes.js
│   │   ├── supplier.routes.js
│   │   ├── sale.routes.js
│   │   ├── expense.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── ai.routes.js
│   │   └── admin.routes.js
│   ├── services/
│   │   ├── email.service.js
│   │   ├── ai.service.js
│   │   └── pdf.service.js
│   └── utils/
│       ├── validate.js
│       └── barcode.js
├── uploads/
│   ├── products/
│   └── barcodes/
├── .env.example
├── .gitignore
├── app.js
├── server.js
└── package.json
```

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/verify-otp | Verify OTP |
| POST | /api/auth/login | Login |
| POST | /api/auth/forgot-password | Forgot password |
| POST | /api/auth/reset-password | Reset password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | Get all products |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/sales | Get all sales |
| POST | /api/sales | Create sale |
| GET | /api/sales/report | Sales report |
| GET | /api/sales/:id | Get single sale |
| GET | /api/sales/:id/invoice | Download PDF |
| PUT | /api/sales/:id/cancel | Cancel sale |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/ai/insights | Business insights |
| POST | /api/ai/email | Compose email |
| POST | /api/ai/social-post | Social media post |
| POST | /api/ai/chat | Business chatbot |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/login | Admin login |
| GET | /api/admin/stats | System stats |
| GET | /api/admin/businesses | All businesses |
| GET | /api/admin/businesses/:id | Business details |
| PUT | /api/admin/businesses/:id/toggle | Toggle status |

## 🔗 Related Projects
- [SmartBiz Frontend Web](../frontend-web)
- [SmartBiz Admin Panel](../admin-panel)
- [SmartBiz Mobile App](../mobile-app)