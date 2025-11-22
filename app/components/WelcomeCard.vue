<template>
	<div class="welcome-card p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
		<h2 class="text-2xl font-bold mb-4">
			Chào mừng đến với {{ appName }}
		</h2>
		<p class="text-gray-600 dark:text-gray-300 mb-4">
			{{ description }}
		</p>
		<slot />
	</div>
</template>

<script setup lang="ts">
interface Props {
	appName?: string;
	description?: string;
}

withDefaults(defineProps<Props>(), {
	appName: "OmniSale",
	description: "Hệ thống quản lý bán hàng đa kênh"
});

</script>

<style scoped>
.welcome-card {
	transition: all 0.3s ease;
}

.welcome-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>
