
// =============================
// INITIALIZATION & SESSION CHECK
// =============================

const body = document.querySelector("body");
const sidebar = body.querySelector(".sidebar");
const toggle = body.querySelector(".toggle");
const API_URL = 'http://localhost:5000/api';

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});

// Check user session
function checkUserSession() {
    const user = sessionStorage.getItem("currentUser");
    if (!user) {
        window.location.href = "../LOGIN/login.html";
        return;
    }
    return JSON.parse(user);
}

// =============================
// GLOBAL DATA (from API)
// =============================

let books = [];
let borrowers = [];

function loadDataFromAPI() {
    return Promise.all([
        fetch(`${API_URL}/books`).then(r => r.json()).then(data => { books = data; }),
        fetch(`${API_URL}/borrowers`).then(r => r.json()).then(data => { borrowers = data; })
    ]).catch(err => {
        console.error('Error loading data:', err);
        alert('Error connecting to backend. Make sure server is running on port 5000');
    });
}

// =============================
// SPA NAVIGATION
// =============================

document.addEventListener("DOMContentLoaded", () => {
    checkUserSession();
    
    // Load data from API then initialize
    loadDataFromAPI().then(() => {
        const mainContent = document.getElementById("main-content");
        const links = document.querySelectorAll(".nav-link a");

        function loadPage(page) {
            fetch("pages/" + page + ".html")
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Page not found");
                    }
                    return response.text();
                })
                .then(data => {
                    mainContent.innerHTML = data;

                    // AUTO INITIALIZE DEPENDING ON PAGE
                    switch(page) {
                        case "dashboard":
                            initDashboard();
                            break;
                        case "manage-books":
                            renderBooks();
                            break;
                        case "borrowers":
                            initBorrowers();
                            break;
                        case "borrowed-books":
                            initBorrowedBooks();
                            break;
                        case "returned-books":
                            initReturnedBooks();
                            break;
                        case "reports":
                            initReports();
                            break;
                    }
                })
                .catch(error => {
                    console.error(error);
                    mainContent.innerHTML = "<h2>Error loading page</h2>";
                });
        }

        // Attach click events
        links.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                const page = this.getAttribute("data-page");
                loadPage(page);
            });
        });

        // Default page
        loadPage("dashboard");
    });
});

// =============================
// DASHBOARD 
// =============================

function initDashboard() {
    const totalBooks = document.getElementById('totalBooks');
    const borrowedBooks = document.getElementById('borrowedBooks');
    const returnedBooks = document.getElementById('returnedBooks');
    const totalBorrowers = document.getElementById('totalBorrowers');

    if (!totalBooks) return;

    // Get stats from API
    fetch(`${API_URL}/stats`)
        .then(r => r.json())
        .then(stats => {
            totalBooks.innerText = stats.totalBooks;
            borrowedBooks.innerText = stats.borrowedBooks;
            returnedBooks.innerText = stats.availableBooks;
            totalBorrowers.innerText = stats.totalBorrowers;
        })
        .catch(err => {
            console.error('Error fetching stats:', err);
            totalBooks.innerText = books.length;
            borrowedBooks.innerText = books.filter(b => b.status === "Borrowed").length;
            returnedBooks.innerText = books.filter(b => b.status === "Available").length;
            totalBorrowers.innerText = borrowers.length;
        });
}

// =============================
// MANAGE BOOKS 
// =============================

function renderBooks() {
    const bookTable = document.getElementById('book-table');
    if (!bookTable) return;

    bookTable.innerHTML = '';

    books.forEach((book) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>${book.status}</td>
            <td>
                <button class="delete-btn" data-book-id="${book.id}" 
                    style="padding:5px 10px;border:none;background:red;color:white;border-radius:4px;cursor:pointer;">
                    Delete
                </button>
            </td>
        `;

        bookTable.appendChild(row);
    });

    initDashboard();
}

// =============================
// BORROWED BOOKS
// =============================

function initBorrowedBooks() {
    const table = document.getElementById('borrowed-book-table');
    if (!table) return;
    
    // Clear placeholder rows
    table.innerHTML = '';
    
    if (books.length === 0) {
        table.innerHTML = '<tr><td colspan="6" style="text-align:center;">No books currently borrowed.</td></tr>';
        return;
    }
    
    const borrowed = books.filter(b => b.status === 'Borrowed');
    
    if (borrowed.length === 0) {
        table.innerHTML = '<tr><td colspan="6" style="text-align:center;">No books currently borrowed.</td></tr>';
        return;
    }
    
    borrowed.forEach((book) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.borrower || 'N/A'}</td>
            <td>${book.borrowDate || '-'}</td>
            <td>${book.dueDate || '-'}</td>
            <td>${book.status}</td>
        `;
        table.appendChild(row);
    });
}

// =============================
// RETURNED BOOKS
// =============================

function initReturnedBooks() {
    const table = document.getElementById('returned-book-table');
    if (!table) return;
    
    // Clear placeholder rows
    table.innerHTML = '';
    
    if (books.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align:center;">No books returned yet.</td></tr>';
        return;
    }
    
    const returned = books.filter(b => b.status === 'Returned');
    
    if (returned.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align:center;">No books returned yet.</td></tr>';
        return;
    }
    
    returned.forEach((book) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.returnDate || '-'}</td>
            <td>${book.condition || 'Good'}</td>
            <td>${book.remarks || ''}</td>
        `;
        table.appendChild(row);
    });
}

// =============================
// BORROWERS
// =============================

function initBorrowers() {
    const table = document.getElementById('borrowers-table');
    if (!table) return;
    
    // Clear placeholder rows
    table.innerHTML = '';
    
    if (borrowers.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align:center;">No borrowers yet.</td></tr>';
        return;
    }
    
    borrowers.forEach((borrower) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${borrower.id}</td>
            <td>${borrower.name}</td>
            <td>${borrower.contact || 'N/A'}</td>
            <td>${borrower.email}</td>
            <td>${borrower.booksBorrowed || 0}</td>
        `;
        table.appendChild(row);
    });
}

// =============================
// REPORTS
// =============================

function initReports() {
    const booksBorrowedMonth = document.getElementById('booksBorrowedMonth');
    const overdueBooks = document.getElementById('overdueBooks');
    const activeBorrowers = document.getElementById('activeBorrowers');
    const availableBooks = document.getElementById('availableBooks');

    // Get stats from API
    fetch(`${API_URL}/stats`)
        .then(r => r.json())
        .then(stats => {
            if (booksBorrowedMonth) booksBorrowedMonth.innerText = stats.borrowedBooks;
            if (overdueBooks) overdueBooks.innerText = stats.overdueBooks;
            if (activeBorrowers) activeBorrowers.innerText = stats.totalBorrowers;
            if (availableBooks) availableBooks.innerText = stats.availableBooks;
        })
        .catch(err => console.error('Error fetching stats:', err));
}

// =============================
// EVENT DELEGATION
// =============================

document.body.addEventListener('click', function (e) {

    if (e.target.id === 'addBookBtn') {
        document.getElementById('bookModal').style.display = 'flex';
    }

    if (e.target.id === 'closeModal') {
        document.getElementById('bookModal').style.display = 'none';
    }

    if (e.target.classList.contains('delete-btn')) {
        const bookId = e.target.dataset.bookId;
        
        if (confirm('Are you sure you want to delete this book?')) {
            fetch(`${API_URL}/books/${bookId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Failed to delete book');
                    });
                }
                return response.json();
            })
            .then(data => {
                alert('Book deleted successfully!');
                // Refresh books list
                fetch(`${API_URL}/books`).then(r => r.json()).then(data => {
                    books = data;
                    renderBooks();
                });
            })
            .catch(error => {
                alert(error.message);
            });
        }
    }
});

document.body.addEventListener('submit', function (e) {

    if (e.target.id === 'bookForm') {
        e.preventDefault();

        const bookId = document.getElementById('bookId').value.trim();
        const title = document.getElementById('bookTitle').value.trim();
        const author = document.getElementById('bookAuthor').value.trim();
        const category = document.getElementById('bookCategory').value.trim();
        const status = document.getElementById('bookStatus').value;

        const newBook = {
            id: bookId,
            title,
            author,
            category,
            status
        };

        // Send to backend API
        fetch(`${API_URL}/books`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to add book');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Book added successfully!');
            // Refresh books list
            fetch(`${API_URL}/books`).then(r => r.json()).then(data => {
                books = data;
                renderBooks();
            });
            document.getElementById('bookModal').style.display = 'none';
            e.target.reset();
        })
        .catch(error => {
            alert(error.message);
        });
    }
});

// =============================
// LOGOUT HANDLER
// =============================

function handleLogout(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to logout?")) {
        sessionStorage.removeItem("currentUser");
        window.location.href = "../LOGIN/login.html";
    }
}
