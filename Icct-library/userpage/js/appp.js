const body = document.querySelector("body"),
     sidebar = body.querySelector(".sidebar"),
     toggle = body.querySelector(".toggle");
const API_URL = 'http://localhost:5000/api';

toggle.addEventListener("click", () =>{
    sidebar.classList.toggle("close");
});

// GLOBAL DATA & SIDEBAR

const links = document.querySelectorAll(".nav-link a");
const mainContent = document.getElementById("main-content");

// Check user session
function checkUserSession() {
    const user = sessionStorage.getItem("currentUser");
    if (!user) {
        window.location.href = "../LOGIN/login.html";
        return;
    }
    return JSON.parse(user);
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
    checkUserSession();
    loadPage("user-dashboard");
});

// PAGE LOADER WITH SCRIPT INITIALIZATION

function loadPage(page) {
    mainContent.innerHTML = "<h2>Loading...</h2>";
    
    fetch("./pages/" + page + ".html")
        .then(response => {
            if (!response.ok) {
                throw new Error("Page not found");
            }
            return response.text();
        })
        .then(data => {
            mainContent.innerHTML = data;
            
            // Load page-specific script and initialize
            loadPageScript(page);
        })
        .catch(error => {
            console.error(error);
            mainContent.innerHTML = "<h2>Error loading page</h2><p>" + error.message + "</p>";
        });
}

function loadPageScript(page) {
    // Initialize page-specific functions
    if (page === "user-dashboard" && typeof initDashboard === "function") {
        initDashboard();
    } else if (page === "borrow-books" && typeof initBorrowBooks === "function") {
        initBorrowBooks();
    } else if (page === "my-borrowed" && typeof initMyBorrowed === "function") {
        initMyBorrowed();
    } else if (page === "my-account" && typeof initMyAccount === "function") {
        initMyAccount();
    }
}

// ========================================
// PAGE INITIALIZATION FUNCTIONS
// ========================================

function initDashboard() {
    const user = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
    const dashboardTitle = document.querySelector("h2");
    if (dashboardTitle) {
        dashboardTitle.innerText = `Welcome, ${user.name || 'User'}!`;
    }
}

function initBorrowBooks() {
    // Borrow books page initialization
    const bookList = document.getElementById("available-books");
    if (bookList) {
        fetch(`${API_URL}/books`)
            .then(r => r.json())
            .then(books => {
                const availableBooks = Array.isArray(books) ? books.filter(b => b.status === "Available") : [];
                if (availableBooks.length === 0) {
                    bookList.innerHTML = "<p>No books available</p>";
                } else {
                    bookList.innerHTML = availableBooks.map(book => `
                        <div class="book-card">
                            <h3>${book.title}</h3>
                            <p>Author: ${book.author}</p>
                            <p>Category: ${book.category}</p>
                            <button onclick="borrowBook('${book.id}')">Borrow</button>
                        </div>
                    `).join('');
                }
            })
            .catch(err => console.error('Error loading books:', err));
    }
}

function initMyBorrowed() {
    // My borrowed books page initialization
    const user = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
    const borrowedList = document.getElementById("borrowed-list");
    if (borrowedList) {
        fetch(`${API_URL}/books`)
            .then(r => r.json())
            .then(books => {
                const borrowed = Array.isArray(books) ? books.filter(b => b.borrower === user.email) : [];
                if (borrowed.length === 0) {
                    borrowedList.innerHTML = "<p>No borrowed books</p>";
                } else {
                    borrowedList.innerHTML = borrowed.map(book => `
                        <div class="book-card">
                            <h3>${book.title}</h3>
                            <p>Due Date: ${book.dueDate}</p>
                            <button onclick="returnBook('${book.id}')">Return</button>
                        </div>
                    `).join('');
                }
            })
            .catch(err => console.error('Error loading borrowed books:', err));
    }
}

function initMyAccount() {
    const user = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
    
    const nameEl = document.getElementById("user-name");
    const emailEl = document.getElementById("user-email");
    const roleEl = document.getElementById("user-role");

    if (nameEl) nameEl.innerText = user.name || "N/A";
    if (emailEl) emailEl.innerText = user.email || "N/A";
    if (roleEl) roleEl.innerText = user.role || "N/A";
}

function borrowBook(bookId) {
    alert("Borrowing book: " + bookId);
    // TODO: Implement API call to borrow book
}

function returnBook(bookId) {
    alert("Returning book: " + bookId);
    // TODO: Implement API call to return book
}

// NAVIGATION HANDLERS

links.forEach(link => {
    link.addEventListener("click", function(e) {
        e.preventDefault();
        const page = this.getAttribute("data-page");
        loadPage(page);
    });
});

// ========================================
// LOGOUT HANDLER

function handleLogout(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to logout?")) {
        sessionStorage.removeItem("currentUser");
        window.location.href = "../LOGIN/login.html";
    }
}

// ========================================
// SEARCH FUNCTIONALITY (BORROW BOOKS PAGE)
// ========================================

document.body.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'borrowBookSearch') {
        const filter = e.target.value.toLowerCase();
        const table = document.getElementById('borrow-book-table');
        if (!table) return;
        
        const rows = table.getElementsByTagName('tr');

        // If search bar is empty, show all rows and hide "no results"
        if(filter === '') {
            Array.from(rows).forEach(row => row.style.display = '');
            const noResults = document.getElementById('no-results');
            if (noResults) noResults.style.display = 'none';
            return;
        }

        let found = false;
        Array.from(rows).forEach(row => {
            const title = row.cells[1]?.innerText.toLowerCase() || '';
            const author = row.cells[2]?.innerText.toLowerCase() || '';
            const category = row.cells[3]?.innerText.toLowerCase() || '';

            if (title.includes(filter) || author.includes(filter) || category.includes(filter)) {
                row.style.display = '';
                found = true;
            } else {
                row.style.display = 'none';
            }
        });

        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.style.display = found ? 'none' : 'block';
        }
    }
});
     