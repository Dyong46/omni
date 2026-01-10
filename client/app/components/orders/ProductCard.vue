<script setup lang="ts">
import type { Product } from "~/types/product";

const props = defineProps<{
	selectedProducts: Array<Product & { quantity: number; selectedVariant?: string }>;
}>();

const emit = defineEmits<{
	"update:selectedProducts": [value: typeof props.selectedProducts];
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
		id: "select",
		label: "",
		class: "w-12"
	},
	{
		key: "product",
		id: "product",
		label: "Product"
	},
	{
		key: "sku",
		id: "sku",
		label: "SKU"
	},
	{
		key: "price",
		id: "price",
		label: "Price",
		class: "text-right"
	},
	{
		key: "stock",
		id: "stock",
		label: "Stock",
		class: "text-right"
	}
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
			
			<!-- Selected Products Display -->
			<div v-if="selectedProducts.length > 0" class="space-y-3">
				<div class="text-sm font-medium text-gray-700">Selected Products ({{ selectedProducts.length }})</div>
				<div
					v-for="product in selectedProducts"
					:key="product.id"
					class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
				>
					<!-- Product Image -->
					<img
						:src="product.image || 'https://via.placeholder.com/60'"
						:alt="product.name"
						class="w-14 h-14 object-cover rounded"
					>
					
					<!-- Product Info -->
					<div class="flex-1 min-w-0">
						<div class="font-medium text-gray-900 truncate">{{ product.name }}</div>
						<div class="text-sm text-gray-600">{{ product.price.toLocaleString('vi-VN') }} ₫</div>
					</div>
					
					<!-- Quantity Controls -->
					<div class="flex items-center gap-2">
						<UButton
							icon="i-lucide-minus"
							size="xs"
							variant="outline"
							color="gray"
							@click="updateQuantity(product.id, -1)"
						/>
						<span class="w-10 text-center font-medium">{{ product.quantity }}</span>
						<UButton
							icon="i-lucide-plus"
							size="xs"
							variant="outline"
							color="gray"
							@click="updateQuantity(product.id, 1)"
						/>
					</div>
					
					<!-- Remove Button -->
					<UButton
						icon="i-lucide-x"
						size="xs"
						variant="ghost"
						color="error"
						@click="removeProduct(product.id)"
					/>
				</div>
			</div>
			
			<!-- Empty State -->
			<div v-else class="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
				<div class="text-sm">No products selected</div>
				<div class="text-xs mt-1">Click search to add products</div>
			</div>
		</div>
	</UCard>
	
	<UModal
		v-model:open="showProductModal"
		title="Select Products"
		description="Search and select products to add to the order."
	>
		<template #body>
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
		</template>
		
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
	</UModal>
</template>
