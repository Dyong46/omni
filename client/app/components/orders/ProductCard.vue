<script setup lang="ts">
import type { Product } from "~/types/product";
import { useDebounceFn } from "@vueuse/core";
import productService from "~/services/product.service";
import type { TableColumn } from "@nuxt/ui";
import { formatCurrency } from "~/utils/formatters";

const config = useRuntimeConfig();

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

const status = ref<"idle" | "pending" | "success" | "error">("idle");

const UCheckbox = resolveComponent("UCheckbox");
const UButton = resolveComponent("UButton");

const columns: TableColumn<Product>[] = [
	{
		id: "select",
		header: ({ table }) =>
			h(UCheckbox, {
				"modelValue": table.getIsSomePageRowsSelected()
					? "indeterminate"
					: table.getIsAllPageRowsSelected(),
				"onUpdate:modelValue": (value: boolean | "indeterminate") =>
					table.toggleAllPageRowsSelected(!!value),
				"ariaLabel": "Select all"
			}),
		cell: ({ row }) =>
			h(UCheckbox, {
				"modelValue": row.getIsSelected(),
				"onUpdate:modelValue": (value: boolean | "indeterminate") => row.toggleSelected(!!value),
				"ariaLabel": "Select row"
			})
	},
	{
		accessorKey: "id",
		header: "ID"
	},
	{
		accessorKey: "name",
		header: "Product Name",
		cell: ({ row }) => {
			return h("div", { class: "flex items-center gap-3" }, [
				row.original.image
					? h("img", {
						src: row.original.image,
						alt: row.original.name,
						class: "w-10 h-10 object-cover rounded"
					})
					: h("div", {
						class: "w-10 h-10 bg-gray-200 rounded flex items-center justify-center"
					}, [
						h("span", { class: "text-gray-500 text-xs" }, "No img")
					]),
				h("div", undefined, [
					h("p", { class: "font-medium text-highlighted" }, row.original.name),
					row.original.category
						? h("p", { class: "text-sm text-muted" }, row.original.category.name)
						: null
				])
			]);
		}
	},
	{
		accessorKey: "price",
		header: ({ column }) => {
			const isSorted = column.getIsSorted();

			return h(UButton, {
				color: "neutral",
				variant: "ghost",
				label: "Price",
				icon: isSorted
					? isSorted === "asc"
						? "i-lucide-arrow-up-narrow-wide"
						: "i-lucide-arrow-down-wide-narrow"
					: "i-lucide-arrow-up-down",
				class: "-mx-2.5",
				onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
			});
		},
		cell: ({ row }) => formatCurrency(row.original.price)
	}
];

async function searchProducts() {
	if (!productSearchQuery.value.trim()) {
		searchedProducts.value = [];
		return;
	}

	try {
		const response = await productService.search(productSearchQuery.value);

		searchedProducts.value = response;
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

const openWithDelay = useDebounceFn(() => {
	openProductModal();
}, 300);

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
					class="cursor-pointer flex-1"
					@click="openWithDelay"
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
						ref="table"
						class="shrink-0"

						:columns="columns"
						:data="searchedProducts"
						:ui="{
							base: 'table-fixed border-separate border-spacing-0',
							thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
							tbody: '[&>tr]:last:[&>td]:border-b-0',
							th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
							td: 'border-b border-default',
							separator: 'h-0'
						}"
						:loading="status === 'pending'"
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
