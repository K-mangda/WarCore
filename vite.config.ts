import {defineConfig} from 'vite';
export default defineConfig({define:{'import.meta.env.VITE_BUILD_ID':JSON.stringify(Date.now().toString(36))},build:{rollupOptions:{input:{game:'index.html',lab:'lab.html'}}}});
