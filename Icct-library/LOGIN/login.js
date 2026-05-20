// ========================================
// LOGIN & REGISTRATION FORM HANDLERS
// ========================================

function showLogin(){
    document.getElementById("mainButtons").style.display="none";
    document.getElementById("formOverlay").style.display="flex";

    document.getElementById("formBox").innerHTML = `
        <form id="loginForm">
            <h2>Login</h2>
            <input type="email" id="loginEmail" placeholder="Enter Email" required>
            <input type="password" id="loginPassword" placeholder="Enter Password" required>
            <select id="loginRole" required>
                <option value="">--Select Role--</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
            </select>
            <input type="submit" value="LOGIN">
            <button type="button" class="back-btn" onclick="goBack()">Back</button>
        </form>
    `;
    
    document.getElementById("loginForm").addEventListener("submit", handleLogin);
}

function showSignup(){
    document.getElementById("mainButtons").style.display="none";
    document.getElementById("formOverlay").style.display="flex";

    document.getElementById("formBox").innerHTML = `
        <form id="signupForm">
            <h2>Sign Up</h2>
            <input type="text" id="signupName" placeholder="Full Name" required>
            <input type="email" id="signupEmail" placeholder="Enter Email" required>
            <input type="password" id="signupPassword" placeholder="Enter Password" required>
            <select id="signupRole" required>
                <option value="">--Select Role--</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
            <input type="submit" value="REGISTER">
            <button type="button" class="back-btn" onclick="goBack()">Back</button>
        </form>
    `;
    
    document.getElementById("signupForm").addEventListener("submit", handleSignup);
}

function goBack(){
    document.getElementById("formOverlay").style.display="none";
    document.getElementById("mainButtons").style.display="block";
}

// ========================================
// LOGIN HANDLER
// ========================================

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const role = document.getElementById("loginRole").value;
    
    if (!email || !password || !role) {
        alert("Please fill in all fields");
        return;
    }
    
    // Basic validation
    if (password.length < 4) {
        alert("Password must be at least 4 characters");
        return;
    }
    
    // Call backend API
    fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Login failed');
            });
        }
        return response.json();
    })
    .then(data => {
        // Store session data
        const userData = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            loginTime: new Date().toISOString()
        };
        
        sessionStorage.setItem("currentUser", JSON.stringify(userData));
        
        // Redirect based on role
        if (role === "admin") {
            window.location.href = "../adminpage/admin.html";
        } else {
            window.location.href = "../userpage/user.html";
        }
    })
    .catch(error => {
        alert(error.message);
    });
}

// ========================================
// SIGNUP HANDLER
// ========================================

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const role = document.getElementById("signupRole").value;
    
    if (!name || !email || !password || !role) {
        alert("Please fill in all fields");
        return;
    }
    
    // Basic validation
    if (password.length < 4) {
        alert("Password must be at least 4 characters");
        return;
    }
    
    if (!email.includes("@")) {
        alert("Please enter a valid email");
        return;
    }
    
    // Call backend API
    fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Registration failed');
            });
        }
        return response.json();
    })
    .then(data => {
        alert("Registration successful! You can now login.");
        goBack();
    })
    .catch(error => {
        alert(error.message);
    });
}