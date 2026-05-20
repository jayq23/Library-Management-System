function initDashboard() {
  const totalBooks = document.getElementById('totalBooks');
  const borrowedBooks = document.getElementById('borrowedBooks');
  const returnedBooks = document.getElementById('returnedBooks');
  const totalBorrowers = document.getElementById('totalBorrowers');

  totalBooks.innerText = books ? books.length : 0;
  borrowedBooks.innerText = books ? books.filter(b => b.status === "Borrowed").length : 0;
  returnedBooks.innerText = books ? books.filter(b => b.status === "Available").length : 0;
  totalBorrowers.innerText = borrowers ? borrowers.length : 0;
}
