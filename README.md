# Sweet Shop Management System

A full-stack, responsive **Single Page Application (SPA)** for managing a sweet shop’s inventory and sales.  
Built using **Test-Driven Development (TDD)** and modern web technologies.

This project focuses on **clean architecture, secure authentication, role-based access control, and full backend test coverage**.

---

## 🚀 Features

### Authentication
- Secure User Registration & Login
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access (User vs Admin)

### Product Dashboard
- View all available sweets
- Dynamic search by name or category
- Real-time inventory updates

### Inventory Management
- Purchase sweets (automatic stock reduction)
- Stock availability validation
- Real-time stock tracking

### Admin (Manager Portal)
- Restricted admin access
- Add new sweets via modal
- Restock existing sweets
- Delete sweets with confirmation popup

### UI & UX
- Fully responsive design
- Built with Tailwind CSS
- Toast notifications for actions
- Clean, modern SPA experience

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- React Router DOM
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt

### Testing
- Jest
- Supertest
- 100% backend endpoint coverage

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v14+
- MongoDB (Local or Atlas)

---

### Clone the Repository
```bash
git clone https://github.com/tm33976/Sweet-Shop-Management-System.git
cd sweet-shop-management
```

---

### Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_key_change_this

# Live Database (Used by the App)
MONGO_URI=mongodb://localhost:27017/sweetshop_live

# Test Database (Used by npm test - This gets wiped automatically)
MONGO_URI_TEST=mongodb://localhost:27017/sweetshop_test_execution
```

Start the server:

```bash
npm start
```

---

### Frontend Setup
```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the React app:

```bash
npm run dev
```

App runs at:  
```
http://localhost:5173
```

---

## 👑 How to Create an Admin User

By default, all users register as **Customers**.

To access the **Admin Dashboard**:

1. Register a new user in the app
2. Open **MongoDB Compass**
3. Connect to `sweetshop_live`
4. Open the `users` collection
5. Find your user document
6. Set `isAdmin` to `true` (Boolean)
7. Refresh the app

Admin controls will now be visible.

---

## 🧪 Running Tests

This project follows **Test-Driven Development (TDD)** and maintains **100% backend test coverage**.

```bash
cd server
npm test
```

**Note:**  
Tests use a separate database (`sweetshop_test_execution`) to avoid corrupting live data.

---

## 🤖 AI Usage Disclosure

AI tools (**Gemini**) were used to accelerate development:

- Jest & Supertest scaffolding
- Debugging MongoDB test isolation issues
- Regex-based search logic
- Tailwind CSS component scaffolding

AI assisted with **syntax and configuration only**  not system architecture or business logic.

---

## 📝 API Endpoints

| Method | Endpoint | Description | Access |
|------|--------|------------|--------|
| POST | /api/auth/register | Register user | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/sweets | Get all sweets | Public |
| GET | /api/sweets/search | Search sweets | Public |
| POST | /api/sweets | Add new sweet | Admin |
| PUT | /api/sweets/:id | Update sweet | Admin |
| DELETE | /api/sweets/:id | Delete sweet | Admin |
| POST | /api/sweets/:id/purchase | Purchase sweet | User |
| POST | /api/sweets/:id/restock | Restock sweet | Admin |

---



## 👨‍💻 Author
**Tushar Mishra**  
 tm3390782@gmail.com

---
