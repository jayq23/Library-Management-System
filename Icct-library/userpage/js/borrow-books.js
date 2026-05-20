function initBorrowBooks() {
    const API_URL = 'http://localhost:5000/api';
    const tableBody = document.getElementById("borrow-book-table");

    function renderBooks() {
        fetch(`${API_URL}/books`)
            .then(r => r.json())
            .then(books => {
                tableBody.innerHTML = "";

                if (books.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="6" style="text-align:center; padding:20px;">
                                No books available yet.
                            </td>
                        </tr>
                    `;
                    return;
                }

                books.forEach((book, index) => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td data-label="Book ID">${book.id}</td>
                        <td data-label="Title">${book.title}</td>
                        <td data-label="Author">${book.author}</td>
                        <td data-label="Category">${book.category}</td>
                        <td data-label="Status">
                            <span class="status-badge ${book.status === "Borrowed" ? "borrowed" : "available"}">
                                ${book.status}
                            </span>
                        </td>
                        <td data-label="Action">
                            <button class="btn-primary"
                                ${book.status === "Borrowed" ? "disabled" : ""}
                                data-book-id="${book.id}">
                                Borrow
                            </button>
                        </td>
                    `;

                    tableBody.appendChild(row);
                });
            })
            .catch(err => {
                console.error('Error loading books:', err);
                tableBody.innerHTML = '<tr><td colspan="6">Error loading books</td></tr>';
            });
    }

    tableBody.addEventListener("click", e => {
        if(e.target.tagName === "BUTTON" && e.target.dataset.bookId){
            const bookId = e.target.dataset.bookId;
            const user = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
            
            fetch(`${API_URL}/books/${bookId}/borrow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    borrower: user.name || 'Unknown',
                    borrowDate: new Date().toISOString().split('T')[0],
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                })
            })
            .then(r => r.json())
            .then(data => {
                alert('Book borrowed successfully!');
                renderBooks();
            })
            .catch(err => {
                alert('Error borrowing book: ' + err.message);
            });
        }
    });

    renderBooks();
}
