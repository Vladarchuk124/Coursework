<script setup>
import SearchBar from './components/search-bar.vue';
import User from './components/user-logo.vue';
import NavBar from './components/nav-bar.vue';
import { actions } from './store/actions';
</script>

<template>
	<header>
		<router-link to="/popular-movies" class="header-logo"><h1>MOVIERACK</h1></router-link>
		<SearchBar :do-search="actions.doSearch" />
		<User />
	</header>
</template>

<style lang="scss" scoped>
header {
	display: flex;
	position: relative;
	padding: 0.5rem 2rem;
	justify-content: space-between;
	align-items: center;
	z-index: 1000;
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 2px 80px rgba(0, 0, 0, 0.4);

	.header-logo {
		width: 30%;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		text-decoration: none;
		color: white;
	}
}
</style>
