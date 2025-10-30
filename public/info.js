const Info = {
  async render() {
    const APP_VERSION = '1.0.0';
    const SUPPORT_EMAIL = 'support@alokyn.com';
    const SUPPORT_LINK = 'https://support.alokyn.com';

    document.getElementById('mainContent').innerHTML = `
      <div class="glass-card rounded-2xl p-8 max-w-4xl mx-auto">
        <h3 class="text-2xl font-bold mb-8 flex items-center gap-3">
          <i data-lucide="info" class="w-8 h-8 text-purple-400"></i>
          Information
        </h3>
        
        <div class="mb-10 pb-10 border-b border-purple-900/30">
          <h4 class="text-xl font-bold mb-4 flex items-center gap-2">
            <i data-lucide="file-text" class="w-6 h-6 text-purple-400"></i>
            Terms of Use
          </h4>
          <div class="glass-card rounded-xl p-6 space-y-4">
            <p class="text-gray-300 leading-relaxed">
              By using this application, you agree to the following terms:
            </p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3">
                <i data-lucide="check-circle" class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"></i>
                <span>You are solely responsible for all information and data you store on this application.</span>
              </li>
              <li class="flex gap-3">
                <i data-lucide="check-circle" class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"></i>
                <span>All data is stored on your server and managed by you.</span>
              </li>
              <li class="flex gap-3">
                <i data-lucide="check-circle" class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"></i>
                <span>You are responsible for maintaining backups and security of your data.</span>
              </li>
              <li class="flex gap-3">
                <i data-lucide="check-circle" class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"></i>
                <span>The application is provided "as is" without warranties of any kind.</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="mb-10 pb-10 border-b border-purple-900/30">
          <h4 class="text-xl font-bold mb-4 flex items-center gap-2">
            <i data-lucide="shield" class="w-6 h-6 text-purple-400"></i>
            Privacy Policy
          </h4>
          <div class="glass-card rounded-xl p-6 space-y-4">
            <p class="text-gray-300 leading-relaxed">
              Your privacy matters to us:
            </p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex gap-3">
                <i data-lucide="eye-off" class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"></i>
                <span>We do not collect any personal information beyond what you provide during registration.</span>
              </li>
              <li class="flex gap-3">
                <i data-lucide="database" class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"></i>
                <span>All your data remains on your self-hosted server.</span>
              </li>
              <li class="flex gap-3">
                <i data-lucide="lock" class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"></i>
                <span>We do not track, analyze, or share your data with third parties.</span>
              </li>
              <li class="flex gap-3">
                <i data-lucide="user-check" class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"></i>
                <span>You have full control over your data and can delete your account at any time.</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="mb-10 pb-10 border-b border-purple-900/30">
          <h4 class="text-xl font-bold mb-4 flex items-center gap-2">
            <i data-lucide="life-buoy" class="w-6 h-6 text-purple-400"></i>
            Support
          </h4>
          <div class="glass-card rounded-xl p-6">
            <div class="space-y-4">
              <p class="text-gray-300 leading-relaxed">
                Need help? We're here for you:
              </p>
              <div class="flex items-center gap-4 p-4 bg-dark-800 rounded-lg">
                <i data-lucide="mail" class="w-6 h-6 text-purple-400"></i>
                <div>
                  <div class="text-sm text-gray-400 mb-1">Email Support</div>
                  <a href="mailto:${SUPPORT_EMAIL}" class="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    ${SUPPORT_EMAIL}
                  </a>
                </div>
              </div>
              <div class="flex items-center gap-4 p-4 bg-dark-800 rounded-lg">
                <i data-lucide="external-link" class="w-6 h-6 text-purple-400"></i>
                <div>
                  <div class="text-sm text-gray-400 mb-1">Support Portal</div>
                  <a href="${SUPPORT_LINK}" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    Visit Support Center →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mb-10">
          <h4 class="text-xl font-bold mb-4 flex items-center gap-2">
            <i data-lucide="package" class="w-6 h-6 text-purple-400"></i>
            About
          </h4>
          <div class="glass-card rounded-xl p-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
                <div class="flex items-center gap-3">
                  <i data-lucide="tag" class="w-6 h-6 text-purple-400"></i>
                  <span class="font-semibold">Version</span>
                </div>
                <span class="text-purple-400 font-mono font-bold">${APP_VERSION}</span>
              </div>
              <div class="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
                <div class="flex items-center gap-3">
                  <i data-lucide="calendar" class="w-6 h-6 text-purple-400"></i>
                  <span class="font-semibold">Last Updated</span>
                </div>
                <span class="text-gray-400">October 2025</span>
              </div>
              <div class="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
                <div class="flex items-center gap-3">
                  <i data-lucide="server" class="w-6 h-6 text-purple-400"></i>
                  <span class="font-semibold">Deployment</span>
                </div>
                <span class="text-gray-400">Self-Hosted</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="glass-card rounded-xl p-6 bg-purple-900/20 border border-purple-500/30">
          <div class="flex items-start gap-4">
            <i data-lucide="heart" class="w-6 h-6 text-purple-400 flex-shrink-0 mt-1"></i>
            <div>
              <h5 class="font-bold text-lg mb-2">Thank You for Using Our App</h5>
              <p class="text-gray-300 text-sm leading-relaxed">
                This application is designed to give you complete control over your data. 
                If you have any questions or feedback, please don't hesitate to reach out to our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    lucide.createIcons();
  },
  
  refresh() {
    this.render();
  }
};
