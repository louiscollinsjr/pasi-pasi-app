<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';

  onMount(async () => {
    // This will parse the URL and store the session in localStorage
    await supabase.auth.getSession();
    // Redirect to login or dashboard
    goto('/login');
  });
</script>

<p>Signing you in...</p>
