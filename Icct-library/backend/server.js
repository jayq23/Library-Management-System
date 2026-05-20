const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// MONGODB CONNECTION
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library-system';

let isMongoConnected = false;

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB');
    isMongoConnected = true;
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Using in-memory storage for development');
});

// ========================================
// DATABASE SCHEMAS
// ========================================

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], required: true },
    createdAt: { type: Date, default: Date.now }
});

// Book Schema
const bookSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ['Available', 'Borrowed', 'Returned'], default: 'Available' },
    borrower: { type: String, default: null },
    borrowDate: { type: String, default: null },
    dueDate: { type: String, default: null },
    returnDate: { type: String, default: null },
    condition: { type: String, default: 'Good' },
    createdAt: { type: Date, default: Date.now }
});

// Borrower Schema
const borrowerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact: { type: String, default: 'N/A' },
    booksBorrowed: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Book', bookSchema);
const Borrower = mongoose.model('Borrower', borrowerSchema);


// IN-MEMORY FALLBACK STORAGE (for development without MongoDB)
// In-memory storage
const inMemoryStore = {
    users: [],
    books: [],
    borrowers: []
};

// Add a sample admin and user for testing
const addTestData = () => {
    inMemoryStore.users.push({
        _id: '1',
        name: 'Admin User',
        email: 'admin@icct.edu.ph',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date()
    });
    inMemoryStore.users.push({
        _id: '2',
        name: 'Test Student',
        email: 'student@icct.edu.ph',
        password: 'student123',
        role: 'user',
        createdAt: new Date()
    });
    console.log('✅ Test data added to in-memory store');
};

// Call this on startup
setTimeout(addTestData, 1000);

// Database operation wrappers
const dbOps = {
    user: {
        findOne: async (query) => {
            if (isMongoConnected) {
                return await User.findOne(query);
            } else {
                return inMemoryStore.users.find(u => 
                    (!query.email || u.email === query.email) &&
                    (!query.password || u.password === query.password) &&
                    (!query.role || u.role === query.role)
                );
            }
        },
        create: async (data) => {
            if (isMongoConnected) {
                return await User.create(data);
            } else {
                const newUser = { _id: String(Date.now()), ...data };
                inMemoryStore.users.push(newUser);
                return newUser;
            }
        },
        find: async (query = {}) => {
            if (isMongoConnected) {
                return await User.find(query);
            } else {
                return inMemoryStore.users;
            }
        }
    },
    book: {
        find: async (query = {}) => {
            if (isMongoConnected) {
                return await Book.find(query);
            } else {
                return inMemoryStore.books;
            }
        },
        findOne: async (query) => {
            if (isMongoConnected) {
                return await Book.findOne(query);
            } else {
                return inMemoryStore.books.find(b => b.id === query.id);
            }
        },
        create: async (data) => {
            if (isMongoConnected) {
                return await Book.create(data);
            } else {
                const newBook = { _id: String(Date.now()), ...data };
                inMemoryStore.books.push(newBook);
                return newBook;
            }
        },
        updateOne: async (query, update) => {
            if (isMongoConnected) {
                return await Book.updateOne(query, update);
            } else {
                const book = inMemoryStore.books.find(b => b.id === query.id);
                if (book) {
                    Object.assign(book, update.$set || update);
                }
                return { modifiedCount: book ? 1 : 0 };
            }
        },
        deleteOne: async (query) => {
            if (isMongoConnected) {
                return await Book.deleteOne(query);
            } else {
                const idx = inMemoryStore.books.findIndex(b => b.id === query.id);
                if (idx > -1) {
                    inMemoryStore.books.splice(idx, 1);
                }
                return { deletedCount: idx > -1 ? 1 : 0 };
            }
        }
    },
    borrower: {
        find: async (query = {}) => {
            if (isMongoConnected) {
                return await Borrower.find(query);
            } else {
                return inMemoryStore.borrowers;
            }
        }
    }
};

// USER ENDPOINTS (AUTHENTICATION)
// Register user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields required' });
        }

        // Check if user exists
        const existingUser = await dbOps.user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new user
        const newUser = await dbOps.user.create({
            name,
            email,
            password, // In production, hash this with bcrypt!
            role,
            createdAt: new Date()
        });

        res.status(201).json({ 
            message: 'User registered successfully',
            user: { id: newUser._id, name, email, role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role required' });
        }

        const user = await dbOps.user.findOne({ email, password, role });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// BOOK ENDPOINTS
// Get all books
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add book
app.post('/api/books', async (req, res) => {
    try {
        const { id, title, author, category, status } = req.body;

        if (!id || !title || !author || !category) {
            return res.status(400).json({ error: 'All fields required' });
        }

        // Check if book ID already exists
        const existingBook = await Book.findOne({ id });
        if (existingBook) {
            return res.status(400).json({ error: 'Book ID already exists' });
        }

        const newBook = new Book({
            id,
            title,
            author,
            category,
            status: status || 'Available'
        });

        await newBook.save();

        res.status(201).json({ message: 'Book added', book: newBook });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update book
app.put('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const book = await Book.findOneAndUpdate({ id }, updates, { new: true });

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ message: 'Book updated', book });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete book
app.delete('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const book = await Book.findOneAndDelete({ id });

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ message: 'Book deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// BORROWER ENDPOINTS
// Get all borrowers
app.get('/api/borrowers', async (req, res) => {
    try {
        const borrowers = await Borrower.find();
        res.json(borrowers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add borrower
app.post('/api/borrowers', async (req, res) => {
    try {
        const { name, email, contact } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email required' });
        }

        const newBorrower = new Borrower({
            name,
            email,
            contact: contact || 'N/A'
        });

        await newBorrower.save();

        res.status(201).json({ message: 'Borrower added', borrower: newBorrower });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// BORROW/RETURN ENDPOINTS
// Borrow book
app.post('/api/books/:id/borrow', async (req, res) => {
    try {
        const { id } = req.params;
        const { borrower, borrowDate, dueDate } = req.body;

        if (!borrower) {
            return res.status(400).json({ error: 'Borrower name required' });
        }

        const book = await Book.findOne({ id });

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        if (book.status === 'Borrowed') {
            return res.status(400).json({ error: 'Book already borrowed' });
        }

        book.status = 'Borrowed';
        book.borrower = borrower;
        book.borrowDate = borrowDate || new Date().toISOString().split('T')[0];
        book.dueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        await book.save();

        res.json({ message: 'Book borrowed', book });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Return book
app.post('/api/books/:id/return', async (req, res) => {
    try {
        const { id } = req.params;
        const { returnDate, condition } = req.body;

        const book = await Book.findOne({ id });

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        book.status = 'Available';
        book.borrower = null;
        book.borrowDate = null;
        book.dueDate = null;
        book.returnDate = returnDate || new Date().toISOString().split('T')[0];
        book.condition = condition || 'Good';

        await book.save();

        res.json({ message: 'Book returned', book });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// DASHBOARD STATS
app.get('/api/stats', async (req, res) => {
    try {
        const books = await Book.find();
        const borrowers = await Borrower.find();

        const stats = {
            totalBooks: books.length,
            borrowedBooks: books.filter(b => b.status === 'Borrowed').length,
            availableBooks: books.filter(b => b.status === 'Available').length,
            totalBorrowers: borrowers.length,
            overdueBooks: books.filter(b => {
                if (!b.dueDate || b.status !== 'Borrowed') return false;
                const dueDate = new Date(b.dueDate);
                return dueDate < new Date();
            }).length
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// HEALTH CHECK

app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running', port: PORT, database: 'MongoDB Atlas' });
});


// START SERVER
app.listen(PORT, () => {
    console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
    console.log(`🗄️  Database: MongoDB Atlas\n`);
});
