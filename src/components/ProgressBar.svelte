<script>
  export let progress;
  
  $: percentage = progress.percentage || 0;
  $: total = progress.total || 0;
  $: known = progress.known || 0;
  $: unknown = progress.unknown || 0;
  $: blank = progress.blank || 0;
</script>

<div class="progress-bar bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
  <div class="flex items-center justify-between mb-2">
    <h3 class="text-lg font-semibold text-gray-800">Learning Progress</h3>
    <span class="text-2xl font-bold text-blue-600">{percentage}%</span>
  </div>
  
  <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
    <div 
      class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
      style="width: {percentage}%"
    ></div>
  </div>
  
  <div class="grid grid-cols-4 gap-4 text-sm">
    <div class="text-center">
      <div class="text-2xl font-bold text-gray-800">{total}</div>
      <div class="text-gray-500">Total Words</div>
    </div>
    <div class="text-center">
      <div class="text-2xl font-bold text-green-600">{known}</div>
      <div class="text-gray-500">Known</div>
    </div>
    <div class="text-center">
      <div class="text-2xl font-bold text-red-600">{unknown}</div>
      <div class="text-gray-500">Unknown</div>
    </div>
    <div class="text-center">
      <div class="text-2xl font-bold text-gray-400">{blank}</div>
      <div class="text-gray-500">Unmarked</div>
    </div>
  </div>
</div>
