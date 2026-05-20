function initBorrowedBooks() {
  const table = document.getElementById('borrowed-book-table');
  if(window.books && table){
    table.innerHTML = '';
    books.filter(b => b.status === 'Borrowed').forEach((book, i) => {
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
}
