<template>
  <router-view />
  <ClueTrade v-if="route.name !== 'login'" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import ClueTrade from './src/components/ClueTrade.vue'

const route = useRoute()
</script>