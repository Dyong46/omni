<script setup lang="ts">
import type { Product } from "~/types";

const props = withDefaults(defineProps<{
	count?: number
	product?: Product | null
	selectedIds?: number[]
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
	isLoading.value = true;

	try {
		if (props.selectedIds && props.selectedIds.length) {
			const ids = props.selectedIds;
			await Promise.all(
				ids.map((id) =>
					$fetch(`/api/products/${id}`, {
						method: "DELETE"
					})
				)
			);

			toast.add({
				title: "Success",
				description: `${ids.length} product${ids.length > 1 ? 's' : ''} have been deleted`,
				color: "success"
			});
		} else if (props.product) {
			await $fetch(`/api/products/${props.product.id}`, {
				method: "DELETE"
			});

			toast.add({
				title: "Success",
				description: `Product "${props.product.name}" has been deleted`,
				color: "success"
			});
		} else {
			toast.add({
				title: "Info",
				description: "No product selected",
				color: "info"
			});
		}

		open.value = false;
		emit("success");
	} catch (error) {
		toast.add({
			title: "Error",
			description: "Failed to delete product(s)",
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
