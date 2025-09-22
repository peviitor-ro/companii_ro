// Simple authentication system following VALIDATOR pattern
// Email-based authentication with access/refresh tokens

class AuthManager {
  constructor() {
    this.baseURL = "https://api.peviitor.ro/v6/auth"; // Validator auth endpoint
    this.storageKey = "companii_ro_auth";
    this.currentUser = this.getStoredAuth();
    this.testMode = window.location.hostname === "localhost"; // Enable test mode for localhost
  }

  // Get authentication state from localStorage
  getStoredAuth() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const auth = JSON.parse(stored);
        // Check if token is still valid (basic check)
        if (auth.accessToken && auth.expiresAt && Date.now() < auth.expiresAt) {
          return auth;
        }
      }
    } catch (e) {
      console.error("Error parsing stored auth:", e);
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Send login email (magic link)
  async requestLogin(email) {
    if (!email || !this.isValidEmail(email)) {
      throw new Error("Invalid email address");
    }

    // In test mode, simulate successful login request
    if (this.testMode) {
      // For demo purposes, create a test login link
      const testToken = "test_token_" + Date.now();
      console.log("Test mode: Login link would be sent to", email);
      console.log("Test login URL:", `${window.location.origin}${window.location.pathname}?token=${testToken}`);
      return { success: true, message: "Test login link generated" };
    }

    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Login request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Login request error:", error);
      throw error;
    }
  }

  // Verify token from magic link and set auth state
  async verifyToken(token) {
    if (!token) {
      throw new Error("Token is required");
    }

    // In test mode, accept any token that starts with test_token_
    if (this.testMode && token.startsWith("test_token_")) {
      const authState = {
        accessToken: "test_access_token",
        refreshToken: "test_refresh_token",
        email: "test@example.com",
        isStaff: true,
        isSuperuser: false,
        expiresAt: Date.now() + 3600 * 1000, // 1 hour
      };

      localStorage.setItem(this.storageKey, JSON.stringify(authState));
      this.currentUser = authState;
      
      return authState;
    }

    try {
      const response = await fetch(`${this.baseURL}/verify/${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Token verification failed: ${response.status}`);
      }

      const authData = await response.json();
      
      // Store authentication data
      const authState = {
        accessToken: authData.access,
        refreshToken: authData.refresh,
        email: authData.email,
        isStaff: authData.is_staff || false,
        isSuperuser: authData.is_superuser || false,
        expiresAt: Date.now() + (authData.expires_in || 3600) * 1000, // Default 1 hour
      };

      localStorage.setItem(this.storageKey, JSON.stringify(authState));
      this.currentUser = authState;
      
      return authState;
    } catch (error) {
      console.error("Token verification error:", error);
      throw error;
    }
  }

  // Test login method for development
  testLogin(email = "test@example.com") {
    if (!this.testMode) {
      throw new Error("Test login only available in test mode");
    }

    const authState = {
      accessToken: "test_access_token",
      refreshToken: "test_refresh_token",
      email: email,
      isStaff: true,
      isSuperuser: false,
      expiresAt: Date.now() + 3600 * 1000, // 1 hour
    };

    localStorage.setItem(this.storageKey, JSON.stringify(authState));
    this.currentUser = authState;
    
    return authState;
  }

  // Logout and clear stored data
  logout() {
    localStorage.removeItem(this.storageKey);
    this.currentUser = null;
  }

  // Get current user info
  getCurrentUser() {
    return this.currentUser;
  }

  // Make authenticated API request
  async authenticatedFetch(url, options = {}) {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${this.currentUser.accessToken}`,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if user has admin permissions
  isAdmin() {
    return this.isAuthenticated() && 
           (this.currentUser.isStaff || this.currentUser.isSuperuser);
  }
}

// Create global auth manager instance
window.authManager = new AuthManager();

// Authentication UI helpers
function showAuthForm() {
  const authContainer = document.getElementById("authContainer");
  if (!authContainer) return;

  const testModeHtml = window.authManager.testMode ? `
    <div style="margin-bottom: 1rem; padding: 0.5rem; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px;">
      <strong>Test Mode:</strong> 
      <button onclick="window.authManager.testLogin(); updateAuthUI();" style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Test Login
      </button>
    </div>
  ` : '';

  authContainer.innerHTML = `
    <div class="auth-form">
      ${testModeHtml}
      <h2>Authentication Required</h2>
      <p>Please enter your email to receive a login link:</p>
      <form id="loginForm" class="login-form">
        <div class="input-group">
          <label for="loginEmail">Email:</label>
          <input type="email" id="loginEmail" placeholder="Enter your email" required />
        </div>
        <button type="submit">Send Login Link</button>
      </form>
      <div id="loginMessage"></div>
    </div>
  `;

  document.getElementById("loginForm").addEventListener("submit", handleLogin);
}

function showAuthenticatedState() {
  const authContainer = document.getElementById("authContainer");
  if (!authContainer) return;

  const user = window.authManager.getCurrentUser();
  authContainer.innerHTML = `
    <div class="auth-status">
      <p>Logged in as: <strong>${user.email}</strong></p>
      <button id="logoutBtn" onclick="handleLogout()">Logout</button>
    </div>
  `;
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const messageDiv = document.getElementById("loginMessage");

  if (!email) {
    messageDiv.innerHTML = '<div class="flash error">Please enter your email</div>';
    return;
  }

  try {
    messageDiv.innerHTML = '<div class="flash">Sending login link...</div>';
    const result = await window.authManager.requestLogin(email);
    
    if (window.authManager.testMode) {
      messageDiv.innerHTML = `
        <div class="flash success">
          <strong>Test Mode:</strong> Login link sent to ${email}.<br>
          <small>In production, check your email for the login link.</small><br>
          <a href="${window.location.origin}${window.location.pathname}?token=test_token_${Date.now()}" 
             style="color: #007bff; text-decoration: underline;">
            Click here for test login
          </a>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="flash success">
          Login link sent to ${email}. Please check your email and click the link to login.
        </div>
      `;
    }
  } catch (error) {
    messageDiv.innerHTML = `<div class="flash error">Failed to send login link: ${error.message}</div>`;
  }
}

function handleLogout() {
  window.authManager.logout();
  updateAuthUI();
  // Reload page to reset state
  window.location.reload();
}

function updateAuthUI() {
  if (window.authManager.isAuthenticated()) {
    showAuthenticatedState();
    // Show admin functions
    document.body.classList.add("authenticated");
  } else {
    showAuthForm();
    // Hide admin functions
    document.body.classList.remove("authenticated");
  }
}

// Check for auth token in URL (from magic link)
function checkAuthToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  
  if (token) {
    // Remove token from URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Verify token
    window.authManager.verifyToken(token)
      .then(() => {
        updateAuthUI();
        showFlash(document.getElementById("authContainer"), "Successfully logged in!", "success");
      })
      .catch((error) => {
        showFlash(document.getElementById("authContainer"), `Login failed: ${error.message}`, "error");
      });
  }
}

// Initialize authentication on page load
document.addEventListener("DOMContentLoaded", () => {
  checkAuthToken();
  updateAuthUI();
});