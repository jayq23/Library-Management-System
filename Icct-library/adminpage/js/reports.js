function initReports() {
  // Example calculations
  document.getElementById('booksBorrowedMonth').innerText = books ? books.filter(b => b.status === 'Borrowed').length : 0;
  document.getElementById('overdueBooks').innerText = books ? books.filter(b => {
    const due = new Date(b.dueDate);
    return b.status === 'Borrowed' && due < new Date();
  }).length : 0;
  document.getElementById('activeBorrowers').innerText = borrowers ? borrowers.length : 0;
  document.getElementById('availableBooks').innerText = books ? books.filter(b => b.status === 'Available').length : 0;
}
