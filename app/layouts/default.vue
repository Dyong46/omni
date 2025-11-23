<script setup lang="ts">
import Header from "~/components/layouts/Header.vue";

</script>

<template>
	<div class="bg-white min-h-screen flex flex-col">
		<Header />
		
		<UMain class="flex-1">
			<slot />
		</UMain>
		
		<UFooter />
	</div>
</template>