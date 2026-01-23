<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Product } from "~/types";
import productService from "~/services/product.service";
import categoryService, { type Category } from "~/services/category.service";

const props = defineProps<{
	product: Product | null
}>();

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
	quantity: undefined,
	image: undefined,
	categoryId: undefined
});

// Fetch categories
const categories = ref<Category[]>([]);

onMounted(async () => {
	try {
		categories.value = await categoryService.getAll();
	} catch (error) {
		console.error('Failed to load categories:', error);
	}
});

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

// Watch for product changes and update state
watch(() => props.product, (newProduct) => {
	if (newProduct && open.value) {
		state.name = newProduct.name;
		state.price = newProduct.price;
		state.quantity = newProduct.quantity;
		state.image = newProduct.image;
		state.categoryId = newProduct.categoryId;
	}
}, { immediate: true });

watch(() => open.value, (isOpen) => {
	if (isOpen && props.product) {
		state.name = props.product.name;
		state.price = props.product.price;
		state.quantity = props.product.quantity;
		state.image = props.product.image;
		state.categoryId = props.product.categoryId;
	}
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
	if (!props.product) return;

	isLoading.value = true;
	try {
		await productService.update(props.product.id, {
			name: event.data.name,
			price: event.data.price,
			stock: event.data.quantity,
			imageUrl: event.data.image,
			categoryId: event.data.categoryId
		});

		toast.add({
			title: "Success",
			description: `Product "${event.data.name}" has been updated`,
			color: "success"
		});

		open.value = false;
		emit("success");
	} catch (error: any) {
		toast.add({
			title: "Error",
			description: error.message || "Failed to update product",
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
		:title="`Edit product`"
		description="Update product information"
	>
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
						label="Update"
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
