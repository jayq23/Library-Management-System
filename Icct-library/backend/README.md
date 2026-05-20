# Library Management System - Backend Setup

## **Installation Steps**

### **Step 1: Install Dependencies**
Navigate to the backend folder and install Node.js packages:

```bash
cd PROJECT/backend
npm install
```

This will install:
- **Express** - Web framework
- **CORS** - Cross-origin requests
- **Body-Parser** - JSON parsing

### **Step 2: Start the Backend Server**
```bash
npm start
```

You should see:
```
🚀 Backend server running on http://localhost:5000
📚 API Health: http://localhost:5000/api/health
```

### **Step 3: Keep Frontend Server Running**
In a **new terminal**, run the Python server:

```bash
cd PROJECT
python3 -m http.server 8000
```

## **Access the Application**

### **Frontend:**
```
http://localhost:8000/PROJECT/LOGIN/login.html
```

### **Backend API:**
```
http://localhost:5000/api/health
```

---

## **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### **Books**
- `GET /api/books` - Get all books
- `POST /api/books` - Add book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### **Borrow/Return**
- `POST /api/books/:id/borrow` - Borrow book
- `POST /api/books/:id/return` - Return book

### **Borrowers**
- `GET /api/borrowers` - Get all borrowers
- `POST /api/borrowers` - Add borrower

### **Stats**
- `GET /api/stats` - Get dashboard statistics

---

## **Data Storage**

All data is stored in JSON files in `backend/data/`:
- `users.json` - Registered users
- `books.json` - All books
- `borrowers.json` - Borrower information

Files are created automatically on first run.

---

## **Troubleshooting**

### **Error: Cannot find module 'express'**
```bash
npm install
```

### **Port 5000 already in use**
Edit `server.js` and change `const PORT = 5000;` to another port (e.g., 5001)

### **CORS errors**
Make sure backend is running and accessible at `http://localhost:5000`

### **Frontend won't load data**
Check browser console for errors. Backend must be running on port 5000.

---

## **Next Steps (Optional)**

To make it production-ready:
1. Add password hashing (bcrypt)
2. Migrate to MongoDB/PostgreSQL
3. Add authentication tokens (JWT)
4. Add input validation
5. Add rate limiting

---

**Happy coding! 🚀**
