function initDashboard() {
    const API_URL = 'http://localhost:5000/api';
    const totalEl = document.getElementById("total-books");
    const borrowedEl = document.getElementById("borrowed-books");

    fetch(`${API_URL}/stats`)
        .then(r => r.json())
        .then(stats => {
            if(totalEl) totalEl.innerText = stats.totalBooks;
            if(borrowedEl) borrowedEl.innerText = stats.borrowedBooks;
        })
        .catch(err => {
            console.error('Error loading stats:', err);
            if(totalEl) totalEl.innerText = 0;
            if(borrowedEl) borrowedEl.innerText = 0;
        });
}
