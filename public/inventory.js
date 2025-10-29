const Inventory = {
  data: { items: [], categories: [], page: 1, total: 0, pages: 1 },
  
  async render() {
    try {
      const catRes = await App.apiCall('/api/categories');
      const cats = await catRes.json();
      this.data.categories = cats.categories || [];
      await this.loadItems();
    } catch (error) {
      console.error('Inventory error:', error);
    }
  },
  
  async loadItems() {
    const search = document.getElementById('invSearch')?.value || '';
    const category = document.getElementById('invCategory')?.value || '';
    
    try {
      const res = await App.apiCall(`/api/inventory?search=${encodeURIComponent(search)}&category=${category}&page=${this.data.page}`);
      const data = await res.json();
      this.data.items = data.items || [];
      this.data.total = data.total || 0;
      this.data.pages = data.pages || 1;
      
      const canAdd = App.user.is_admin || App.user.perm_add_inventory;
      const canEdit = App.user.is_admin || App.user.perm_edit_inventory;
      const canDelete = App.user.is_admin || App.user.perm_delete_inventory;
      const canViewLogs = App.user.is_admin || App.user.perm_view_logs;
      
      document.getElementById('mainContent').innerHTML = `
        <div class="glass-card rounded-2xl p-8 animate-slide-in">
          <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h3 class="text-2xl font-bold flex items-center gap-3">
              <i data-lucide="package" class="w-8 h-8 text-purple-400"></i>
              Inventory Items
            </h3>
            ${canAdd ? `
            <button onclick="Inventory.addItem()" class="px-6 py-3 btn-gradient rounded-xl font-bold flex items-center gap-2">
              <i data-lucide="plus" class="w-5 h-5"></i>
              Add Item
            </button>` : ''}
          </div>
          
          <div class="flex gap-4 mb-6 flex-wrap">
            <div class="relative flex-1 min-w-[200px]">
              <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></i>
              <input type="text" id="invSearch" placeholder="Search by name or ID..." value="${search}"
                class="w-full pl-12 pr-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl focus:border-purple-500 transition-all">
            </div>
            <select id="invCategory" 
              class="px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl focus:border-purple-500 transition-all min-w-[180px]">
              <option value="">All Categories</option>
              ${this.data.categories.map(c => `
                <option value="${c.id}" ${c.id == category ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
            <button onclick="Inventory.search()" class="px-8 py-3 btn-gradient rounded-xl font-bold">
              Search
            </button>
          </div>
          
          ${this.data.items.length > 0 ? `
          <div class="overflow-x-auto rounded-xl border border-purple-900/30 mb-6">
            <table class="w-full min-w-[1000px]">
              <thead class="bg-purple-900/20">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Image</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">ID</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Name</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Category</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Quantity</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Description</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-purple-900/20">
                ${this.data.items.map(item => `
                  <tr class="hover:bg-purple-500/10 transition-colors">
                    <td class="px-6 py-4">
                      ${item.image_url ? `<img src="${item.image_url}" class="w-12 h-12 rounded-lg object-cover">` : '<div class="w-12 h-12 rounded-lg bg-purple-900/30 flex items-center justify-center"><i data-lucide="image" class="w-6 h-6 text-gray-600"></i></div>'}
                    </td>
                    <td class="px-6 py-4 font-mono text-sm text-purple-400">#${item.item_id}</td>
                    <td class="px-6 py-4 font-semibold">${item.name}</td>
                    <td class="px-6 py-4 text-gray-400">${item.category_name || 'Uncategorized'}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-purple-400 text-lg">${item.quantity}</span>
                        ${canEdit ? `
                        <div class="flex gap-1">
                          <button onclick="Inventory.quickAdjust(${item.id}, 1)" 
                            class="w-7 h-7 bg-green-500/20 hover:bg-green-500/30 rounded text-green-400 font-bold transition-all"
                            title="Add 1">+</button>
                          <button onclick="Inventory.quickAdjust(${item.id}, -1)" 
                            class="w-7 h-7 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 font-bold transition-all"
                            title="Remove 1">−</button>
                        </div>
                        ` : ''}
                      </div>
                    </td>
                    <td class="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">${item.description || '-'}</td>
                    <td class="px-6 py-4">
                      <div class="flex gap-2 flex-wrap">
                        ${canViewLogs ? `<button onclick="Inventory.viewLogs(${item.id}, '${item.name.replace(/'/g, "\\'")} ')" 
                          class="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm">
                          <i data-lucide="file-text" class="w-4 h-4"></i>
                          Logs
                        </button>` : ''}
                        ${canEdit ? `
                        <button onclick="Inventory.adjustQuantity(${item.id}, '${item.name.replace(/'/g, "\\'")}')" 
                          class="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm text-blue-400">
                          <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                          Adjust
                        </button>
                        <button onclick="Inventory.editItem(${item.id})" 
                          class="btn-edit px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm">
                          <i data-lucide="edit-2" class="w-4 h-4"></i>
                          Edit
                        </button>
                        ` : ''}
                        ${canDelete ? `
                        <button onclick="Inventory.confirmDeleteItem(${item.id}, '${item.name.replace(/'/g, "\\'")} ')" 
                          class="btn-delete px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm">
                          <i data-lucide="trash-2" class="w-4 h-4"></i>
                          Delete
                        </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          ${this.data.pages > 1 ? `
          <div class="flex justify-center items-center gap-4">
            <button onclick="Inventory.changePage(${this.data.page - 1})" 
              ${this.data.page === 1 ? 'disabled' : ''}
              class="px-6 py-2 glass-card rounded-xl font-semibold hover:border-purple-500/40 transition-all disabled:opacity-30 flex items-center gap-2">
              <i data-lucide="chevron-left" class="w-4 h-4"></i>
              Previous
            </button>
            <span class="text-gray-400 font-semibold">Page ${this.data.page} of ${this.data.pages}</span>
            <button onclick="Inventory.changePage(${this.data.page + 1})" 
              ${this.data.page >= this.data.pages ? 'disabled' : ''}
              class="px-6 py-2 glass-card rounded-xl font-semibold hover:border-purple-500/40 transition-all disabled:opacity-30 flex items-center gap-2">
              Next
              <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
          </div>
          ` : ''}
          ` : '<p class="text-center text-gray-400 py-12">No items found</p>'}
        </div>
      `;
      
      lucide.createIcons();
    } catch (error) {
      console.error('Load inventory error:', error);
    }
  },
  
  search() {
    this.data.page = 1;
    this.loadItems();
  },
  
  changePage(page) {
    if (page < 1 || page > this.data.pages) return;
    this.data.page = page;
    this.loadItems();
  },

  async quickAdjust(id, change) {
    try {
      const res = await App.apiCall(`/api/inventory/${id}/adjust`, {
        method: 'PUT',
        body: JSON.stringify({ 
          change,
          description: `Quick ${change > 0 ? 'add' : 'remove'} via inventory page`
        })
      });
      
      const data = await res.json();
      if (data.error) {
        App.showError(data.error);
        return;
      }
      
      App.showSuccess(`Quantity ${change > 0 ? 'increased' : 'decreased'}`);
      this.loadItems();
    } catch (error) {
      App.showError('Failed to adjust quantity');
    }
  },

  adjustQuantity(id, name) {
    const item = this.data.items.find(i => i.id === id);
    if (!item) return;
    
    App.openModal(`Adjust Quantity - ${name}`, `
      <form id="adjustForm" class="space-y-5">
        <div class="text-center mb-4">
          <div class="text-sm text-gray-400 mb-2">Current Quantity</div>
          <div class="text-5xl font-black text-purple-400">${item.quantity}</div>
        </div>
        
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">Change Amount</label>
          <div class="flex items-center gap-3 mb-3">
            <button type="button" onclick="Inventory.adjustChangeAmount(-10)" 
              class="flex-1 py-4 bg-red-500/20 hover:bg-red-500/30 rounded-xl font-bold text-red-400 transition-all">
              -10
            </button>
            <button type="button" onclick="Inventory.adjustChangeAmount(-5)" 
              class="flex-1 py-4 bg-red-500/20 hover:bg-red-500/30 rounded-xl font-bold text-red-400 transition-all">
              -5
            </button>
            <button type="button" onclick="Inventory.adjustChangeAmount(-1)" 
              class="flex-1 py-4 bg-red-500/20 hover:bg-red-500/30 rounded-xl font-bold text-red-400 transition-all">
              -1
            </button>
          </div>
          <input type="number" id="adjustAmount" value="0" required 
            class="w-full px-5 py-4 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white text-center text-2xl font-bold focus:border-purple-500 transition-all"
            placeholder="0">
          <div class="flex items-center gap-3 mt-3">
            <button type="button" onclick="Inventory.adjustChangeAmount(1)" 
              class="flex-1 py-4 bg-green-500/20 hover:bg-green-500/30 rounded-xl font-bold text-green-400 transition-all">
              +1
            </button>
            <button type="button" onclick="Inventory.adjustChangeAmount(5)" 
              class="flex-1 py-4 bg-green-500/20 hover:bg-green-500/30 rounded-xl font-bold text-green-400 transition-all">
              +5
            </button>
            <button type="button" onclick="Inventory.adjustChangeAmount(10)" 
              class="flex-1 py-4 bg-green-500/20 hover:bg-green-500/30 rounded-xl font-bold text-green-400 transition-all">
              +10
            </button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">Description</label>
          <textarea id="adjustDescription" rows="3" required
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 transition-all resize-none"
            placeholder="e.g., Received from supplier, Used in production, Damaged items removed..."></textarea>
        </div>
        
        <button type="submit" class="w-full py-4 btn-gradient rounded-xl font-bold text-lg">
          Update Quantity
        </button>
      </form>
    `);
    
    document.getElementById('adjustForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const change = parseInt(document.getElementById('adjustAmount').value);
        const description = document.getElementById('adjustDescription').value;
        
        if (change === 0) {
          App.showError('Change amount cannot be 0');
          return;
        }
        
        const res = await App.apiCall(`/api/inventory/${id}/adjust`, {
          method: 'PUT',
          body: JSON.stringify({ change, description })
        });
        
        const data = await res.json();
        if (data.error) {
          App.showError(data.error);
          return;
        }
        
        App.closeModal();
        App.showSuccess('Quantity updated successfully');
        this.loadItems();
      } catch (error) {
        App.showError('Failed to adjust quantity');
      }
    };
  },
  
  adjustChangeAmount(delta) {
    const input = document.getElementById('adjustAmount');
    const currentValue = parseInt(input.value) || 0;
    input.value = currentValue + delta;
  },

  async viewLogs(id, name) {
    try {
      const res = await App.apiCall(`/api/inventory/${id}/logs`);
      const data = await res.json();
      const logs = data.logs || [];
      
      App.openModal(`Activity Logs - ${name}`, `
        <div class="space-y-4">
          ${logs.length > 0 ? `
            ${logs.map(log => {
              const iconMap = {
                create: 'plus-circle',
                add: 'arrow-up-circle',
                remove: 'arrow-down-circle',
                adjust: 'refresh-cw',
                delete: 'trash-2'
              };
              const colorMap = {
                create: 'text-green-400',
                add: 'text-green-400',
                remove: 'text-red-400',
                adjust: 'text-blue-400',
                delete: 'text-red-400'
              };
              return `
                <div class="glass-card rounded-xl p-4 border border-purple-900/30">
                  <div class="flex items-start gap-3">
                    <i data-lucide="${iconMap[log.action_type]}" class="w-6 h-6 ${colorMap[log.action_type]} flex-shrink-0 mt-1"></i>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="font-semibold">${log.username || 'Unknown User'}</span>
                        <span class="text-xs text-gray-400">${new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <div class="text-sm text-gray-300 mb-2">${log.description || 'No description'}</div>
                      <div class="flex items-center gap-4 text-xs">
                        <span class="text-gray-400">
                          Change: <span class="${log.quantity_change > 0 ? 'text-green-400' : 'text-red-400'} font-bold">
                            ${log.quantity_change > 0 ? '+' : ''}${log.quantity_change}
                          </span>
                        </span>
                        <span class="text-gray-400">
                          Quantity: <span class="text-purple-400 font-bold">${log.quantity_before}</span>
                          <i data-lucide="arrow-right" class="w-3 h-3 inline mx-1"></i>
                          <span class="text-purple-400 font-bold">${log.quantity_after}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          ` : '<p class="text-center text-gray-400 py-8">No activity logs yet</p>'}
        </div>
      `);
      
      lucide.createIcons();
    } catch (error) {
      console.error('View logs error:', error);
      App.showError('Failed to load logs');
    }
  },

  async viewLogsFromAlert(id, name) {
    try {
      const res = await App.apiCall(`/api/inventory?page=1&limit=1000`);
      const data = await res.json();
      this.data.items = data.items || [];
      
      this.viewLogs(id, name);
    } catch (error) {
      App.showError('Failed to load item data');
    }
  },
  
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${App.token}`
      },
      body: formData
    });
    
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.imageUrl;
  },
  
  addItem() {
    App.openModal('Add New Item', `
      <form id="itemForm" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold mb-2">Item Name</label>
          <input type="text" id="itemName" required 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl focus:border-purple-500 transition-all">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Category</label>
          <select id="itemCategory" 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl focus:border-purple-500 transition-all">
            <option value="">Uncategorized</option>
            ${this.data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Quantity</label>
          <input type="number" id="itemQuantity" value="0" required 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl focus:border-purple-500 transition-all">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Description</label>
          <textarea id="itemDescription" rows="3" 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl focus:border-purple-500 transition-all"></textarea>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Image (Optional)</label>
          <input type="file" id="itemImage" accept="image/*"
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 transition-all">
          <div id="imagePreview" class="mt-3"></div>
        </div>
        <button type="submit" class="w-full py-4 btn-gradient rounded-xl font-bold">
          Add Item
        </button>
      </form>
    `);
    
    document.getElementById('itemImage').onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          document.getElementById('imagePreview').innerHTML = `
            <img src="${e.target.result}" class="w-32 h-32 rounded-xl object-cover">
          `;
        };
        reader.readAsDataURL(file);
      }
    };
    
    document.getElementById('itemForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        let imageUrl = null;
        const imageFile = document.getElementById('itemImage').files[0];
        
        if (imageFile) {
          imageUrl = await this.uploadImage(imageFile);
        }
        
        await App.apiCall('/api/inventory', {
          method: 'POST',
          body: JSON.stringify({
            name: document.getElementById('itemName').value,
            category_id: document.getElementById('itemCategory').value || null,
            quantity: parseInt(document.getElementById('itemQuantity').value),
            description: document.getElementById('itemDescription').value,
            image_url: imageUrl
          })
        });
        App.closeModal();
        App.showSuccess('Item added successfully');
        this.loadItems();
      } catch (error) {
        App.showError('Failed to add item');
      }
    };
  },
  
  async editItemFromAlert(id) {
    try {
      const res = await App.apiCall(`/api/inventory?page=1&limit=1000`);
      const data = await res.json();
      this.data.items = data.items || [];
      
      App.closeModal();
      this.editItem(id);
    } catch (error) {
      App.showError('Failed to load item data');
    }
  },
  
  editItem(id) {
    const item = this.data.items.find(i => i.id === id);
    if (!item) return;
    
    App.openModal('Edit Item', `
      <form id="itemForm" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold mb-2">Item ID</label>
          <input type="text" value="${item.item_id}" disabled
            class="w-full px-5 py-3 bg-dark-700 border-2 border-purple-900/30 rounded-xl text-gray-400">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Item Name</label>
          <input type="text" id="itemName" value="${item.name}" required 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl focus:border-purple-500 transition-all">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Category</label>
          <select id="itemCategory" 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl focus:border-purple-500 transition-all">
            <option value="">Uncategorized</option>
            ${this.data.categories.map(c => `
              <option value="${c.id}" ${c.id === item.category_id ? 'selected' : ''}>${c.name}</option>
            `).join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Quantity</label>
          <input type="number" id="itemQuantity" value="${item.quantity}" required 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl focus:border-purple-500 transition-all">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Description</label>
          <textarea id="itemDescription" rows="3" 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl focus:border-purple-500 transition-all resize-none">${item.description || ''}</textarea>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Image</label>
          ${item.image_url ? `
            <div class="mb-3">
              <img src="${item.image_url}" class="w-32 h-32 rounded-xl object-cover mb-2">
              <button type="button" onclick="Inventory.currentImageUrl = null; this.parentElement.remove()" class="text-sm text-red-400 hover:text-red-300">Remove Image</button>
            </div>
          ` : ''}
          <input type="file" id="itemImage" accept="image/*"
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 transition-all">
          <div id="imagePreview" class="mt-3"></div>
        </div>
        <button type="submit" class="w-full py-4 btn-gradient rounded-xl font-bold">
          Update Item
        </button>
      </form>
    `);
    
    this.currentImageUrl = item.image_url;
    
    document.getElementById('itemImage').onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          document.getElementById('imagePreview').innerHTML = `
            <img src="${e.target.result}" class="w-32 h-32 rounded-xl object-cover">
          `;
        };
        reader.readAsDataURL(file);
      }
    };
    
    document.getElementById('itemForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        let imageUrl = this.currentImageUrl;
        const imageFile = document.getElementById('itemImage').files[0];
        
        if (imageFile) {
          imageUrl = await this.uploadImage(imageFile);
        }
        
        await App.apiCall(`/api/inventory/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: document.getElementById('itemName').value,
            category_id: document.getElementById('itemCategory').value || null,
            quantity: parseInt(document.getElementById('itemQuantity').value),
            description: document.getElementById('itemDescription').value,
            image_url: imageUrl
          })
        });
        App.closeModal();
        App.showSuccess('Item updated successfully');
        this.loadItems();
      } catch (error) {
        App.showError('Failed to update item');
      }
    };
  },
  
  confirmDeleteItem(id, name) {
    App.openDeleteModal(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      async () => {
        try {
          await App.apiCall(`/api/inventory/${id}`, { method: 'DELETE' });
          App.showSuccess('Item deleted successfully');
          if (document.getElementById('modal').classList.contains('flex')) {
            App.closeModal();
          }
          this.loadItems();
        } catch (error) {
          App.showError('Failed to delete item');
        }
      }
    );
  },
  
  refresh() {
    this.loadItems();
  }
};