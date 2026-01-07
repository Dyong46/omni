<script setup lang="ts">
import type { Product } from "~/types/product";

const props = defineProps<{
	selectedProducts: Array<Product & { quantity: number; selectedVariant?: string }>;
}>();

const emit = defineEmits<{
	(e: "update:selectedProducts", value: typeof props.selectedProducts): void;
}>();

const toast = useToast();
const productSearchQuery = ref("");
const showProductModal = ref(false);
const searchedProducts = ref<Product[]>([]);
const selectedProductIds = ref<number[]>([]);

const UCheckbox = resolveComponent("UCheckbox");

const columns = [
	{
		key: "select",
		label: "",
		class: "w-12",
	},
	{
		key: "product",
		label: "Product",
	},
	{
		key: "sku",
		label: "SKU",
	},
	{
		key: "price",
		label: "Price",
		class: "text-right",
	},
	{
		key: "stock",
		label: "Stock",
		class: "text-right",
	},
];

// Product search
async function searchProducts() {
	if (!productSearchQuery.value.trim()) {
		searchedProducts.value = [];
		return;
	}
	
	try {
		const response = await $fetch<any>(`/api/products?q=${productSearchQuery.value}`);

		searchedProducts.value = response.data || response || [];
	} catch (error) {
		console.error("Error searching products:", error);
		toast.add({ title: "Error", description: "Failed to search products", color: "error" });
	}
}

function openProductModal() {
	showProductModal.value = true;
	// searchProducts();
}

function toggleProductSelection(product: Product) {
	const index = selectedProductIds.value.indexOf(product.id);

	if (index > -1) {
		selectedProductIds.value.splice(index, 1);
	} else {
		selectedProductIds.value.push(product.id);
	}
}

function confirmProductSelection() {
	const newProducts = searchedProducts.value
		.filter(p => selectedProductIds.value.includes(p.id))
		.filter(p => !props.selectedProducts.some(sp => sp.id === p.id))
		.map(p => ({ ...p, quantity: 1 }));
	
	emit("update:selectedProducts", [...props.selectedProducts, ...newProducts]);
	showProductModal.value = false;
	selectedProductIds.value = [];
	productSearchQuery.value = "";
	searchedProducts.value = [];
}

function updateQuantity(productId: number, change: number) {
	const products = [...props.selectedProducts];
	const product = products.find(p => p.id === productId);

	if (product) {
		product.quantity = Math.max(1, product.quantity + change);
		emit("update:selectedProducts", products);
	}
}

function removeProduct(productId: number) {
	const products = props.selectedProducts.filter(p => p.id !== productId);

	emit("update:selectedProducts", products);
}
</script>

<template>
	<UCard>
		<template #header>
			<h3 class="font-semibold">Products</h3>
		</template>
		
		<div class="space-y-4">
			<!-- Search Input -->
			<div class="flex gap-2">
				<UInput
					v-model="productSearchQuery"
					placeholder="Search products"
					icon="i-lucide-search"
					size="lg"
					readonly
					class="cursor-pointer flex-1"
					@click="openProductModal"
				/>
				<UButton
					label="Search"
					variant="outline"
					@click="openProductModal"
				/>
			</div>
		</div>
	</UCard>
	
	<UModal :model="showProductModal" title="Select Products">
		<template #body>
			<UCard class="w-full max-w-4xl">
				<div class="space-y-4">
					<UInput
						v-model="productSearchQuery"
						placeholder="Search products"
						icon="i-lucide-search"
						size="lg"
						@input="searchProducts"
					/>
					
					<div class="max-h-96 overflow-y-auto">
						<UTable
							:columns="columns"
							:rows="searchedProducts"
							:empty-state="{ icon: 'i-lucide-package', label: 'No products found' }"
						>
							<template #select-data="{ row }">
								<UCheckbox
									:model-value="selectedProductIds.includes(row.id)"
									@change="toggleProductSelection(row)"
								/>
							</template>
							
							<template #product-data="{ row }">
								<div class="flex items-center gap-3">
									<img
										:src="row.image || 'https://via.placeholder.com/40'"
										:alt="row.name"
										class="w-10 h-10 object-cover rounded"
									>
									<span class="font-medium">{{ row.name }}</span>
								</div>
							</template>
							
							<template #sku-data="{ row }">
								<span class="text-sm text-gray-600">{{ row.id }}</span>
							</template>
							
							<template #price-data="{ row }">
								<span>{{ row.price.toLocaleString('vi-VN') }} ₫</span>
							</template>
							
							<template #stock-data="{ row }">
								<span>{{ row.quantity || 0 }}</span>
							</template>
						</UTable>
					</div>
				</div>
				
				<template #footer>
					<div class="flex justify-end gap-3">
						<UButton
							label="Cancel"
							variant="outline"
							@click="showProductModal = false"
						/>
						<UButton
							label="Confirm Selection"
							color="primary"
							:disabled="selectedProductIds.length === 0"
							@click="confirmProductSelection"
						/>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>
</template>
