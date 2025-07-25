import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const initialValue = browser ? window.localStorage.getItem('sidebarOpen') === 'true' : false;

const store = writable<boolean>(initialValue);

store.subscribe((value) => {
  if (browser) {
    window.localStorage.setItem('sidebarOpen', String(value));
  }
});

export const sidebarOpen = store;
