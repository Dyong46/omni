<script setup lang="ts">
import type { Customer } from "~/types";

const props = withDefaults(defineProps<{
	count?: number
	customer?: Customer | null
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
					$fetch(`/api/customers/${id}`, {
						method: "DELETE"
					})
				)
			);

			toast.add({
				title: "Success",
				description: `${ids.length} customer${ids.length > 1 ? 's' : ''} have been deleted`,
				color: "success"
			});
		} else if (props.customer) {
			await $fetch(`/api/customers/${props.customer.id}`, {
				method: "DELETE"
			});

			toast.add({
				title: "Success",
				description: `Customer "${props.customer.name || props.customer.phone}" has been deleted`,
				color: "success"
			});
		} else {
			toast.add({
				title: "Info",
				description: "No customer selected",
				color: "info"
			});
		}

		open.value = false;
		emit("success");
	} catch (error) {
		toast.add({
			title: "Error",
			description: "Failed to delete customer(s)",
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
		:title="customer ? `Delete ${customer.name || customer.phone}` : `Delete ${count} customer${count > 1 ? 's' : ''}`"
		:description="customer ? 'Are you sure you want to delete this customer? This action cannot be undone.' : 'Are you sure you want to delete these customers? This action cannot be undone.'"
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
