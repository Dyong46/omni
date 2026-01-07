<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Category } from "~/types";

const schema = z.object({
	name: z.string().min(2, "Product name is too short"),
	price: z.number().min(0, "Price must be positive"),
	quantity: z.number().min(0, "Quantity must be positive"),
	image: z.string().optional(),
	categoryId: z.number().optional()
});

const open = ref(false);
const isLoading = ref(false);

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
	name: undefined,
	price: undefined,
	quantity: 0,
	image: undefined,
	categoryId: undefined
});

// Fetch categories
const { data: categories } = await useFetch<Category[]>("/api/categories");

const categoryItems = computed(() => {
	if (!categories.value) return [];
	return categories.value.map(cat => ({
		label: cat.name,
		value: cat.id
	}));
});

const toast = useToast();

const emit = defineEmits<{
	success: []
}>();

async function onSubmit(event: FormSubmitEvent<Schema>) {
	isLoading.value = true;
	try {
		const response = await $fetch("/api/products", {
			method: "POST",
			body: event.data
		});

		toast.add({
			title: "Success",
			description: `Product "${event.data.name}" has been added`,
			color: "success"
		});

		// Reset form
		state.name = undefined;
		state.price = undefined;
		state.quantity = 0;
		state.image = undefined;
		state.categoryId = undefined;

		open.value = false;
		emit("success");
	} catch (error) {
		toast.add({
			title: "Error",
			description: "Failed to add product",
			color: "error"
		});
	} finally {
		isLoading.value = false;
	}
}
</script>

<template>
	<UModal v-model:open="open" title="New product" description="Add a new product to your inventory">
		<UButton label="New product" icon="i-lucide-plus" />

		<template #body>
			<UForm
				:schema="schema"
				:state="state"
				class="space-y-4"
				@submit="onSubmit"
			>
				<UFormField label="Product Name" placeholder="iPhone 15 Pro" name="name" required>
					<UInput v-model="state.name" class="w-full" />
				</UFormField>

				<UFormField label="Price (VND)" placeholder="30000000" name="price" required>
					<UInput v-model.number="state.price" type="number" class="w-full" />
				</UFormField>

				<UFormField label="Quantity" placeholder="10" name="quantity" required>
					<UInput v-model.number="state.quantity" type="number" class="w-full" />
				</UFormField>

				<UFormField label="Image URL" placeholder="product.jpg" name="image">
					<UInput v-model="state.image" class="w-full" />
				</UFormField>

				<UFormField label="Category" name="categoryId">
					<USelect
						v-model="state.categoryId"
						:items="categoryItems"
						placeholder="Select a category"
						class="w-full"
					/>
				</UFormField>

				<div class="flex justify-end gap-2">
					<UButton
						label="Cancel"
						color="neutral"
						variant="subtle"
						@click="open = false"
					/>
					<UButton
						label="Create"
						color="primary"
						variant="solid"
						type="submit"
						:loading="isLoading"
					/>
				</div>
			</UForm>
		</template>
	</UModal>
</template>
