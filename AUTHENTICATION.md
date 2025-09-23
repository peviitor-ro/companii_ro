# Authentication System

This document describes the VALIDATOR-style authentication system implemented for the Company Admin Panel.

## Overview

The authentication system follows the pattern used in the [peviitor-ro/validator-ui](https://github.com/peviitor-ro/validator-ui) project, implementing email-based magic link authentication with JWT tokens.

## Features

- **Email-based Authentication**: Users enter their email to receive a magic login link
- **JWT Token Management**: Access and refresh tokens stored securely in localStorage
- **Test Mode**: Development mode with instant login for testing
- **Protected Operations**: Admin operations (add/delete company data) require authentication
- **Clean UI**: Login form, authentication status, and logout functionality
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### AuthManager Class

The `AuthManager` class handles all authentication operations:

- `isAuthenticated()` - Check if user is logged in
- `requestLogin(email)` - Send magic link to email
- `verifyToken(token)` - Verify magic link token and login
- `logout()` - Clear authentication state
- `getCurrentUser()` - Get current user information
- `authenticatedFetch()` - Make API requests with authentication headers

### Authentication Flow

1. **Login Request**: User enters email, system sends magic link
2. **Token Verification**: User clicks magic link, token is verified
3. **Session Storage**: JWT tokens stored in localStorage
4. **Protected Access**: Admin operations require valid authentication
5. **Logout**: Clear tokens and redirect to login

### Test Mode

When running on localhost, the system enables test mode with:
- Instant test login button
- Mock token generation for testing
- Generated magic links for development

## Usage

### Basic Implementation

```html
<!-- Include auth system -->
<script src="./Frontend/auth.js"></script>

<!-- Auth container for login/status -->
<div id="authContainer" class="auth-container"></div>

<!-- Main app (hidden until authenticated) -->
<div id="mainApp" class="main-app">
  <!-- Your app content -->
</div>
```

### JavaScript Integration

```javascript
// Check authentication status
if (window.authManager.isAuthenticated()) {
  // User is logged in
  const user = window.authManager.getCurrentUser();
  console.log('Logged in as:', user.email);
}

// Make authenticated API calls
const response = await window.authManager.authenticatedFetch(
  'https://api.peviitor.ro/v6/firme/website/add/',
  { method: 'POST', body: formData }
);
```

### CSS Classes

The system uses CSS classes to show/hide content:

```css
/* Hide main app until authenticated */
.main-app {
  display: none;
}

/* Show main app when authenticated */
body.authenticated .main-app {
  display: block;
}
```

## API Integration

The system integrates with the VALIDATOR authentication API:

- **Login Endpoint**: `POST /login` - Send magic link
- **Verification Endpoint**: `GET /verify/{token}` - Verify token
- **Refresh Endpoint**: `POST /refresh` - Refresh access token

## Security Features

- **JWT Tokens**: Secure token-based authentication
- **Token Expiration**: Automatic token expiry handling
- **Protected Routes**: Admin operations require authentication
- **Magic Links**: No password storage, email-based authentication
- **CORS Protection**: Proper API integration with authentication headers

## Testing

Run the authentication tests by opening `test/auth_test.html` in your browser. The test suite covers:

- AuthManager initialization
- Email validation
- Authentication state management
- Login/logout functionality
- User session management

## Production Configuration

For production deployment:

1. Update the `baseURL` in `AuthManager` to point to the production VALIDATOR API
2. Remove or disable test mode
3. Configure proper email delivery for magic links
4. Set up proper CORS headers on the API
5. Implement proper error handling for network issues

## Files

- `Frontend/auth.js` - Main authentication system
- `Frontend/styles.css` - Authentication UI styles
- `index.html` - Main application with auth integration
- `test/auth_test.html` - Test suite for authentication

## Integration with VALIDATOR

This system is designed to work with the existing VALIDATOR infrastructure:

- Compatible with validator-ui authentication patterns
- Uses same JWT token structure
- Follows same email-based login flow
- Can be integrated with existing VALIDATOR API endpoints