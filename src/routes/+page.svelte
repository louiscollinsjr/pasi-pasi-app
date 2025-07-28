<script>
  import HomepageGallery from '$lib/components/HomepageGallery.svelte';
  import { ArrowDown } from 'lucide-svelte';
  import { onMount } from 'svelte';
  
  let scrollY = 0;
  let scrollIndicatorOpacity = 1;
  
  onMount(() => {
    const updateScrollIndicator = () => {
      scrollY = window.scrollY;
      // Fade out when scrolling starts, fade in when at top
      scrollIndicatorOpacity = scrollY > 50 ? 0 : 1;
    };
    
    window.addEventListener('scroll', updateScrollIndicator);
    
    return () => {
      window.removeEventListener('scroll', updateScrollIndicator);
    };
  });
  
  // Clean, minimal landing page inspired by modern design
</script>

<svelte:head>
  <title>Leo&Finn - Romanian Language Learning</title>
</svelte:head>

<main class="min-h-screen flex flex-col max-w-7xl mx-auto">
  <div class="text-center h-[70vh] flex flex-col justify-between items-center px-4 p-8">
    <!-- Hero Content -->
    <div class="flex flex-col justify-center items-center gap-6">
      <!-- Brand Title -->
      <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
        <span class="text-black font-mansalva">Leo&Finn</span>
      </h1>
    
      <!-- Subheading / Tagline -->
      <div class="font-mono text-sm text-slate-400 tracking-wide uppercase">
        [ build fluency daily ]
      </div>
    
      <!-- Hero Tagline -->
      <p class="text-lg md:text-xl text-slate-600 font-normal leading-relaxed">
        Your language learning companion.
      </p>
    
      <!-- Hero Body -->
      <div class="max-w-xl mx-auto">
        <p class="text-base text-slate-600 leading-7">
          Leo&Finn helps you internalize any language using the decode method—by understanding, not memorizing. Break down real sentences, hear natural pronunciation, and make lasting connections as you go.
        </p>
      </div>
    
      <!-- CTA Button -->
      <div class="mt-6">
        <a
          href="/library"
          class="inline-flex items-center justify-center rounded-md bg-slate-900 text-slate-50 hover:bg-slate-800 px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
        >
          Start Learning
        </a>
      </div>
    </div>

    <!-- Scroll indicator at bottom -->
    <div 
      class="animate-bounce transition-opacity duration-600"
      style="opacity: {scrollIndicatorOpacity}"
    >
      <button 
        on:click={() => window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'smooth' })}
        class="p-2 rounded-full bg-slate-000 hover:bg-slate-000 transition-colors"
        aria-label="Scroll down to see more content"
      >
        <ArrowDown size={16} class="text-slate-600" />
      </button>
    </div>
  </div>

  <!-- Featured Content Gallery -->
  <HomepageGallery />

  <!-- Section to suggest features -->
  <section class="text-center py-12 border-t border-slate-200 mt-8 w-full">
    <h2 class="text-2xl font-semibold text-slate-900 mb-4 leading-tight">
      Stay Tuned!
    </h2>
    <p class="text-base text-slate-600 mb-6 leading-7">
      We're constantly working on new and exciting features. Many more are coming soon!
    </p>
    <a href="mailto:feedback@pasi-pasi.com" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 px-4 py-2 no-underline text-slate-900">
      Suggest a Feature
    </a>
  </section>
  
  <footer class="mt-auto pt-8">
    <p class="text-sm text-slate-500 m-0 text-center">
      Built with ❤️ for Language Learners
    </p>
  </footer>
</main>


<style>
  
  .font-mansalva {
    font-family: 'Mansalva', serif !important;
  }
  
</style>
