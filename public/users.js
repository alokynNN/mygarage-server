const Users = {
  data: [],
  
  async render() {
    try {
      const res = await App.apiCall('/api/users');
      const data = await res.json();
      this.data = data.users || [];
      
      document.getElementById('mainContent').innerHTML = `
        <div class="glass-card rounded-2xl p-8">
          <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h3 class="text-2xl font-bold flex items-center gap-3">
              <i data-lucide="users" class="w-8 h-8 text-purple-400"></i>
              User Management
            </h3>
            <button onclick="Users.createUser()" class="px-6 py-3 btn-gradient rounded-xl font-bold flex items-center gap-2">
              <i data-lucide="user-plus" class="w-5 h-5"></i>
              Create User
            </button>
          </div>
          
          ${this.data.length > 0 ? `
          <div class="overflow-x-auto rounded-xl border border-purple-900/30">
            <table class="w-full min-w-[800px]">
              <thead class="bg-purple-900/20">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Username</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Email</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Role</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Joined</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-purple-900/20">
                ${this.data.map(user => `
                  <tr class="hover:bg-purple-500/10 transition-colors">
                    <td class="px-6 py-4 font-semibold flex items-center gap-2">
                      <i data-lucide="user" class="w-4 h-4 text-gray-400"></i>
                      ${user.username}
                    </td>
                    <td class="px-6 py-4 text-gray-400">${user.email}</td>
                    <td class="px-6 py-4">
                      ${user.is_admin ? '<span class="px-3 py-1 bg-purple-500/20 rounded-full text-sm font-bold text-purple-400 flex items-center gap-1 w-fit"><i data-lucide="shield" class="w-3 h-3"></i> Admin</span>' : '<span class="px-3 py-1 bg-gray-500/20 rounded-full text-sm text-gray-400">User</span>'}
                    </td>
                    <td class="px-6 py-4 text-gray-400 text-sm">${new Date(user.created_at).toLocaleDateString()}</td>
                    <td class="px-6 py-4 flex gap-2">
                      ${!user.is_admin ? `
                        <button onclick="Users.editUser(${user.id})" class="btn-edit px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2">
                          <i data-lucide="edit-2" class="w-4 h-4"></i>
                          Edit
                        </button>
                        <button onclick="Users.confirmDeleteUser(${user.id}, '${user.username.replace(/'/g, "\\'")} ')" class="btn-delete px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2">
                          <i data-lucide="trash-2" class="w-4 h-4"></i>
                          Delete
                        </button>
                      ` : '<span class="text-gray-400 text-sm flex items-center gap-2"><i data-lucide="lock" class="w-4 h-4"></i> Protected</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : '<p class="text-center text-gray-400 py-12">No users found</p>'}
        </div>
      `;
      
      lucide.createIcons();
    } catch (error) {
      console.error('Users error:', error);
    }
  },
  
  createUser() {
    App.openModal('Create New User', `
      <form id="createUserForm" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">Username</label>
          <input type="text" id="newUserUsername" required 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 transition-all"
            placeholder="Enter username">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">Email</label>
          <input type="email" id="newUserEmail" required 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 transition-all"
            placeholder="user@example.com">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">Password</label>
          <input type="password" id="newUserPassword" required 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 transition-all"
            placeholder="Enter password">
        </div>
        
        <div class="pt-4 border-t border-purple-900/30">
          <h4 class="font-semibold mb-3 text-purple-400">Role & Permissions</h4>
          <div class="space-y-3">
            <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
              <input type="checkbox" id="newUserIsAdmin" class="w-5 h-5 accent-purple-500">
              <div class="flex-1">
                <div class="font-semibold text-sm flex items-center gap-2">
                  <i data-lucide="shield" class="w-4 h-4 text-purple-400"></i>
                  Administrator
                </div>
                <div class="text-xs text-gray-400">Full system access (all permissions)</div>
              </div>
            </label>
            
            <div id="userPermissions" class="space-y-3">
              <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
                <input type="checkbox" id="newUserPerm1" class="w-5 h-5 accent-purple-500">
                <div class="flex-1">
                  <div class="font-semibold text-sm">Manage Users</div>
                  <div class="text-xs text-gray-400">Create, edit, and delete users</div>
                </div>
              </label>
              
              <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
                <input type="checkbox" id="newUserPerm2" class="w-5 h-5 accent-purple-500">
                <div class="flex-1">
                  <div class="font-semibold text-sm">Add Inventory</div>
                  <div class="text-xs text-gray-400">Create new inventory items</div>
                </div>
              </label>
              
              <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
                <input type="checkbox" id="newUserPerm3" class="w-5 h-5 accent-purple-500">
                <div class="flex-1">
                  <div class="font-semibold text-sm">Edit Inventory</div>
                  <div class="text-xs text-gray-400">Modify existing items</div>
                </div>
              </label>
              
              <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
                <input type="checkbox" id="newUserPerm4" class="w-5 h-5 accent-purple-500">
                <div class="flex-1">
                  <div class="font-semibold text-sm">Delete Inventory</div>
                  <div class="text-xs text-gray-400">Remove items from inventory</div>
                </div>
              </label>
              
              <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
                <input type="checkbox" id="newUserPerm5" class="w-5 h-5 accent-purple-500">
                <div class="flex-1">
                  <div class="font-semibold text-sm">Manage Categories</div>
                  <div class="text-xs text-gray-400">Create, edit, and delete categories</div>
                </div>
              </label>
              
              <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
                <input type="checkbox" id="newUserPerm6" class="w-5 h-5 accent-purple-500">
                <div class="flex-1">
                  <div class="font-semibold text-sm">View Logs</div>
                  <div class="text-xs text-gray-400">Access inventory activity logs</div>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <button type="submit" class="w-full py-4 btn-gradient rounded-xl font-bold text-lg">
          Create User
        </button>
      </form>
    `);
    
    lucide.createIcons();
    
    document.getElementById('createUserForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await App.apiCall('/api/users', {
          method: 'POST',
          body: JSON.stringify({
            username: document.getElementById('newUserUsername').value,
            email: document.getElementById('newUserEmail').value,
            password: document.getElementById('newUserPassword').value,
            permissions: {
              manage_users: document.getElementById('newUserPerm1').checked,
              add_inventory: document.getElementById('newUserPerm2').checked,
              edit_inventory: document.getElementById('newUserPerm3').checked,
              delete_inventory: document.getElementById('newUserPerm4').checked,
              manage_categories: document.getElementById('newUserPerm5').checked,
              view_logs: document.getElementById('newUserPerm6').checked
            }
          })
        });
        
        const data = await res.json();
        if (data.error) {
          App.showError(data.error);
          return;
        }
        
        App.closeModal();
        App.showSuccess('User created successfully');
        this.render();
      } catch (error) {
        App.showError('Failed to create user');
      }
    };
  },
  
  editUser(id) {
    const user = this.data.find(u => u.id === id);
    if (!user) return;
    
    App.openModal(`Edit User - ${user.username}`, `
      <form id="editUserForm" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">Username</label>
          <input type="text" id="editUsername" value="${user.username}" required 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 transition-all">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">Email</label>
          <input type="email" id="editEmail" value="${user.email}" required 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 transition-all">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">New Password (leave blank to keep current)</label>
          <input type="password" id="editPassword" 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 transition-all"
            placeholder="Enter new password or leave blank">
        </div>
        
        <div class="pt-4 border-t border-purple-900/30">
          <h4 class="font-semibold mb-3 text-purple-400">Role & Permissions</h4>
          <div class="space-y-3">
            <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
              <input type="checkbox" id="editIsAdmin" ${user.is_admin ? 'checked' : ''} class="w-5 h-5 accent-purple-500">
              <div class="flex-1">
                <div class="font-semibold text-sm flex items-center gap-2">
                  <i data-lucide="shield" class="w-4 h-4 text-purple-400"></i>
                  Administrator
                </div>
                <div class="text-xs text-gray-400">Full system access (all permissions)</div>
              </div>
            </label>
            
            <div id="editUserPermissions" class="space-y-3">
              <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
                <input type="checkbox" id="editPerm1" ${user.perm_manage_users ? 'checked' : ''} class="w-5 h-5 accent-purple-500">
                <div class="flex-1">
                  <div class="font-semibold text-sm">Manage Users</div>
                  <div class="text-xs text-gray-400">Create, edit, and delete users</div>
                </div>
              </label>
              
              <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
                <input type="checkbox" id="editPerm2" ${user.perm_add_inventory ? 'checked' : ''} class="w-5 h-5 accent-purple-500">
                <div class="flex-1">
                  <div class="font-semibold text-sm">Add Inventory</div>
                  <div class="text-xs text-gray-400">Create new inventory items</div>
                </div>
              </label>
              
              <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
                <input type="checkbox" id="editPerm3" ${user.perm_edit_inventory ? 'checked' : ''} class="w-5 h-5 accent-purple-500">
                <div class="flex-1">
                  <div class="font-semibold text-sm">Edit Inventory</div>
                  <div class="text-xs text-gray-400">Modify existing items</div>
                </div>
              </label>
              
              <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
                <input type="checkbox" id="editPerm4" ${user.perm_delete_inventory ? 'checked' : ''} class="w-5 h-5 accent-purple-500">
                <div class="flex-1">
                  <div class="font-semibold text-sm">Delete Inventory</div>
                  <div class="text-xs text-gray-400">Remove items from inventory</div>
                </div>
              </label>
              
              <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
                <input type="checkbox" id="editPerm5" ${user.perm_manage_categories ? 'checked' : ''} class="w-5 h-5 accent-purple-500">
                <div class="flex-1">
                  <div class="font-semibold text-sm">Manage Categories</div>
                  <div class="text-xs text-gray-400">Create, edit, and delete categories</div>
                </div>
              </label>
              
              <label class="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer hover:bg-purple-500/5 transition-all">
                <input type="checkbox" id="editPerm6" ${user.perm_view_logs ? 'checked' : ''} class="w-5 h-5 accent-purple-500">
                <div class="flex-1">
                  <div class="font-semibold text-sm">View Logs</div>
                  <div class="text-xs text-gray-400">Access inventory activity logs</div>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <button type="submit" class="w-full py-4 btn-gradient rounded-xl font-bold text-lg">
          Update User
        </button>
      </form>
    `);
    
    lucide.createIcons();
    
    const adminCheckbox = document.getElementById('editIsAdmin');
    const permsDiv = document.getElementById('editUserPermissions');
    
    if (adminCheckbox.checked) {
      permsDiv.style.opacity = '0.5';
      permsDiv.style.pointerEvents = 'none';
    }
    
    adminCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        permsDiv.style.opacity = '0.5';
        permsDiv.style.pointerEvents = 'none';
        document.querySelectorAll('#editUserPermissions input').forEach(cb => cb.checked = true);
      } else {
        permsDiv.style.opacity = '1';
        permsDiv.style.pointerEvents = 'auto';
      }
    });
    
    document.getElementById('editUserForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const isAdmin = document.getElementById('editIsAdmin').checked;
        const password = document.getElementById('editPassword').value;
        
        const payload = {
          username: document.getElementById('editUsername').value,
          email: document.getElementById('editEmail').value,
          is_admin: isAdmin,
          permissions: isAdmin ? {
            manage_users: true,
            add_inventory: true,
            edit_inventory: true,
            delete_inventory: true,
            manage_categories: true,
            view_logs: true
          } : {
            manage_users: document.getElementById('editPerm1').checked,
            add_inventory: document.getElementById('editPerm2').checked,
            edit_inventory: document.getElementById('editPerm3').checked,
            delete_inventory: document.getElementById('editPerm4').checked,
            manage_categories: document.getElementById('editPerm5').checked,
            view_logs: document.getElementById('editPerm6').checked
          }
        };
        
        if (password) {
          payload.password = password;
        }
        
        const res = await App.apiCall(`/api/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (data.error) {
          App.showError(data.error);
          return;
        }
        
        App.closeModal();
        App.showSuccess('User updated successfully');
        this.render();
      } catch (error) {
        App.showError('Failed to update user');
      }
    };
  },

  confirmDeleteUser(id, username) {
    App.openDeleteModal(
      `Are you sure you want to delete user "${username}"? This action cannot be undone.`,
      async () => {
        try {
          await App.apiCall(`/api/users/${id}`, { method: 'DELETE' });
          App.showSuccess('User deleted successfully');
          this.render();
        } catch (error) {
          App.showError('Failed to delete user');
        }
      }
    );
  },
  
  refresh() {
    this.render();
  }
};