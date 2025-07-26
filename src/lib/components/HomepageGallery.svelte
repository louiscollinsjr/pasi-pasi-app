<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { BookOpen, Users, ArrowRight } from 'lucide-svelte';

  interface Collection {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    created_at: string;
    lesson_count?: number;
  }

  interface Lesson {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    created_at: string;
    collection_name?: string;
  }

  let collections: Collection[] = [];
  let lessons: Lesson[] = [];
  let loading = true;

  async function loadFeaturedContent() {
    try {
      // Load featured collections (up to 3)
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select(`
          id,
          title,
          description,
          image_url,
          created_at,
          documents(count)
        `)
        .order('created_at', { ascending: false })
        .limit(1);

      if (collectionsError) throw collectionsError;

      collections = collectionsData?.map(col => ({
        ...col,
        lesson_count: col.documents?.[0]?.count || 0
      })) || [];

      // Load featured lessons (up to 6)
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          description,
          image_url,
          created_at,
          collections(title)
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (lessonsError) throw lessonsError;

      lessons = lessonsData?.map(lesson => ({
        ...lesson,
        collection_name: lesson.collections?.title
      })) || [];

    } catch (error) {
      console.error('Error loading featured content:', error);
    } finally {
      loading = false;
    }
  }

  function getImageUrl(item: Collection | Lesson): string {
    return item.image_url || '/default.webp';
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onMount(() => {
    loadFeaturedContent();
  });
</script>

<section class="py-16 bg-white mt-24">
  <div class="container mx-auto px-6">
    <!-- Featured Collections -->
    {#if collections.length > 0}
      <div class="mb-16">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold text-slate-900 mb-2">Featured Collections</h2>
            <p class="text-slate-600">Curated learning paths to guide your journey</p>
          </div>
          <!-- <a href="/library" class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            View all <ArrowRight size={16} />
          </a> -->
        </div>

        <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8">
          {#each collections as collection (collection.id)}
            <a href="/library/collections/{collection.id}" class="group block">
              <div class="bg-white">
                <!-- Image -->
                <div class="aspect-[4/5] md:aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden rounded-lg">
                  <img 
                    src={getImageUrl(collection)} 
                    alt={collection.title}
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                </div>
                
                <!-- Content -->
                <div class="p-2">
                  <div class="flex items-start justify-between mb-0">
                    <h3 class="text-3xl w-[80%]  text-slate-900 py-4 font-roboto">
                      {collection.title}
                    </h3>
                  </div>
                  <div class="flex items-center gap-1 text-xs text-slate-900 mb-2">
                     Lessons <span class="text-slate-500">{collection.lesson_count}</span>
                  </div>
                  
                  {#if collection.description}
                    <p class="text-slate-600 text-sm mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                  {/if}
                  
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-400">
                      {formatDate(collection.created_at)}
                    </span>
                    <!-- <span class="text-sm font-medium text-gray-900 group-hover:text-gray-600">
                      Keep reading →
                    </span> -->
                  </div>
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Featured Lessons -->
    {#if lessons.length > 0}
      <div>
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold text-slate-900 mb-2">Latest Lessons</h2>
            <p class="text-slate-600">Jump into individual lessons and start learning</p>
          </div>
          <!-- <a href="/library" class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            View all <ArrowRight size={16} />
          </a> -->
        </div>

        <!-- Desktop: 3 columns, Mobile: 1 column, Tablet: 2 columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {#each lessons as lesson (lesson.id)}
            <a href="/lesson/{lesson.id}" class="group block">
              <div class="bg-white">
                <!-- Image -->
                <div class="aspect-video bg-gradient-to-br from-green-100 to-blue-100 relative overflow-hidden rounded-lg">
                  <img 
                    src={getImageUrl(lesson)} 
                    alt={lesson.title}
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                </div>
                
                <!-- Content -->
                <div class="p-2">
                  <div class="flex items-start justify-between mb-0">
                    <h3 class="text-3xl w-[80%] text-slate-900 py-4 font-roboto">
                      {lesson.title}
                    </h3>
                  </div>
                  
                  {#if lesson.collection_name}
                    <div class="flex items-center gap-1 text-xs text-slate-900 mb-2">
                      Collection <span class="text-slate-500">{lesson.collection_name}</span>
                    </div>
                  {/if}
                  
                  {#if lesson.description}
                    <p class="text-slate-600 text-sm mb-4 line-clamp-2">
                      {lesson.description}
                    </p>
                  {/if}
                  
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-400">
                      {formatDate(lesson.created_at)}
                    </span>
                    <!-- <span class="text-sm font-medium text-gray-900 group-hover:text-gray-600">
                      Keep reading →
                    </span> -->
                  </div>
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Loading State -->
    {#if loading}
      <div class="text-center py-16">
        <div class="inline-flex items-center gap-3 text-slate-600">
          <div class="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
          Loading featured content...
        </div>
      </div>
    {/if}

    <!-- Empty State -->
    {#if !loading && collections.length === 0 && lessons.length === 0}
      <div class="text-center py-16">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen size={24} class="text-slate-400" />
        </div>
        <h3 class="text-lg font-semibold text-slate-900 mb-2">No content yet</h3>
        <p class="text-slate-600 mb-6">Start by creating your first collection or lesson</p>
        <a href="/library" class="inline-flex items-center justify-center rounded-md bg-slate-900 text-slate-50 hover:bg-slate-800 px-4 py-2 text-sm font-medium transition-colors">
          Go to Library
        </a>
      </div>
    {/if}
  </div>
</section>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
