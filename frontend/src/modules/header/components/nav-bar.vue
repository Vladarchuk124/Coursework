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
	background: linear-gradient(45deg, rgb(128, 128, 128), rgb(182, 182, 182));
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 2px 80px rgba(0, 0, 0, 0.4);
	align-items: center;
	padding: 0.5rem;
	gap: 4rem;

	.router-item {
		color: var(--text-color);
		text-decoration: none;
	}
}
</style>
