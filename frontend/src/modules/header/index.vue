<script setup>
import SearchBar from './components/search-bar.vue';
import User from './components/user-logo.vue';
import NavBar from './components/nav-bar.vue';

import { actions } from './store/actions';
</script>

<template>
	<header>
		<router-link to="/" class="header-logo"><h1>MOVIERACK</h1></router-link>
		<SearchBar :do-search="actions.doSearch" />
		<User />
	</header>
	<NavBar />
</template>

<style lang="scss" scoped>
header {
	display: flex;
	position: relative;
	padding: 0.5rem 2rem;
	justify-content: space-between;
	align-items: center;
	z-index: 1000;
	border: 1px solid var(--border-color);
	box-shadow: var(--shadow-lg);

	.header-logo {
		width: 30%;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		text-decoration: none;
		color: white;
	}
}

:root[data-theme='light'] {
	header .header-logo {
		color: var(--text-color-inverted);
	}
}
</style>
