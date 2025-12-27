<script setup lang="ts">
import type { Product } from "~/types";

const props = withDefaults(defineProps<{
	count?: number
	product?: Product | null
}>(), {
	count: 0
});

const open = ref(false);
const isLoading = ref(false);

const toast = useToast();

const emit = defineEmits<{
	success: []
}>();

async function onSubmit() {
	if (!props.product) return;

	isLoading.value = true;
	try {
		await $fetch(`/api/products/${props.product.id}`, {
			method: "DELETE"
		});

		toast.add({
			title: "Success",
			description: `Product "${props.product.name}" has been deleted`,
			color: "success"
		});

		open.value = false;
		emit("success");
	} catch (error) {
		toast.add({
			title: "Error",
			description: "Failed to delete product",
			color: "error"
		});
	} finally {
		isLoading.value = false;
	}
}

defineExpose({ open });
</script>

<template>
	<UModal
		v-model:open="open"
		:title="product ? `Delete ${product.name}` : `Delete ${count} product${count > 1 ? 's' : ''}`"
		:description="product ? 'Are you sure you want to delete this product? This action cannot be undone.' : 'Are you sure you want to delete these products? This action cannot be undone.'"
	>
		<slot />

		<template #body>
			<div class="flex justify-end gap-2">
				<UButton
					label="Cancel"
					color="neutral"
					variant="subtle"
					@click="open = false"
				/>
				<UButton
					label="Delete"
					color="error"
					variant="solid"
					:loading="isLoading"
					@click="onSubmit"
				/>
			</div>
		</template>
	</UModal>
</template>
