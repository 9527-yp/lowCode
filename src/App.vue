<script setup>
import { provide, ref } from 'vue';
import data from './data.json';
import Editor from '@/packages/editor.jsx';
import { registerConfig as config } from '@/utils/editor.config.jsx';

const state = ref(data)

provide('config', config)

</script>

<template>
  <div class="app">
    <Editor v-model:state="state"></Editor>
  </div>
</template>

<style scoped>
.app{
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
