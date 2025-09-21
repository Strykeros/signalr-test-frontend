const API_BASE_URL = 'https://localhost:7132';

class AuthService {
  constructor() {
    // Load auth state from localStorage on initialization
    this.loadAuthState();
  }

  // Load authentication state from localStorage
  loadAuthState() {
    try {
      const savedUser = localStorage.getItem('currentUser');
      const savedAuth = localStorage.getItem('isAuthenticated');
      
      if (savedUser && savedAuth === 'true') {
        // savedUser is just the username string
        this.currentUser = { name: savedUser, isAuthenticated: true };
        this.isAuthenticated = true;
      } else {
        this.currentUser = null;
        this.isAuthenticated = false;
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      this.clearAuthState();
    }
  }

  // Save authentication state to localStorage
  saveAuthState() {
    try {
      if (this.currentUser && this.isAuthenticated) {
        // Only save the username, not the full object or email
        localStorage.setItem('currentUser', this.currentUser.name);
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        this.clearAuthState();
      }
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  // Clear authentication state from localStorage
  clearAuthState() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  async login(userNameOrEmail, password, returnUrl = null) {
    const response = await fetch(`${API_BASE_URL}/validate-login`, {
      method: 'POST',
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userNameOrEmail,
        password,
        returnUrl
      }),
    });

    const data = await response.json();
   
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
   
    // Store user info after successful login (only name, no email)
    if (data.success && data.user) {
      this.currentUser = { 
        name: data.user.name, 
        isAuthenticated: true 
      };
      this.isAuthenticated = true;
      this.saveAuthState(); // Persist to localStorage
    }
   
    return data;
  }

  async logout() {
    try {
      // Call server logout endpoint
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Clear local state regardless of server response
      this.clearAuthState();

      if (!response.ok) {
        console.warn('Server logout failed, but local state cleared');
        return { success: true, message: 'Logged out locally (server logout failed)' };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Clear local state even if server call fails
      this.clearAuthState();
      console.error('Logout error:', error);
      return { success: true, message: 'Logged out locally (server unreachable)' };
    }
  }

  // Get current user from memory
  getCurrentUser() {
    return Promise.resolve(this.currentUser);
  }

  // Get auth status from memory
  getAuthStatus() {
    return Promise.resolve({
      isAuthenticated: this.isAuthenticated,
      user: this.currentUser
    });
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated && this.currentUser !== null;
  }

  // Validate if the stored session is still valid
  async validateSession() {
    return this.getAuthStatus();
  }
}

export default new AuthService();