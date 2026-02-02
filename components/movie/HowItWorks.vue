<script setup lang="ts">
</script>

<template>
  <div class="how-it-works">
    <h3>📖 How Preferential Voting Works</h3>
    <ol>
      <li>Voters rank movies in order of preference (1st, 2nd, 3rd...)</li>
      <li>In Round 1, only 1st preferences are counted</li>
      <li>If no movie has >50% of votes, the lowest-ranked movie is eliminated</li>
      <li>Votes for the eliminated movie are redistributed to voters' next preferences</li>
      <li>This continues until one movie has >50% (majority) or only one remains</li>
    </ol>
  </div>
</template>

<style scoped>
.how-it-works {
  background: #fef3c7;
  padding: 20px;
  border-radius: 12px;
}

.how-it-works h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #92400e;
}

.how-it-works ol {
  margin: 0;
  padding-left: 20px;
  line-height: 1.7;
}

.how-it-works li {
  margin: 8px 0;
  color: #78350f;
}
</style>
