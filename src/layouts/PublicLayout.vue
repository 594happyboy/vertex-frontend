<template>
  <div class="public-layout">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  margin-top: var(--navbar-height);
}

@media (max-width: 767px) {
  .main-content {
    margin-top: var(--navbar-height-mobile);
  }
}
</style>

