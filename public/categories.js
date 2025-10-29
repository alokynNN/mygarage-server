const Categories = {
  data: [],
  
  async render() {
    await this.loadCategories();
  },
  
  async loadCategories() {
    try {
      const res = await App.apiCall('/api/categories');
      const data = await res.json();
      this.data = data.categories || [];
      
      document.getElementById('mainContent').innerHTML = `
        <div class="glass-card rounded-2xl p-8">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-3xl font-bold flex items-center gap-3">
              <i data-lucide="tag" class="w-9 h-9 text-purple-400"></i>
              Categories Management
            </h3>
            <button onclick="Categories.addCategory()" class="px-8 py-3 btn-gradient rounded-xl font-bold flex items-center gap-2">
              <i data-lucide="plus" class="w-5 h-5"></i>
              Add Category
            </button>
          </div>
          
          ${this.data.length > 0 ? `
          <div class="grid gap-4">
            ${this.data.map(cat => `
              <div class="glass-card border border-purple-900/20 rounded-xl p-6 hover:border-purple-500/40 transition-all group">
                <div class="flex justify-between items-start gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <i data-lucide="folder" class="w-8 h-8 text-purple-400"></i>
                      <div class="text-2xl font-bold">${cat.name}</div>
                    </div>
                    <div class="text-sm text-gray-400 ml-11 mb-3">${cat.description || 'No description'}</div>
                    <div class="flex items-center gap-2 ml-11">
                      <i data-lucide="package" class="w-4 h-4 text-purple-400"></i>
                      <span class="text-purple-400 font-bold">${cat.item_count}</span>
                      <span class="text-gray-400 text-sm">items</span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button onclick="Categories.editCategory(${cat.id})" 
                      class="btn-edit px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2">
                      <i data-lucide="edit-2" class="w-4 h-4"></i>
                      Edit
                    </button>
                    <button onclick="Categories.deleteCategory(${cat.id})" 
                      class="btn-delete px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          ` : `
          <div class="text-center py-20">
            <i data-lucide="folder-open" class="w-24 h-24 mx-auto mb-4 text-gray-600"></i>
            <p class="text-xl text-gray-400 mb-6">No categories yet</p>
            <button onclick="Categories.addCategory()" class="px-8 py-4 btn-gradient rounded-xl font-bold inline-flex items-center gap-2">
              <i data-lucide="plus" class="w-5 h-5"></i>
              Create your first category
            </button>
          </div>
          `}
        </div>
      `;
      
      lucide.createIcons();
    } catch (error) {
      console.error('Load categories error:', error);
      App.showError('Failed to load categories');
    }
  },
  
  addCategory() {
    App.openModal('Add New Category', `
      <form id="categoryForm" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">Category Name</label>
          <input type="text" id="catName" required 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all"
            placeholder="e.g., Electronics, Food, Clothing">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">Description</label>
          <textarea id="catDesc" rows="3" 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all resize-none"
            placeholder="Brief description of this category..."></textarea>
        </div>
        <button type="submit" class="w-full py-4 btn-gradient rounded-xl font-bold text-lg">
          Add Category
        </button>
      </form>
    `);
    
    document.getElementById('categoryForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await App.apiCall('/api/categories', {
          method: 'POST',
          body: JSON.stringify({
            name: document.getElementById('catName').value,
            description: document.getElementById('catDesc').value
          })
        });
        
        const data = await res.json();
        if (data.error) {
          App.showError(data.error);
          return;
        }
        
        App.closeModal();
        App.showSuccess('Category added successfully');
        this.loadCategories();
      } catch (error) {
        App.showError('Failed to add category');
      }
    };
  },
  
  editCategory(id) {
    const cat = this.data.find(c => c.id === id);
    if (!cat) return;
    
    App.openModal('Edit Category', `
      <form id="categoryForm" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">Category Name</label>
          <input type="text" id="catName" value="${cat.name.replace(/"/g, '&quot;')}" required 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-300">Description</label>
          <textarea id="catDesc" rows="3" 
            class="w-full px-5 py-3 bg-dark-800 border-2 border-purple-900/30 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all resize-none">${cat.description || ''}</textarea>
        </div>
        <button type="submit" class="w-full py-4 btn-gradient rounded-xl font-bold text-lg">
          Update Category
        </button>
      </form>
    `);
    
    document.getElementById('categoryForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await App.apiCall(`/api/categories/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: document.getElementById('catName').value,
            description: document.getElementById('catDesc').value
          })
        });
        
        const data = await res.json();
        if (data.error) {
          App.showError(data.error);
          return;
        }
        
        App.closeModal();
        App.showSuccess('Category updated successfully');
        this.loadCategories();
      } catch (error) {
        App.showError('Failed to update category');
      }
    };
  },
  
  async deleteCategory(id) {
    App.openDeleteModal(
      'Are you sure you want to delete this category? All items in this category will become uncategorized.',
      async () => {
        try {
          const res = await App.apiCall(`/api/categories/${id}`, { method: 'DELETE' });
          const data = await res.json();
          
          if (data.error) {
            App.showError(data.error);
            return;
          }
          
          App.showSuccess('Category deleted successfully');
          this.loadCategories();
        } catch (error) {
          App.showError('Failed to delete category');
        }
      }
    );
  },
  
  refresh() {
    this.loadCategories();
  }
};