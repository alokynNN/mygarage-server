const Settings = {
  async render() {
    let registrationEnabled = false;
    if (App.user.is_admin) {
      try {
        const res = await App.apiCall('/api/auth/config');
        const data = await res.json();
        registrationEnabled = data.allowRegistration;
      } catch (e) {
        console.error('Failed to load registration setting');
      }
    }

    document.getElementById('mainContent').innerHTML = `
      <div class="glass-card rounded-2xl p-8 max-w-4xl mx-auto">
        <h3 class="text-2xl font-bold mb-8 flex items-center gap-3">
          <i data-lucide="settings" class="w-8 h-8 text-purple-400"></i>
          Account Settings
        </h3>
        
        ${App.user.is_admin ? `
        <div class="mb-10 pb-10 border-b border-purple-900/30">
          <h4 class="text-xl font-bold mb-6 text-purple-400 flex items-center gap-2">
            <i data-lucide="shield" class="w-6 h-6"></i>
            Admin Settings
          </h4>
          <div class="glass-card rounded-xl p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <i data-lucide="user-plus" class="w-6 h-6 text-purple-400"></i>
                <div>
                  <div class="font-semibold text-lg mb-1">User Registration</div>
                  <div class="text-sm text-gray-400">Allow new users to create accounts</div>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="registrationToggle" ${registrationEnabled ? 'checked' : ''} class="sr-only peer">
                <div class="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
        ` : ''}
        
        <div class="mb-10">
          <h4 class="text-xl font-bold mb-4 flex items-center gap-2">
            <i data-lucide="user" class="w-6 h-6 text-purple-400"></i>
            Change Username
          </h4>
          <form id="usernameForm" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">New Username</label>
              <input type="text" id="newUsername" value="${App.user.username}" required 
                class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all">
            </div>
            <button type="submit" class="px-8 py-3 btn-gradient rounded-xl font-bold flex items-center gap-2">
              <i data-lucide="check" class="w-5 h-5"></i>
              Update Username
            </button>
          </form>
        </div>
        
        <div class="mb-10">
          <h4 class="text-xl font-bold mb-4 flex items-center gap-2">
            <i data-lucide="mail" class="w-6 h-6 text-purple-400"></i>
            Change Email
          </h4>
          <form id="emailForm" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">New Email</label>
              <input type="email" id="newEmail" value="${App.user.email}" required 
                class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all">
            </div>
            <button type="submit" class="px-8 py-3 btn-gradient rounded-xl font-bold flex items-center gap-2">
              <i data-lucide="check" class="w-5 h-5"></i>
              Update Email
            </button>
          </form>
        </div>
        
        <div class="mb-10">
          <h4 class="text-xl font-bold mb-4 flex items-center gap-2">
            <i data-lucide="lock" class="w-6 h-6 text-purple-400"></i>
            Change Password
          </h4>
          <form id="passwordForm" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">Current Password</label>
              <input type="password" id="currentPassword" required autocomplete="current-password"
                class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-300">New Password</label>
              <input type="password" id="newPassword" required autocomplete="new-password"
                class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all">
            </div>
            <button type="submit" class="px-8 py-3 btn-gradient rounded-xl font-bold flex items-center gap-2">
              <i data-lucide="check" class="w-5 h-5"></i>
              Update Password
            </button>
          </form>
        </div>
        
        <div class="glass-card border-2 border-red-500/30 rounded-xl p-6">
          <h4 class="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-6 h-6"></i>
            Danger Zone
          </h4>
          <p class="text-gray-400 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button onclick="Settings.deleteAccount()" class="px-8 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl font-bold transition-all flex items-center gap-2">
            <i data-lucide="trash-2" class="w-5 h-5"></i>
            Delete Account
          </button>
        </div>
      </div>
    `;
    
    lucide.createIcons();
    
    if (App.user.is_admin) {
      document.getElementById('registrationToggle').addEventListener('change', async (e) => {
        try {
          const res = await App.apiCall('/api/settings/registration', {
            method: 'PUT',
            body: JSON.stringify({ enabled: e.target.checked })
          });
          
          if (res && res.ok) {
            App.registrationEnabled = e.target.checked;
            App.showSuccess('Registration setting updated');
          } else {
            App.showError('Failed to update registration setting');
            e.target.checked = !e.target.checked;
          }
        } catch (error) {
          App.showError('Failed to update registration setting');
          e.target.checked = !e.target.checked;
        }
      });
    }
    
    document.getElementById('usernameForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await App.apiCall('/api/settings/username', {
          method: 'PUT',
          body: JSON.stringify({ username: document.getElementById('newUsername').value })
        });
        
        const data = await res.json();
        if (data.error) {
          App.showError(data.error);
          return;
        }
        
        App.user.username = document.getElementById('newUsername').value;
        App.showSuccess('Username updated successfully');
        document.getElementById('userBox').innerHTML = `
          <div class="font-bold text-lg">${App.user.username}</div>
          <div class="text-sm text-gray-400">${App.user.email}</div>
        `;
      } catch (error) {
        App.showError('Failed to update username');
      }
    };
    
    document.getElementById('emailForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await App.apiCall('/api/settings/email', {
          method: 'PUT',
          body: JSON.stringify({ email: document.getElementById('newEmail').value })
        });
        
        const data = await res.json();
        if (data.error) {
          App.showError(data.error);
          return;
        }
        
        App.user.email = document.getElementById('newEmail').value;
        App.showSuccess('Email updated successfully');
        document.getElementById('userBox').innerHTML = `
          <div class="font-bold text-lg">${App.user.username}</div>
          <div class="text-sm text-gray-400">${App.user.email}</div>
        `;
      } catch (error) {
        App.showError('Failed to update email');
      }
    };
    
    document.getElementById('passwordForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await App.apiCall('/api/settings/password', {
          method: 'PUT',
          body: JSON.stringify({
            currentPassword: document.getElementById('currentPassword').value,
            newPassword: document.getElementById('newPassword').value
          })
        });
        
        const data = await res.json();
        if (data.error) {
          App.showError(data.error);
          return;
        }
        
        App.showSuccess('Password updated successfully');
        document.getElementById('passwordForm').reset();
      } catch (error) {
        App.showError('Failed to update password');
      }
    };
  },
  
  deleteAccount() {
    App.openModal('Delete Account', `
      <div class="text-center mb-6">
        <i data-lucide="alert-triangle" class="w-16 h-16 text-red-400 mx-auto mb-4"></i>
        <p class="text-gray-400 mb-6">This action cannot be undone. Please enter your password to confirm account deletion.</p>
      </div>
      <form id="deleteForm" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold mb-2">Confirm Password</label>
          <input type="password" id="confirmPassword" required autocomplete="current-password"
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all">
        </div>
        <button type="submit" class="w-full py-4 bg-red-500 hover:bg-red-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
          <i data-lucide="trash-2" class="w-5 h-5"></i>
          Delete My Account Permanently
        </button>
      </form>
    `);
    
    lucide.createIcons();
    
    document.getElementById('deleteForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await App.apiCall('/api/settings/account', {
          method: 'DELETE',
          body: JSON.stringify({ password: document.getElementById('confirmPassword').value })
        });
        
        const data = await res.json();
        if (data.error) {
          App.showError(data.error);
          return;
        }
        
        App.logout();
      } catch (error) {
        App.showError('Failed to delete account');
      }
    };
  },
  
  refresh() {
    this.render();
  }
};