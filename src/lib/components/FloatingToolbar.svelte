<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { 
    ChevronLeft, 
    ChevronRight,
    BookOpen, 
    Speech, 
    Eye, 
    Focus, 
    GripVertical 
  } from 'lucide-svelte';

  // Props
  export let items = [];
  export let expanded = false;
  export let position = { x: 20, y: 200 };

  // Internal state
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let toolbarElement;
  let isAnimatingBack = false;
  let portalContainer;
  
  const dispatch = createEventDispatcher();

  // Default items for LessonView
  const defaultItems = [
    {
      id: 'back',
      icon: ChevronLeft,
      label: 'Back',
      action: () => history.back()
    },
    {
      id: 'reading-mode',
      icon: BookOpen,
      label: 'Reading Mode',
      action: () => dispatch('toggle-mode', 'reading'),
      active: false
    },
    {
      id: 'focus-mode',
      icon: Focus,
      label: 'Focus Mode',
      action: () => dispatch('toggle-mode', 'focus'),
      active: false
    },
    {
      id: 'pronunciation',
      icon: Speech,
      label: 'Pronunciation',
      action: () => dispatch('toggle-pronunciation'),
      active: false
    }
  ];

  // Use provided items or defaults
  $: toolbarItems = items.length > 0 ? items : defaultItems;

  // Event dispatcher is already imported at the top

  // Drag functionality
  function handleMouseDown(event) {
    if (event.target.closest('.toolbar-button') || event.target.closest('.expand-button')) {
      return;
    }
    
    isDragging = true;
    dragOffset.x = event.clientX - position.x;
    dragOffset.y = event.clientY - position.y;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(event) {
    if (!isDragging) return;
    
    const newX = event.clientX - dragOffset.x;
    const newY = event.clientY - dragOffset.y;
    
    // Keep toolbar within viewport bounds
    const rect = toolbarElement?.getBoundingClientRect();
    const maxX = window.innerWidth - (rect?.width || 200);
    const maxY = window.innerHeight - (rect?.height || 50);
    
    position.x = Math.max(0, Math.min(newX, maxX));
    position.y = Math.max(0, Math.min(newY, maxY));
  }

  function handleMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Animate back to right side if dragged away
    const rightEdge = window.innerWidth - 100;
    if (position.x < rightEdge - 50) {
      animateToRightSide();
    }
  }

  function animateToRightSide() {
    isAnimatingBack = true;
    const targetX = window.innerWidth - (toolbarElement?.getBoundingClientRect().width || 200) - 20;
    
    // Simple animation using requestAnimationFrame
    const startX = position.x;
    const distance = targetX - startX;
    const duration = 300;
    const startTime = Date.now();
    
    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      position.x = startX + (distance * easeOut);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimatingBack = false;
      }
    }
    
    requestAnimationFrame(animate);
  }

  function toggleExpanded() {
    expanded = !expanded;
  }

  function handleItemClick(item) {
    if (item.action) {
      item.action();
    }
    dispatch('item-click', item);
  }

  // Handle window resize
  onMount(() => {
    if (!browser) return;
    
    if (toolbarElement && document.body) {
      document.body.appendChild(toolbarElement);
    }
    
    function handleResize() {
      // Snap back to right side on resize
      if (toolbarElement) {
        position.x = 20;
      }
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      // Clean up: remove from body when component is destroyed
      if (browser && toolbarElement && toolbarElement.parentNode === document.body) {
        document.body.removeChild(toolbarElement);
      }
    };
  });
</script>

<div
  bind:this={toolbarElement}
  class="browser-toolbar p-1 select-none"
  class:dragging={isDragging}
  class:animating={isAnimatingBack}
  style={browser ? `position: fixed !important; right: 20px !important; bottom: ${window.innerWidth < 768 ? 32 : 64}px !important; z-index: 2147483647 !important; transition: ${isAnimatingBack ? 'right 0.3s cubic-bezier(0.2, 0, 0.2, 1)' : 'none'};` : ''}
  on:mousedown={handleMouseDown}
  role="toolbar"
  aria-label="Floating toolbar"
  tabindex="0"
>
  <div class="inline-flex rounded-md bg-white border-gray-200 shadow-sm border-b shadow-gray-300">
    <!-- Expand/Collapse button -->
    <button
      class="expand-button flex items-center transition-all border-none focus:z-10 p-2 justify-center bg-white hover:bg-gray-100 hover:cursor-pointer rounded-l-md"
      on:click={toggleExpanded}
      aria-label={expanded ? 'Collapse toolbar' : 'Expand toolbar'}
      title={expanded ? 'Collapse toolbar' : 'Expand toolbar'}
    >
      <span class="flex items-center">
        {#if expanded}
          <ChevronRight size={16} class="text-gray-600" />
        {:else}
          <ChevronLeft size={16} class="text-gray-600" />
        {/if}
      </span>
    </button>

    <!-- Toolbar items -->
    {#each toolbarItems as item, index (item.id)}
      <button
        class="toolbar-button flex items-center transition-all border-none focus:z-10 p-2 justify-center bg-white hover:bg-gray-100 hover:cursor-pointer -ml-px"
        class:bg-blue-50={item.active}
        class:text-blue-600={item.active}
        on:click={() => handleItemClick(item)}
        aria-label={item.label}
        title={item.label}
      >
        <span class="flex items-center">
          <svelte:component this={item.icon} size={16} class={item.active ? 'text-gray-300' : 'text-gray-600'} />
        </span>
        <span 
          class="transition-[width,opacity] duration-200 text-sm font-semibold text-gray-700 text-center overflow-hidden whitespace-nowrap ml-2"
          class:w-0={!expanded}
          class:max-w-0={!expanded}
          class:opacity-0={!expanded}
          class:w-auto={expanded}
          class:max-w-none={expanded}
          class:opacity-100={expanded}
        >
          {item.label}
        </span>
      </button>
    {/each}

    <!-- Drag handle (always visible) -->
    <button
      class="flex items-center transition-all border-none focus:z-10 p-2 justify-center bg-white hover:bg-gray-100 hover:cursor-grab active:cursor-grabbing rounded-r-md drag-handle"
      aria-label="Drag toolbar"
    >
      <GripVertical size={16} class="text-gray-500" />
    </button>
  </div>
</div>

<style>
  .browser-toolbar {
    position: fixed !important;
    user-select: none;
    -webkit-user-select: none;
  }
  
  .browser-toolbar.dragging {
    cursor: grabbing;
  }
  
  .drag-handle:active {
    cursor: grabbing;
  }
  
  .toolbar-button:hover .lucide-icon {
    color: #374151;
  }
  
  .toolbar-button.bg-blue-50:hover .lucide-icon {
    color: #2563eb;
  }
</style>
