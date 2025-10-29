const App = {
  token: localStorage.getItem('token'),
  user: null,
  currentPage: 'dashboard',
  deleteCallback: null,
  autoRefreshInterval: null,
  registrationEnabled: false,
  
  async apiCall(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 && this.token) {
      this.logout();
      return null;
    }
    return res;
  },
  
  showError(msg) {
    const div = document.createElement('div');
    div.className = 'error-message rounded-xl p-4 mb-6 text-sm font-medium animate-slide-in';
    div.innerHTML = `⚠️ ${msg}`;
    document.getElementById('mainContent').prepend(div);
    setTimeout(() => div.remove(), 5000);
  },
  
  showSuccess(msg) {
    const div = document.createElement('div');
    div.className = 'success-message rounded-xl p-4 mb-6 font-medium animate-slide-in';
    div.innerHTML = `✓ ${msg}`;
    document.getElementById('mainContent').prepend(div);
    setTimeout(() => div.remove(), 3000);
  },
  
  openModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal').classList.add('flex');
  },
  
  closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal').classList.remove('flex');
  },
  
  openDeleteModal(message, callback) {
    document.getElementById('deleteMessage').textContent = message;
    this.deleteCallback = callback;
    document.getElementById('deleteModal').classList.remove('hidden');
    document.getElementById('deleteModal').classList.add('flex');
  },
  
  closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    document.getElementById('deleteModal').classList.remove('flex');
    this.deleteCallback = null;
  },
  
  showLoginError(msg) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = `⚠️ ${msg}`;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 5000);
  },

  async checkRegistrationStatus() {
    try {
      const res = await fetch('/api/auth/config');
      const data = await res.json();
      this.registrationEnabled = data.allowRegistration;
      
      if (this.registrationEnabled) {
        document.getElementById('authToggle').classList.remove('hidden');
      } else {
        document.getElementById('authToggle').classList.add('hidden');
      }
    } catch (error) {
      console.error('Failed to check registration status:', error);
      this.registrationEnabled = false;
      document.getElementById('authToggle').classList.add('hidden');
    }
  },

  async login(username, password) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.classList.add('hidden');
    
    if (!username || !password) {
      this.showLoginError('Please enter username and password');
      return;
    }
    
    try {
      const res = await this.apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      if (!res) {
        this.showLoginError('Server connection failed');
        return;
      }
      
      const data = await res.json();
      
      if (data.error) {
        this.showLoginError(data.error);
        return;
      }
      
      if (!data.token) {
        this.showLoginError('Invalid response from server');
        return;
      }
      
      this.token = data.token;
      localStorage.setItem('token', data.token);
      location.reload();
    } catch (error) {
      console.error('Login error:', error);
      this.showLoginError('Login failed. Please try again.');
    }
  },
  
  async register(username, email, password) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.classList.add('hidden');
    
    if (!username || !email || !password) {
      this.showLoginError('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      this.showLoginError('Password must be at least 6 characters');
      return;
    }
    
    try {
      const res = await this.apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      });
      
      if (!res) {
        this.showLoginError('Server connection failed');
        return;
      }
      
      const data = await res.json();
      
      if (data.error) {
        this.showLoginError(data.error);
        return;
      }
      
      if (!data.token) {
        this.showLoginError('Invalid response from server');
        return;
      }
      
      this.token = data.token;
      localStorage.setItem('token', data.token);
      location.reload();
    } catch (error) {
      console.error('Registration error:', error);
      this.showLoginError('Registration failed. Please try again.');
    }
  },
  
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
    
    document.getElementById('app').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('loginError').classList.add('hidden');
    
    this.checkRegistrationStatus();
  },
  
  startAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    
    this.autoRefreshInterval = setInterval(() => {
      if (this.currentPage && window[this.currentPage.charAt(0).toUpperCase() + this.currentPage.slice(1)]) {
        const pageModule = window[this.currentPage.charAt(0).toUpperCase() + this.currentPage.slice(1)];
        if (pageModule.refresh) {
          pageModule.refresh();
        }
      }
    }, 5000);
  },
  
  loadPage(page) {
    this.currentPage = page;
    document.querySelectorAll('.sidebar-item').forEach(el => {
      el.classList.remove('active');
      if (el.dataset.page === page) {
        el.classList.add('active');
      }
    });
    
    const titles = { 
      dashboard: 'Dashboard', 
      inventory: 'Inventory Management', 
      categories: 'Categories',
      users: 'User Management', 
      settings: 'Account Settings',
      info: 'Information'
    };
    document.getElementById('pageTitle').textContent = titles[page];
    
    const pages = { 
      dashboard: Dashboard, 
      inventory: Inventory,
      categories: Categories,
      users: Users, 
      settings: Settings,
      info: Info
    };
    if (pages[page]) pages[page].render();
  },
  
  async init() {
    if (!this.token) {
      await this.checkRegistrationStatus();
      return;
    }
    
    try {
      const res = await this.apiCall('/api/settings/profile');
      if (!res) return;
      const data = await res.json();
      this.user = data.user;
      
      document.getElementById('loginPage').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      
      document.getElementById('userBox').innerHTML = `
        <div class="font-bold text-lg">${this.user.username}</div>
        <div class="text-sm text-gray-400">${this.user.email}</div>
      `;
      
      if (this.user.is_admin || this.user.perm_manage_users) {
        document.getElementById('usersNav').classList.remove('hidden');
      }
      
      if (this.user.is_admin || this.user.perm_manage_categories) {
        document.getElementById('categoriesNav').classList.remove('hidden');
      }
      
      this.loadPage(this.currentPage);
      this.startAutoRefresh();
    } catch (error) {
      console.error('Init error:', error);
      this.logout();
    }
  }
};

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  App.login(
    document.getElementById('loginUsername').value,
    document.getElementById('loginPassword').value
  );
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  App.register(
    document.getElementById('registerUsername').value,
    document.getElementById('registerEmail').value,
    document.getElementById('registerPassword').value
  );
});

document.getElementById('loginTab').addEventListener('click', () => {
  document.getElementById('loginTab').classList.add('active');
  document.getElementById('registerTab').classList.remove('active');
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginError').classList.add('hidden');
});

document.getElementById('registerTab').addEventListener('click', () => {
  document.getElementById('registerTab').classList.add('active');
  document.getElementById('loginTab').classList.remove('active');
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('loginError').classList.add('hidden');
});

document.getElementById('logoutBtn').addEventListener('click', () => App.logout());

document.querySelectorAll('.sidebar-item').forEach(item => {
  item.addEventListener('click', () => {
    if (item.dataset.page) {
      App.loadPage(item.dataset.page);
    }
  });
});

document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') App.closeModal();
});

document.getElementById('deleteModal').addEventListener('click', (e) => {
  if (e.target.id === 'deleteModal') App.closeDeleteModal();
});

document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
  if (App.deleteCallback) {
    App.deleteCallback();
    App.closeDeleteModal();
  }
});

App.init();