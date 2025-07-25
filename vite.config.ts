import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	envDir: '.', 
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['bits-ui', 'phosphor-svelte']
	}
});
