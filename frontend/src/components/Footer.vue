<template>
  <footer class="bg-gray-800 text-white pt-10 pb-5 mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 class="text-2xl font-bold mb-4 flex items-center gap-3">
            <i class="fas fa-book"></i>
            <span>Online Notebook</span>
          </h3>
          <p class="text-gray-400 leading-relaxed">
            A platform for students to share and access educational resources.
          </p>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold mb-4 text-gray-200">Quick Links</h4>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="text-gray-400 hover:text-white transition-colors">
                Home
              </router-link>
            </li>
            <li>
              <router-link to="/notes" class="text-gray-400 hover:text-white transition-colors">
                Browse Notes
              </router-link>
            </li>
            <li>
              <router-link to="/register" class="text-gray-400 hover:text-white transition-colors">
                Register
              </router-link>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold mb-4 text-gray-200">Contact</h4>
          <p class="text-gray-400 mb-3">
            <i class="fas fa-envelope mr-2"></i>
            support@onlinenotebook.com
          </p>
          <p class="text-gray-400">
            <i class="fas fa-phone mr-2"></i>
            +1 234 567 890
          </p>
        </div>
      </div>
      
      <div class="pt-6 border-t border-gray-700 text-center">
        <p class="text-gray-500">
          &copy; 2025 Online Notebook. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
};
</script>

<style scoped>
/* No custom styles needed - using Tailwind CSS */
</style>

