import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: [
      'storage',
      'scripting',
    ],
    host_permissions: [
      'https://*.linkedin.com/*',
      'https://lyra-extension-nextjs.vercel.app/*',
    ]
  },
});
