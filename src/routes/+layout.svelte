<script lang="ts">
  import '../app.css';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Sheet from '$lib/components/ui/sheet/index';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

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

  import { FilePlus, Files, Gear, Export, PencilSimple, Archive, Trash } from 'phosphor-svelte';
  import AppSidebar from '$lib/components/AppSidebar.svelte';

let menu = [
  { label: 'New lesson', icon: FilePlus, action: () => {goto('/parser')} },
  { label: 'Library', icon: Files, action: () => {} },
  { label: 'Settings', icon: Gear, action: () => {} },
];

  // Responsive sidebar toggle
  let isMobile = false;
  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });
</script>

<svelte:head>
  <style>
    html { font-size: 12px; }
  </style>
</svelte:head>

<div class="flex min-h-screen bg-background font-roboto text-xs">
  <AppSidebar
    isMobile={isMobile}
    sidebarOpen={sidebarOpen}
    setSidebarOpen={v => sidebarOpen = v}
    menu={menu}
    lessons={lessons}
    selectedLesson={selectedLesson}
    setSelectedLesson={l => selectedLesson = l}
    openMenuIdx={openMenuIdx}
    setOpenMenuIdx={v => openMenuIdx = v}
    deleteLesson={deleteLesson}
    Export={Export}
    PencilSimple={PencilSimple}
    Archive={Archive}
    Trash={Trash}
    Sheet={Sheet}
    Button={Button}
  />

  <!-- Main content area -->
  <main class="flex-1 flex flex-col items-center overflow-y-auto">
    <div class="w-full max-w-6xl px-4 py-8">
      {#if selectedLesson}
        <LessonView lesson={selectedLesson} />
      {:else}
        <slot />
      {/if}
    </div>
  </main>
</div>