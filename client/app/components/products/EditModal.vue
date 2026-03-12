<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Product } from "~/types";
import productService from "~/services/product.service";
import categoryService, { type Category } from "~/services/category.service";
import mediaService from "~/services/media.service";

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
const isUploading = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
	fileInputRef.value?.click();
}

function removeImage() {
	state.image = undefined;
}

async function handleFileChange(event: Event) {
	const file = (event.target as HTMLInputElement).files?.[0];

	if (!file) return;
	isUploading.value = true;
	try {
		const result = await mediaService.uploadImage(file);

		state.image = result.url;
	} catch {
		toast.add({ title: "Upload failed", description: "Could not upload image", color: "error" });
	} finally {
		isUploading.value = false;
		if (fileInputRef.value) fileInputRef.value.value = "";
	}
}

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
			image: event.data.image,
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

				<div class="space-y-1.5">
					<label for="edit-product-image" class="text-sm font-medium">Product Image</label>
					<div v-if="state.image" class="flex items-start gap-3">
						<img :src="state.image" alt="Preview" class="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
						<div class="flex flex-col gap-2 pt-1">
							<UButton size="xs" variant="outline" icon="i-lucide-image" :loading="isUploading" @click="triggerFileInput">Change</UButton>
							<UButton size="xs" variant="outline" color="error" icon="i-lucide-trash-2" @click="removeImage">Remove</UButton>
						</div>
					</div>
					<div
						v-else
						class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors"
						:class="isUploading ? 'border-primary/50 bg-primary/5' : 'border-gray-300 dark:border-gray-600 hover:border-primary'"
						@click="triggerFileInput"
					>
						<div v-if="isUploading" class="flex flex-col items-center gap-2">
							<UIcon name="i-lucide-loader-circle" class="text-2xl text-primary animate-spin" />
							<p class="text-sm text-muted">Uploading...</p>
						</div>
						<div v-else class="flex flex-col items-center gap-2">
							<UIcon name="i-lucide-image-plus" class="text-3xl text-muted" />
							<p class="text-sm font-medium">Click to upload image</p>
							<p class="text-xs text-muted">JPG, PNG, WebP, GIF · max 5 MB</p>
						</div>
					</div>
					<input
						id="edit-product-image"
						ref="fileInputRef"
						type="file"
						class="hidden"
						accept="image/jpeg,image/png,image/webp,image/gif"
						@change="handleFileChange"
					/>
				</div>

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
