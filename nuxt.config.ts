// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // Disable devtools in production
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  
  // App configuration
  app: {
    head: {
      title: 'Sobriety Counter',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Track sobriety journey with this counter app' },
        { name: 'theme-color', content: '#667eea' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    // Add page transition for smoother navigation
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  
  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys that are exposed to the server
    
    // Public keys that are exposed to the client
    public: {
      friendName: process.env.NUXT_PUBLIC_FRIEND_NAME || 'My Friend'
    }
  },
  
  // Build configuration
  build: {
    transpile: []
  },
  
  // Generate configuration for static hosting
  generate: {
    fallback: true // Creates a 404.html fallback
  },
  
  // Nitro configuration for better performance
  nitro: {
    compressPublicAssets: true,
    minify: true
  }
})
