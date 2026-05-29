<script setup>
import Darkmode from 'darkmode-js';
import { onMounted } from 'vue';

// Button visual settings and behavior
const options = {
  bottom: '64px', // bottom position
  right: '32px',  // right position
  time: '0.5s',   // transition duration
  mixColor: '#fff', // mix color
  backgroundColor: '#fff',  // background color
  buttonColorDark: '#355d4c',  // button color in light mode
  buttonColorLight: '#fff', // button color in dark mode
  saveInCookies: true, // keeps the user's choice on reload
  label: '', // button icon
  autoMatchOsTheme: false // follows the OS theme
}

onMounted(() => {
  new Darkmode(options).showWidget();
});
</script>

<template>
  <main>
    <router-view></router-view>
  </main>
</template>

<style>
/* 1. LIGHT MODE: Dark button background, White Moon */
.darkmode-toggle::before {
  content: '\23FE'; /* UTF code for First Quarter Moon (Vector) */
  color: #FFFFFF;   /* Forces the moon color to WHITE */
  font-size: 1.4rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. DARK MODE: When activated, the button inverts. Shows the Black Sun */
body.darkmode--activated .darkmode-toggle::before {
  content: '\2600'; /* UTF code for Sun (Vector) */
  color: #000000;   /* Forces the sun color to BLACK */
}

/* Keeps the button isolated from the library's automatic inversions */
.darkmode-toggle {
  isolation: isolate;
}
</style>