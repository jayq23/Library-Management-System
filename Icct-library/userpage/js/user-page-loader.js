// User My Account Page Initializer
function initMyAccount() {
    const user = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
    
    const nameEl = document.getElementById("user-name");
    const emailEl = document.getElementById("user-email");
    const roleEl = document.getElementById("user-role");

    if (nameEl) nameEl.innerText = user.name || "N/A";
    if (emailEl) emailEl.innerText = user.email || "N/A";
    if (roleEl) roleEl.innerText = user.role || "N/A";
}
