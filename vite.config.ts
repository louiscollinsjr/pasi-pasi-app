import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	envDir: '.', 
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 5173,
		hmr: {
			port: 5173,
			clientPort: 5173,
			timeout: 30000 // Increase HMR timeout to 30 seconds
		},
		watch: {
			usePolling: true,
			ignored: ['!**/src/lib/components/LessonView.svelte'] // Ensure this file is always watched
		}
	},
	build: {
		chunkSizeWarningLimit: 1600, // Increase chunk size limit
	},
	ssr: {
		noExternal: ['bits-ui', 'phosphor-svelte']
	}
});
