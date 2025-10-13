<template>
  <div id="app">
    <FileManager />
  </div>
</template>

<script setup>
import FileManager from './views/FileManager.vue'
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  min-height: 100vh;
}

body {
  margin: 0;
  padding: 0;
}
</style>
