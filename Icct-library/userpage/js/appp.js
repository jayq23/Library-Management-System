const body = document.querySelector("body"),
     sidebar = body.querySelector(".sidebar"),
     toggle = body.querySelector(".toggle");
const API_URL = 'http://localhost:5000/api';

toggle.addEventListener("click", () =>{
    sidebar.classList.toggle("close");
});

// ========================================
// GLOBAL DATA & SIDEBAR
// ========================================

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

// ========================================
// PAGE LOADER WITH SCRIPT INITIALIZATION
// ========================================

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
            
            // Load page-specific script and initialize
            loadPageScript(page);
        })
        .catch(error => {
            console.error(error);
            mainContent.innerHTML = "<h2>Error loading page</h2>";
        });
}

function loadPageScript(page) {
    const scripts = {
        "user-dashboard": "js/user-dashboard.js",
        "borrow-books": "js/borrow-books.js",
        "my-borrowed": "js/my-borrowed.js",
        "my-account": "js/user-page-loader.js"
    };
    
    const scriptPath = scripts[page];
    if (!scriptPath) return;
    
    // Remove old script if exists
    const oldScript = document.querySelector('script[data-page-script]');
    if (oldScript) oldScript.remove();
    
    // Load new script
    const script = document.createElement('script');
    script.src = scriptPath;
    script.setAttribute('data-page-script', page);
    script.onload = () => {
        if (page === "user-dashboard" && typeof initDashboard === "function") {
            initDashboard();
        } else if (page === "borrow-books" && typeof initBorrowBooks === "function") {
            initBorrowBooks();
        } else if (page === "my-borrowed" && typeof initMyBorrowed === "function") {
            initMyBorrowed();
        } else if (page === "my-account" && typeof initMyAccount === "function") {
            initMyAccount();
        }
    };
    document.body.appendChild(script);
}

// ========================================
// NAVIGATION HANDLERS
// ========================================

links.forEach(link => {
    link.addEventListener("click", function(e) {
        e.preventDefault();
        const page = this.getAttribute("data-page");
        loadPage(page);
    });
});

// ========================================
// LOGOUT HANDLER
// ========================================

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
     