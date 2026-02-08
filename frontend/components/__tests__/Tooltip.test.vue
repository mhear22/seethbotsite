<script setup lang="ts">
import { ref } from 'vue'
import Tooltip from '../shared/ui/Tooltip.vue'

const tooltipPosition = ref<'top' | 'bottom' | 'left' | 'right'>('top')
const delay = ref(200)
</script>

<template>
  <div class="tooltip-test-container">
    <h1>Tooltip Component Test</h1>

    <section>
      <h2>Basic Usage</h2>
      <Tooltip text="This is a tooltip!">
        <button class="test-btn">Hover me</button>
      </Tooltip>
    </section>

    <section>
      <h2>Different Positions</h2>
      <div class="position-test">
        <Tooltip text="Tooltip on top" position="top">
          <button class="test-btn">Top</button>
        </Tooltip>
        <Tooltip text="Tooltip on bottom" position="bottom">
          <button class="test-btn">Bottom</button>
        </Tooltip>
        <Tooltip text="Tooltip on left" position="left">
          <button class="test-btn">Left</button>
        </Tooltip>
        <Tooltip text="Tooltip on right" position="right">
          <button class="test-btn">Right</button>
        </Tooltip>
      </div>
    </section>

    <section>
      <h2>Accessibility - Keyboard Focus</h2>
      <p>Tab through these buttons to see tooltips appear on focus:</p>
      <div class="focus-test">
        <Tooltip text="First tooltip">
          <button class="test-btn">Button 1</button>
        </Tooltip>
        <Tooltip text="Second tooltip">
          <button class="test-btn">Button 2</button>
        </Tooltip>
        <Tooltip text="Third tooltip">
          <button class="test-btn">Button 3</button>
        </Tooltip>
      </div>
    </section>

    <section>
      <h2>Wrapped Content Types</h2>
      <Tooltip text="This is a link tooltip">
        <a href="#" class="test-link">Link with tooltip</a>
      </Tooltip>
      <Tooltip text="This is an icon tooltip">
        <span class="test-icon">★</span>
      </Tooltip>
      <Tooltip text="This is an input tooltip">
        <input type="text" placeholder="Input with tooltip" class="test-input">
      </Tooltip>
    </section>
  </div>
</template>

<style scoped>
.tooltip-test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Quicksand', sans-serif;
}

h1 {
  color: #ff6b9d;
  margin-bottom: 30px;
}

h2 {
  color: #2d3748;
  margin: 30px 0 15px 0;
  font-size: 1.3rem;
}

section {
  margin-bottom: 40px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.test-btn {
  padding: 10px 20px;
  margin: 5px;
  background: linear-gradient(45deg, #ff6b9d, #ff8a80);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.test-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.test-btn:focus {
  outline: 2px solid #ff6b9d;
  outline-offset: 2px;
}

.position-test,
.focus-test {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.test-link {
  color: #ff6b9d;
  text-decoration: underline;
  padding: 5px;
}

.test-link:focus {
  outline: 2px solid #ff6b9d;
  outline-offset: 2px;
}

.test-icon {
  display: inline-block;
  padding: 8px;
  font-size: 24px;
  cursor: pointer;
}

.test-icon:focus {
  outline: 2px solid #ff6b9d;
  outline-offset: 2px;
}

.test-input {
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-family: 'Quicksand', sans-serif;
}

.test-input:focus {
  outline: none;
  border-color: #ff6b9d;
}

/* Dark mode */
.dark h1 {
  color: #ffb6c1;
}

.dark h2 {
  color: #e2e8f0;
}

.dark section {
  background: rgba(45, 55, 72, 0.8);
}

.dark .test-input {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}
</style>
