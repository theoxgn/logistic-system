# Shipper Tracking Dashboard

![contoh](https://github.com/theoxgn/logistic-system/blob/main/ss.png)

A real-time shipment tracking dashboard that integrates with Shipper's webhook system. Monitor your shipments with live updates and a clean, responsive interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D14.0-blue.svg)

## ✨ Features

- 🚚 Real-time tracking updates via Shipper webhooks
- ⚡ Live notifications using Socket.io
- 📊 Clean and responsive tracking dashboard
- 🔐 Secure webhook authentication
- 📱 Mobile-friendly design
- 🛢️ PostgreSQL data persistence
- 🔄 Auto-refresh and real-time sync
- 📝 Detailed tracking history
- 🔍 Advanced tracking search

## 🛠️ Tech Stack

### Backend
- **Express.js** - Fast, unopinionated web framework
- **PostgreSQL** - Robust, scalable database
- **Sequelize ORM** - Powerful ORM for PostgreSQL
- **Socket.io** - Real-time bidirectional event-based communication
- **Node.js** - JavaScript runtime

### Frontend
- **React.js** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io-client** - Client library for Socket.io
- **Shadcn UI** - React component library
- **Vite** - Frontend build tool

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- Shipper API credentials
- npm or yarn package manager

## 🔧 Environment Setup

### Backend (.env)
```env
PORT=5000
DB_NAME=shipper_tracking
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
SHIPPER_API_KEY=your_shipper_api_key
WEBHOOK_URL=your_webhook_url
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api
```

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/theoxgn/logistic-system.git
cd logistic-system
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Database setup**
```bash
# Create PostgreSQL database
createdb shipper_tracking

# Run migrations
cd ../backend
npx sequelize-cli db:migrate
```

5. **Start the application**
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

## 📁 Project Structure


```
shipper
├─ README.md
├─ backend
│  ├─ .env
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ server.js
│  └─ src
│     ├─ config
│     │  └─ config.js
│     ├─ routes
│     │  └─ shipper.routes.js
│     └─ services
│        └─ ShipperClient.js
└─ frontend
   ├─ .env
   ├─ README.md
   ├─ package-lock.json
   ├─ package.json
   ├─ postcss.config.js
   ├─ public
   │  ├─ favicon.ico
   │  ├─ index.html
   │  ├─ logo192.png
   │  ├─ logo512.png
   │  ├─ manifest.json
   │  └─ robots.txt
   ├─ src
   │  ├─ App.js
   │  ├─ components
   │  │  ├─ Navbar.js
   │  │  └─ common
   │  │     ├─ Alert.js
   │  │     ├─ Button.js
   │  │     └─ LoadingSpinner.js
   │  ├─ index.css
   │  ├─ index.js
   │  ├─ logo.svg
   │  ├─ pages
   │  │  ├─ Home.js
   │  │  ├─ LocationSearch.js
   │  │  ├─ OrderCreate.js
   │  │  ├─ PickupManagement.js
   │  │  ├─ ShippingCost.js
   │  │  └─ ShippingLabelPage.js
   │  ├─ services
   │  │  └─ api.js
   │  └─ styles.css
   └─ tailwind.config.js

```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
