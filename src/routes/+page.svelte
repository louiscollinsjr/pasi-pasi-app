<script>
  // Clean, minimal landing page inspired by modern design
</script>

<svelte:head>
  <title>Pași Pași - Romanian Language Learning</title>
</svelte:head>

<main class="min-h-screen flex flex-col items-center justify-center p-8 max-w-4xl mx-auto">
  <div class="text-center flex-1 flex flex-col justify-center gap-6">
    <h1 class="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
      Welcome to Pași Pași
    </h1>
    
    <div class="font-mono text-sm text-slate-500 my-2">
      [ enter flow state ]
    </div>
    
    <p class="text-xl text-slate-600 font-normal leading-relaxed">
      Your companion for learning Romanian, step by step.
    </p>
    
    <div class="max-w-lg mx-auto">
      <p class="text-base leading-7 text-slate-600">
        Pași Pași is designed to help you master Romanian through interactive lessons, pronunciation guides, and practical vocabulary. Whether you&apos;re a beginner or brushing up, every step brings you closer to fluency.
      </p>
    </div>
    
    <div class="mt-8">
      <a href="/lesson/1" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 px-4 py-2.5 no-underline">
        Start Learning
      </a>
    </div>
  </div>
  
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
    <p class="text-sm text-slate-500 m-0">
      Built with ❤️ for Romanian learners
    </p>
  </footer>
</main>


