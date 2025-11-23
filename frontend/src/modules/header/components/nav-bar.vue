<template>
	<div class="nav-bar">
		<router-link class="router-item">Movies</router-link>
		<router-link class="router-item">TV-Shows</router-link>
		<router-link class="router-item">TOP</router-link>
		<router-link class="router-item">fawf</router-link>
		<router-link class="router-item">fwafwf</router-link>
	</div>
</template>

<style lang="scss" scoped>
.nav-bar {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	padding: 0.5rem;
	gap: 4rem;

	.router-item {
		color: var(--text-color);
		text-decoration: none;
	}
}
</style>
