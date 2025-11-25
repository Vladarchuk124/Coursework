<script setup>
import Header from './modules/header/index.vue';
import ErrorToast from './components/error-toast.vue';
</script>

<template>
	<Header />
	<router-view />
	<ErrorToast />
</template>

<style lang="scss">
@use './assets/scss/shared';
</style>
