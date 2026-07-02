# 🚗 Dealership Inventory Management System

A modern, full-stack web application for managing and browsing vehicle inventory. Built with **React + Vite** on the frontend and **Python Flask** on the backend, this system provides a seamless experience for both customers and admin users.

**Live Demo**: [Visit the dealership website](https://tahoekings.com)

---

## ✨ Key Features

### Customer-Facing Features
- **Browse Inventory**: Interactive catalog with 50+ vehicle listings
- **Advanced Search & Filtering**: Sort by price, model, year, and more
- **Detailed Vehicle Pages**: High-quality images, specs, and pricing information
- **Image Gallery**: Professional photo carousel for each vehicle
- **Responsive Design**: Mobile-optimized interface for seamless browsing
- **Newsletter Signup**: Customers can subscribe to new listing notifications (and unsubscribe via email)
- **Contact & Inquiry Forms**: Direct communication channels to dealership

### Admin Dashboard Features
- **Vehicle Management**: Add, update, and delete vehicles from inventory
- **Image Upload & Management**: 
  - Multi-image upload capability
  - Built-in image cropping tool for optimization via css to preserve full image
  - Drag-and-drop interface
  - Set main display image per vehicle
- **Inventory Status Control**: Mark vehicles as Available, Pending, Sold, or Hidden
- **Email Notifications**: Auto-notify subscribers when new vehicles are added
- **Role-Based Access**: Secure admin authentication with JWT tokens
- **Bulk Operations**: Efficient management of multiple vehicles

### User System
- **Secure Authentication**: JWT-based login/registration system
- **Email Verification**: Account security with email validation
- **Admin Role Management**: Hierarchical access control
- **Persistent Sessions**: Secure token storage with automatic sync

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 (latest)
- Vite (ultra-fast build tool)
- React Router v7 (client-side routing)
- react-easy-crop (image cropping)
- CSS3 (custom styling, no frameworks)
- ESLint (code quality)

**Backend:**
- Python Flask (REST API)
- Avien MySQL database
- JWT authentication
- Email integration (improvMX)
- Image processing

**Infrastructure & Services:**
- Render (frontend & backend hosting)
- ImgBB (image hosting)
- Resend (email forwarding)
- Namecheap (domain management)
- Environment variable management
- CI/CD ready

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd dealership-frontend

# Install dependencies
npm install

# Create .env file with API URL
echo "VITE_API_URL=https://your-backend-api.com" > .env

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm start  # Starts production server on port 3000
```

---

## 📁 Project Structure

```
src/
├── pages/              # Route components
│   ├── LandingPage.jsx    # Hero section with featured vehicles
│   ├── Inventory.jsx      # Main vehicle catalog
│   ├── CarDetails.jsx     # Individual vehicle page
│   ├── AboutUs.jsx
│   └── Contact.jsx
├── components/         # Reusable UI components
│   ├── AddCar.jsx         # Admin form to add vehicles
│   ├── UpdateCar.jsx      # Admin form to edit vehicles
│   ├── ImageManager.jsx   # Image upload & crop tool
│   ├── CarCard.jsx        # Vehicle display card
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Navbar.jsx
├── hooks/              # Custom React hooks
│   └── useBodyModalLock.js  # Prevent scroll when modals open
└── utils/              # Helper functions
    └── notify.js          # Toast notification system
```

---

## 🔐 API Integration

This frontend integrates with the Flask backend API for:
- `/get_cars` - Fetch vehicle inventory
- `/add_car` - Create new listing (admin)
- `/update_car` - Modify vehicle details (admin)
- `/delete_car` - Remove listings (admin)
- `/login` - User authentication
- `/register` - New account creation
- `/upload` - Image uploads with validation

---

## 💡 Notable Implementation Details

✅ **Stale Request Prevention**: Uses ref tracking to ignore outdated API responses
✅ **Image Optimization**: Client-side cropping before upload; images hosted on ImgBB for fast CDN delivery
✅ **Modal Management**: Custom hook prevents body scroll when modals are active
✅ **Admin State Sync**: Real-time detection of role changes across browser tabs
✅ **Responsive UI**: Works flawlessly on desktop, tablet, and mobile devices
✅ **Error Handling**: User-friendly toast notifications for all actions
✅ **Email Integration**: Subscribers receive notifications via Resend email forwarding for new listings

---

## 📊 Performance Optimizations

- **Vite's Lightning-Fast Build**: 5-10x faster than Webpack
- **SWC Transpilation**: Significantly faster than Babel
- **Code Splitting**: Automatic route-based chunking
- **HMR (Hot Module Replacement)**: Instant updates during development
- **CSS Modules**: Scoped styling prevents conflicts

---

## 🔗 Related Repositories

- **Backend API**: [dealership-backend](https://github.com/dylangoble/dealership-backend)

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Get In Touch

Questions or feedback? Feel free to open an issue or reach out directly!

**Built with ❤️ by Dylan Goble**