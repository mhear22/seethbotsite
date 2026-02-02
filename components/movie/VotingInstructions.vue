<script setup lang="ts">
</script>

<template>
  <div class="instructions">
    <h3>📋 How to Vote</h3>
    <ol>
      <li>Add movies to your ranking by clicking the "+ Add" button</li>
      <li>Drag or use arrows to reorder by preference (1st choice at the top)</li>
      <li>Rank as many or as few as you like (minimum 2)</li>
      <li>Click "Submit Vote" when you're done</li>
    </ol>
  </div>
</template>

<style scoped>
.instructions {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.instructions h3 {
  margin-top: 0;
}

.instructions ol {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.instructions li {
  margin: 8px 0;
  line-height: 1.5;
}
</style>
