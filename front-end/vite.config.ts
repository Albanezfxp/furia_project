import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Substitua "repository-name" pelo nome do seu repositório
export default defineConfig({
  plugins: [react()],
  base: '/furia_bot/',
});
