<script lang="ts">
  import '../app.css';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Sheet from '$lib/components/ui/sheet/index';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Navbar from '$lib/components/Navbar.svelte';
  import AppSidebar from '$lib/components/AppSidebar.svelte';
  import LessonView from '$lib/components/LessonView.svelte';
  import { FilePlus, Files, Gear, Export, PencilSimple, Archive, Trash } from 'phosphor-svelte';

  let sidebarOpen = false;
  let lessons = [];
let openMenuIdx = null;
let selectedLesson = null;

/** Deletes a lesson by index. Confirmation is handled in the sidebar. */
function deleteLesson(idx: number) {
  const lesson = lessons[idx];
  if (!lesson) return;
  const updated = [...lessons];
  updated.splice(idx, 1);
  localStorage.setItem('pasi_lessons', JSON.stringify(updated));
  lessons = updated;
  // If deleted lesson is selected, clear selection
  if (selectedLesson && selectedLesson.title === lesson.title) {
    selectedLesson = null;
  }
  // If user is currently viewing the deleted lesson, navigate away
  if ($page.route.id === '/lesson/[id]' && $page.params.id === lesson.id) {
    goto('/library');
  }
  openMenuIdx = null;
}

function loadLessons() {
  lessons = JSON.parse(localStorage.getItem('pasi_lessons') || '[]');
}

function handleOutsideClick(event) {
  if (!event.target.closest('.lesson-menu')) {
    openMenuIdx = null;
  }
}

function handleEsc(event) {
  if (event.key === 'Escape') {
    openMenuIdx = null;
  }
}

onMount(() => {
  loadLessons();
  window.addEventListener('storage', loadLessons);
  window.addEventListener('lessonsUpdated', loadLessons);
  document.addEventListener('mousedown', handleOutsideClick);
  document.addEventListener('keydown', handleEsc);
  return () => {
    window.removeEventListener('storage', loadLessons);
    window.removeEventListener('lessonsUpdated', loadLessons);
    document.removeEventListener('mousedown', handleOutsideClick);
    document.removeEventListener('keydown', handleEsc);
  };
});

  let menu = [
    { label: 'New lesson', icon: FilePlus, action: () => {goto('/parser')} },
    { label: 'Library', icon: Files, action: () => {} },
    { label: 'Settings', icon: Gear, action: () => {} },
  ];

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<svelte:head>
  <style>
    html { font-size: 12px; }
  </style>
</svelte:head>

<div class="min-h-screen bg-white">
  <!-- Static Navbar -->
  <Navbar {toggleSidebar} {sidebarOpen} />
  
  <!-- Sidebar -->
  <AppSidebar
    {sidebarOpen}
    setSidebarOpen={v => sidebarOpen = v}
    {menu}
    {lessons}
    {selectedLesson}
    setSelectedLesson={l => selectedLesson = l}
    {openMenuIdx}
    setOpenMenuIdx={v => openMenuIdx = v}
    {deleteLesson}
    {Export}
    {PencilSimple}
    {Archive}
    {Trash}
    {Sheet}
    {Button}
  />

  <!-- Main content area -->
  <main class="pt-16 transition-all duration-300 ease-in-out {sidebarOpen ? 'ml-64' : 'ml-0'}">
    <div class="max-w-6xl mx-auto px-4 py-8">
      {#if selectedLesson}
        <LessonView lesson={selectedLesson} />
      {:else}
        <slot />
      {/if}
    </div>
  </main>
</div>