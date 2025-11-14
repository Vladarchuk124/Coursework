<script setup>
// todo : update header
</script>

<template>
	<header>
		<nav>
			<router-link to="/welcome" class="nav-link">Main page</router-link>
			<router-link to="/user-profile" class="nav-link">Профіль користувача</router-link>
		</nav>
	</header>
</template>

<style lang="scss" scoped>
header {
	padding: 1rem 2rem;
	border-radius: 15px;
	background-color: #6c757d;

	nav {
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.nav-link {
		color: white;
		text-decoration: none;
		font-size: 1.1rem;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		transition: background-color 0.3s ease;

		&:hover {
			background-color: rgba(255, 255, 255, 0.1);
		}

		&.router-link-active {
			background-color: rgba(255, 255, 255, 0.2);
			font-weight: bold;
		}
	}
}
</style>
