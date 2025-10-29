const Dashboard = {
  stockAlerts: null,
  
  async render() {
    try {
      const [invRes, catRes, userRes, alertsRes] = await Promise.all([
        App.apiCall('/api/inventory?page=1&limit=5'),
        App.apiCall('/api/categories'),
        (App.user.is_admin || App.user.perm_manage_users) ? App.apiCall('/api/users') : null,
        App.apiCall('/api/dashboard/stock-alerts')
      ]);
      
      const inv = await invRes.json();
      const cats = await catRes.json();
      const users = userRes ? await userRes.json() : { users: [] };
      this.stockAlerts = await alertsRes.json();
      
      document.getElementById('mainContent').innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-in">
          <div class="stat-card rounded-2xl p-8">
            <div class="flex items-center justify-between mb-4">
              <i data-lucide="package" class="w-10 h-10 text-purple-400"></i>
              <div class="text-5xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                ${inv.total || 0}
              </div>
            </div>
            <div class="text-gray-400 font-semibold uppercase text-sm tracking-wider">Total Items</div>
          </div>
          
          <div class="stat-card rounded-2xl p-8">
            <div class="flex items-center justify-between mb-4">
              <i data-lucide="tag" class="w-10 h-10 text-purple-400"></i>
              <div class="text-5xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                ${cats.categories?.length || 0}
              </div>
            </div>
            <div class="text-gray-400 font-semibold uppercase text-sm tracking-wider">Categories</div>
          </div>
          
          ${(App.user.is_admin || App.user.perm_manage_users) ? `
          <div class="stat-card rounded-2xl p-8">
            <div class="flex items-center justify-between mb-4">
              <i data-lucide="users" class="w-10 h-10 text-purple-400"></i>
              <div class="text-5xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                ${users.users?.length || 0}
              </div>
            </div>
            <div class="text-gray-400 font-semibold uppercase text-sm tracking-wider">Users</div>
          </div>` : ''}
        </div>
        
        ${this.renderStockAlerts()}
        
        <div class="glass-card rounded-2xl p-8 animate-slide-in">
          <h3 class="text-2xl font-bold mb-6 flex items-center gap-3">
            <i data-lucide="clock" class="w-7 h-7 text-purple-400"></i>
            Recent Items
          </h3>
          ${inv.items?.length > 0 ? `
          <div class="overflow-x-auto rounded-xl border border-purple-900/30">
            <table class="w-full">
              <thead class="bg-purple-900/20">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">ID</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Name</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Category</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Quantity</th>
                  <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Added</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-purple-900/20">
                ${inv.items.map(item => `
                  <tr class="hover:bg-purple-500/10 transition-colors">
                    <td class="px-6 py-4 font-mono text-sm text-purple-400">#${item.item_id}</td>
                    <td class="px-6 py-4 font-semibold">${item.name}</td>
                    <td class="px-6 py-4 text-gray-400">${item.category_name || 'Uncategorized'}</td>
                    <td class="px-6 py-4 font-bold text-purple-400">${item.quantity}</td>
                    <td class="px-6 py-4 text-gray-400 text-sm">${new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : '<p class="text-center text-gray-400 py-12">No items yet. Start by adding your first item!</p>'}
        </div>
      `;
      
      lucide.createIcons();
    } catch (error) {
      console.error('Dashboard error:', error);
      document.getElementById('mainContent').innerHTML = `
        <div class="glass-card border-red-500/30 rounded-2xl p-8 text-red-400">
          <p class="text-xl font-bold flex items-center gap-3">
            <i data-lucide="alert-circle" class="w-6 h-6"></i>
            Failed to load dashboard
          </p>
        </div>
      `;
      lucide.createIcons();
    }
  },
  
  renderStockAlerts() {
    if (!this.stockAlerts) return '';
    
    const { outOfStock, lowStock, threshold } = this.stockAlerts;
    
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="glass-card rounded-2xl p-6 cursor-pointer hover:border-purple-500/50 transition-all" onclick="Dashboard.showStockDetails('out')">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <i data-lucide="alert-circle" class="w-8 h-8 text-purple-400"></i>
              <div>
                <div class="text-xl font-bold text-purple-400">Out of Stock</div>
                <div class="text-sm text-gray-400">Items with 0 quantity</div>
              </div>
            </div>
            <div class="text-4xl font-black text-purple-400">${outOfStock.length}</div>
          </div>
          <div class="text-sm text-gray-400">Click to view details</div>
        </div>
        
        <div class="glass-card rounded-2xl p-6 cursor-pointer hover:border-purple-500/50 transition-all" onclick="Dashboard.showStockDetails('low')">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <i data-lucide="alert-triangle" class="w-8 h-8 text-purple-400"></i>
              <div>
                <div class="text-xl font-bold text-purple-400">Low Stock</div>
                <div class="text-sm text-gray-400">
                  Items below ${threshold} units 
                  ${App.user.is_admin ? `<button onclick="Dashboard.editThreshold(event)" class="ml-2 px-2 py-1 bg-purple-500/20 rounded text-xs hover:bg-purple-500/30"><i data-lucide="settings" class="w-3 h-3 inline"></i></button>` : ''}
                </div>
              </div>
            </div>
            <div class="text-4xl font-black text-purple-400">${lowStock.length}</div>
          </div>
          <div class="text-sm text-gray-400">Click to view details</div>
        </div>
      </div>
    `;
  },
  
  showStockDetails(type) {
    const items = type === 'out' ? this.stockAlerts.outOfStock : this.stockAlerts.lowStock;
    const title = type === 'out' ? 'Out of Stock Items' : `Low Stock Items (Below ${this.stockAlerts.threshold})`;
    
    const canEdit = App.user.is_admin || App.user.perm_edit_inventory;
    const canDelete = App.user.is_admin || App.user.perm_delete_inventory;
    const canViewLogs = App.user.is_admin || App.user.perm_view_logs;
    
    App.openModal(title, `
      <div class="overflow-x-auto rounded-xl border border-purple-500/30">
        <table class="w-full">
          <thead class="bg-purple-900/20">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">ID</th>
              <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Name</th>
              <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Quantity</th>
              <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-purple-900/20">
            ${items.map(item => `
              <tr class="hover:bg-purple-500/10 transition-colors">
                <td class="px-6 py-4 font-mono text-sm text-purple-400">#${item.item_id}</td>
                <td class="px-6 py-4 font-semibold">${item.name}</td>
                <td class="px-6 py-4 font-bold text-purple-400">${item.quantity}</td>
                <td class="px-6 py-4">
                  <div class="flex gap-2 flex-wrap">
                    ${canViewLogs ? `<button onclick="Inventory.viewLogsFromAlert(${item.id}, '${item.name.replace(/'/g, "\\'")} ')" 
                      class="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm">
                      <i data-lucide="file-text" class="w-4 h-4"></i>
                      Logs
                    </button>` : ''}
                    ${canEdit ? `<button onclick="Inventory.editItemFromAlert(${item.id})" class="btn-edit px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm">
                      <i data-lucide="edit-2" class="w-4 h-4"></i>
                      Edit
                    </button>` : ''}
                    ${canDelete ? `<button onclick="Inventory.confirmDeleteItem(${item.id}, '${item.name.replace(/'/g, "\\'")} ')" class="btn-delete px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                      Delete
                    </button>` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `);
    
    lucide.createIcons();
  },
  
  editThreshold(e) {
    e.stopPropagation();
    
    App.openModal('Edit Low Stock Threshold', `
      <form id="thresholdForm" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">Low Stock Threshold</label>
          <input type="number" id="threshold" value="${this.stockAlerts.threshold}" required min="1"
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 transition-all">
          <p class="text-sm text-gray-400 mt-2">Items with quantity at or below this value will be flagged as low stock</p>
        </div>
        <button type="submit" class="w-full py-4 btn-gradient rounded-xl font-bold text-lg">
          Update Threshold
        </button>
      </form>
    `);
    
    document.getElementById('thresholdForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await App.apiCall('/api/settings/stock-threshold', {
          method: 'PUT',
          body: JSON.stringify({ threshold: parseInt(document.getElementById('threshold').value) })
        });
        
        const data = await res.json();
        if (data.error) {
          App.showError(data.error);
          return;
        }
        
        App.closeModal();
        App.showSuccess('Threshold updated successfully');
        this.render();
      } catch (error) {
        App.showError('Failed to update threshold');
      }
    };
  },
  
  refresh() {
    this.render();
  }
};