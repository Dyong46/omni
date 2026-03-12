<script setup lang="ts">
import type { Product as SelectedProduct } from "~/types/product";
import { useDebounceFn } from "@vueuse/core";
import productService, { type Product as SearchProduct } from "~/services/product.service";
import type { TableColumn } from "@nuxt/ui";
import { formatCurrency } from "~/utils/formatters";

type OrderSelectedProduct = SelectedProduct & {
	selectedVariant?: string;
	availableQuantity?: number;
};

const props = defineProps<{
	selectedProducts: OrderSelectedProduct[];
}>();

const rowSelection = ref<Record<string, boolean>>({});

const selectedIds = computed<number[]>(() => {
	return Object.entries(rowSelection.value)
		.filter(([, isSelected]) => isSelected)
		.map(([rowId]) => Number(rowId))
		.filter(rowId => Number.isFinite(rowId));
});

const emit = defineEmits<{
	"update:selectedProducts": [value: typeof props.selectedProducts];
}>();

const toast = useToast();
const productSearchQuery = ref("");
const showProductModal = ref(false);
const searchedProducts = ref<SearchProduct[]>([]);

const status = ref<"idle" | "pending" | "success" | "error">("idle");

const UCheckbox = resolveComponent("UCheckbox");
const UButton = resolveComponent("UButton");

const columns: TableColumn<SearchProduct>[] = [
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
	},
	{
		accessorKey: "quantity",
		header: "In Stock",
		cell: ({ row }) => row.original.quantity
	}
];

async function searchProducts() {
	rowSelection.value = {};

	try {
		status.value = "pending";
		const query = productSearchQuery.value.trim();
		const response = query
			? await productService.search(query)
			: await productService.getAll();

		searchedProducts.value = response;
		status.value = "success";
	} catch (error) {
		status.value = "error";
		console.error("Error searching products:", error);
		toast.add({ title: "Error", description: "Failed to search products", color: "error" });
	}
}

async function openProductModal() {
	showProductModal.value = true;

	if (!productSearchQuery.value.trim() && searchedProducts.value.length === 0) {
		await searchProducts();
	}
}

function confirmProductSelection() {
	const outOfStockProducts = searchedProducts.value.filter(
		(product) => selectedIds.value.includes(product.id) && product.quantity <= 0,
	);
	const newProducts = searchedProducts.value
		.filter(product => selectedIds.value.includes(product.id))
		.filter(product => product.quantity > 0)
		.filter(p => !props.selectedProducts.some(sp => sp.id === p.id))
		.map(product => ({
			id: product.id,
			name: product.name,
			price: product.price,
			quantity: 1,
			availableQuantity: product.quantity,
			image: product.image,
			categoryId: product.categoryId,
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
			category: product.category
		}));

	if (outOfStockProducts.length > 0) {
		toast.add({
			title: "Out of stock",
			description: `${outOfStockProducts.length} selected product(s) were skipped because they have no stock.`,
			color: "warning"
		});
	}
	
	emit("update:selectedProducts", [...props.selectedProducts, ...newProducts]);
	showProductModal.value = false;
	rowSelection.value = {};
	productSearchQuery.value = "";
	searchedProducts.value = [];
	status.value = "idle";
}

function updateQuantity(productId: number, change: number) {
	const products = [...props.selectedProducts];
	const product = products.find(p => p.id === productId);

	if (product) {
		const nextQuantity = product.quantity + change;
		const maxQuantity = product.availableQuantity ?? Number.MAX_SAFE_INTEGER;

		if (change > 0 && nextQuantity > maxQuantity) {
			toast.add({
				title: "Stock limit reached",
				description: `Only ${maxQuantity} item(s) are available for ${product.name}.`,
				color: "warning"
			});
			return;
		}

		product.quantity = Math.max(1, nextQuantity);
		emit("update:selectedProducts", products);
	}
}

function removeProduct(productId: number) {
	const products = props.selectedProducts.filter(p => p.id !== productId);

	emit("update:selectedProducts", products);
}

const debouncedSearchProducts = useDebounceFn(() => {
	searchProducts();
}, 300);

watch(productSearchQuery, () => {
	if (!showProductModal.value) {
		return;
	}

	debouncedSearchProducts();
});

</script>

<template>
	<UCard>
		<template #header>
			<h3 class="font-semibold">Products</h3>
		</template>
		
		<div class="space-y-4">
			<!-- Search Input -->
			<div class="flex gap-2">
				<UButton
					label="Search"
					variant="outline"
					@click="openProductModal"
				/>
			</div>
			
			<!-- Selected Products Display -->
			<div v-if="selectedProducts.length > 0" class="space-y-3">
				<div
					v-for="product in selectedProducts"
					:key="product.id"
					class="flex items-center gap-3 py-3"
				>
					<!-- Product Image -->
					<img
						:src="product.image || 'https://via.placeholder.com/60'"
						:alt="product.name"
						class="w-14 h-14 object-cover rounded"
					>
					
					<!-- Product Info -->
					<div class="flex-1 min-w-0">
						<div class="font-medium text-gray-500 truncate">{{ product.name }}</div>
						<div class="text-sm text-gray-50">{{ product.price.toLocaleString('vi-VN') }} ₫</div>
						<div class="text-xs text-gray-400">In stock: {{ product.availableQuantity ?? '-' }}</div>
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
							:disabled="typeof product.availableQuantity === 'number' && product.quantity >= product.availableQuantity"
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
				/>
				
				<div class="max-h-96 overflow-y-auto">
					<UTable
						v-model:row-selection="rowSelection"
						class="shrink-0"
						:columns="columns"
						:data="searchedProducts"
						:get-row-id="(row) => String(row.id)"
						:ui="{
							base: 'table-fixed border-separate border-spacing-0',
							thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
							tbody: '[&>tr]:last:[&>td]:border-b-0',
							th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
							td: 'border-b border-default',
							separator: 'h-0'
						}"
						:loading="status === 'pending'"
					/>
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
					:disabled="selectedIds.length === 0"
					@click="confirmProductSelection"
				/>
			</div>
		</template>
	</UModal>
</template>
