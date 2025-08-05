<script lang="ts">
import { supabase } from '$lib/supabaseClient';
import { Button } from '$lib/components/ui/button/index';
import { user as userStore } from '$lib/stores/userStore';

let email = '';
let loading = false;
let message = '';
let messageType: 'success' | 'error' = 'success';
let agreedToTerms = false;

// Subscribe to the global user store
$: user = $userStore;

async function login() {
  loading = true;
  message = '';
  console.log('Attempting login with email:', email);
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: (typeof window !== 'undefined' ? window.location.origin : '') + '/auth/callback?next=' + encodeURIComponent('/login')
    }
  });
  
  loading = false;
  if (error) {
    console.error('Login error:', error);
    message = error.message;
    messageType = 'error';
  } else {
    console.log('Magic link sent successfully');
    message = 'Check your email for the magic link!';
    messageType = 'success';
  }
}

async function logout() {
  console.log('Logging out user:', user?.email);
  await supabase.auth.signOut();
  message = '';
  console.log('User logged out');
}
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl w-full">
  {#if user}
    <!-- Logged In State -->
    <div class="text-center space-y-6">
      <div class="space-y-2">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-semibold text-gray-900">Welcome back!</h2>
        <p class="text-gray-600">Signed in as <span class="font-medium">{user.email}</span></p>
      </div>
      
      <Button 
        on:click={logout} 
        variant="outline" 
        class="w-full h-11 text-gray-700 border-gray-300 hover:bg-gray-50"
      >
        Sign Out
      </Button>
    </div>
  {:else}
    <!-- Login State -->
    <div class="space-y-6">
      <div class="text-center space-y-2">
        <!-- <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div> -->
        <h2 class="text-5xl font-semibold text-gray-900 pb-6"><span class="font-bold font-mansalva">Leo & Finn</span></h2>
        <p class="text-gray-600">Enter your email to get started with magic link authentication</p>
      </div>

      <form on:submit|preventDefault={login} class="space-y-4">
        <div class="space-y-2">
          <label for="email" class="block text-base font-medium text-gray-700">Email address</label>
          <input 
            id="email"
            type="email" 
            placeholder="you@example.com" 
            bind:value={email}
            disabled={loading}
            class="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
        <!-- Terms of Service Checkbox -->
        <div class="flex items-start mt-4 py-3">
          <div class="flex items-center h-5">
            <input 
              id="terms" 
              type="checkbox" 
              bind:checked={agreedToTerms}
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
          <label for="terms" class="ms-2 text-sm font-medium text-gray-700">
            I agree to the <a href="/terms" class="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" class="text-blue-600 hover:underline">Privacy Policy</a>
          </label>
        </div>
        <button 
          type="submit"
          disabled={loading || !email.trim() || !agreedToTerms}
          class="w-full h-11 bg-black hover:bg-black/80 text-white text-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg"
        >
          {#if loading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending magic link...
          {:else}
            Send Magic Link
          {/if}
        </button>
      </form>

      {#if message}
        <div class="p-4 rounded-lg {messageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              {#if messageType === 'success'}
                <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              {:else}
                <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
              {/if}
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium {messageType === 'success' ? 'text-green-800' : 'text-red-800'}">
                {message}
              </p>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .font-mansalva {
    font-family: 'Mansalva', sans-serif;
  }
</style>