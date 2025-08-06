<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { userProfile } from '$lib/stores/userProfileStore';
  import { supabase } from '$lib/supabaseClient';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card/index';

  let nativeLang: 'en' | 'fr' = 'en';
  let isAuthed = false;

  onMount(async () => {
    if (!browser) return;
    const { data } = await supabase.auth.getUser();
    isAuthed = !!data.user;
    await userProfile.fetchProfile(data.user ?? undefined);
    nativeLang = (/** @type any */ ($userProfile)?.profile?.native_language) ?? 'en';
  });

  $: if ($userProfile.profile?.native_language && $userProfile.profile.native_language !== nativeLang) {
    nativeLang = $userProfile.profile.native_language as 'en' | 'fr';
  }

  async function handleChange() {
    if (!isAuthed) return;
    await userProfile.updateProfile({ native_language: nativeLang });
  }
</script>

<svelte:head>
  <title>Settings</title>
</svelte:head>

<div class="max-w-2xl mx-auto py-8 space-y-6">
  <Card.Root>
    <Card.Header>
      <Card.Title>Settings</Card.Title>
      <Card.Description>Manage your profile and language preferences.</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      {#if !isAuthed}
        <p class="text-sm text-muted-foreground">You must be logged in to manage settings.</p>
      {/if}

      <div class="space-y-2">
        <label for="native-language" class="text-sm font-medium">Native Language</label>
        <select
          id="native-language"
          class="w-full p-2 border rounded"
          bind:value={nativeLang}
          on:change={handleChange}
          disabled={$userProfile.loading || !isAuthed}
        >
          <option value="en">English</option>
          <option value="fr">French</option>
        </select>
        {#if $userProfile.error}
          <p class="text-sm text-red-600">{$userProfile.error}</p>
        {/if}
      </div>
    </Card.Content>
  </Card.Root>
</div>

<style>
  /* minimal page-specific styles if needed */
</style>
