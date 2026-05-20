function initReturnedBooks() {
  const table = document.getElementById('returned-book-table');
  if(window.books && table){
    table.innerHTML = '';
    books.filter(b => b.status === 'Available').forEach((book, i) => {
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
}
