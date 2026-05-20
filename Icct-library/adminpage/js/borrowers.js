function initBorrowers() {
  const table = document.getElementById('borrowers-table');
  // If you have borrowers array, render dynamically
  if(window.borrowers && table){
    table.innerHTML = '';
    borrowers.forEach((b, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${b.id}</td>
        <td>${b.name}</td>
        <td>${b.contact}</td>
        <td>${b.email}</td>
        <td>${b.booksBorrowed || 0}</td>
      `;
      table.appendChild(row);
    });
  }
}
