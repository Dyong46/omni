<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { upperFirst } from "scule";
import { getPaginationRowModel } from "@tanstack/table-core";
import type { Row } from "@tanstack/table-core";
import type { Product, Category } from "~/types";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UCheckbox = resolveComponent("UCheckbox");

const toast = useToast();
const table = useTemplateRef("table");

const columnFilters = ref([{
	id: "name",
	value: ""
}]);
const columnVisibility = ref();
const rowSelection = ref({});

const searchQuery = ref("");
const selectedProduct = ref<Product | null>(null);
const editModalRef = ref();
const deleteModalRef = ref();

const selectedIds = computed(() => {
	const rows = table?.value?.tableApi?.getFilteredSelectedRowModel()?.rows;
	return rows ? rows.map((r: any) => r.original.id) : [];
});

// Fetch products data
const { data, status, refresh } = await useFetch<Product[]>("/api/products", {
	lazy: true,
	watch: [searchQuery],
	query: computed(() => ({
		q: searchQuery.value || undefined
	}))
});

// Fetch categories for filtering
const { data: categories } = await useFetch<Category[]>("/api/categories");

function formatPrice(price: number) {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND"
	}).format(price);
}

function getStockBadgeColor(quantity: number) {
	if (quantity === 0) return "error";
	if (quantity < 10) return "warning";
	return "success";
}

function getStockStatus(quantity: number) {
	if (quantity === 0) return "Out of stock";
	if (quantity < 10) return "Low stock";
	return "In stock";
}

function getRowItems(row: Row<Product>) {
	return [
		{
			type: "label",
			label: "Actions"
		},
		{
			label: "View details",
			icon: "i-lucide-eye",
			onSelect() {
				toast.add({
					title: "Product details",
					description: `Viewing ${row.original.name}`
				});
			}
		},
		{
			label: "Edit product",
			icon: "i-lucide-pencil",
			onSelect() {
				selectedProduct.value = row.original;
				nextTick(() => {
					if (editModalRef.value) {
						editModalRef.value.open = true;
					}
				});
			}
		},
		{
			type: "separator"
		},
		{
			label: "Delete product",
			icon: "i-lucide-trash",
			color: "error",
			onSelect() {
				selectedProduct.value = row.original;
				nextTick(() => {
					if (deleteModalRef.value) {
						deleteModalRef.value.open = true;
					}
				});
			}
		}
	];
}

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
		cell: ({ row }) => formatPrice(row.original.price)
	},
	{
		accessorKey: "quantity",
		header: ({ column }) => {
			const isSorted = column.getIsSorted();

			return h(UButton, {
				color: "neutral",
				variant: "ghost",
				label: "Stock",
				icon: isSorted
					? isSorted === "asc"
						? "i-lucide-arrow-up-narrow-wide"
						: "i-lucide-arrow-down-wide-narrow"
					: "i-lucide-arrow-up-down",
				class: "-mx-2.5",
				onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
			});
		},
		cell: ({ row }) => {
			const color = getStockBadgeColor(row.original.quantity);

			return h("div", { class: "flex items-center gap-2" }, [
				h(UBadge, { class: "capitalize", variant: "subtle", color }, () =>
					getStockStatus(row.original.quantity)
				),
				h("span", { class: "text-sm text-muted" }, `(${row.original.quantity})`)
			]);
		}
	},
	{
		accessorKey: "category.name",
		header: "Category",
		cell: ({ row }) => row.original.category?.name || "—"
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return h(
				"div",
				{ class: "text-right" },
				h(
					UDropdownMenu,
					{
						content: {
							align: "end"
						},
						items: getRowItems(row)
					},
					() =>
						h(UButton, {
							icon: "i-lucide-ellipsis-vertical",
							color: "neutral",
							variant: "ghost",
							class: "ml-auto"
						})
				)
			);
		}
	}
];

const categoryFilter = ref("all");

watch(() => categoryFilter.value, (newVal) => {
	if (!table?.value?.tableApi) return;

	const categoryColumn = table.value.tableApi.getColumn("category.name");

	if (!categoryColumn) return;

	if (newVal === "all") {
		categoryColumn.setFilterValue(undefined);
	} else {
		categoryColumn.setFilterValue(newVal);
	}
});

const pagination = ref({
	pageIndex: 0,
	pageSize: 10
});

const categoryItems = computed(() => {
	if (!categories.value) return [{ label: "All", value: "all" }];
	return [
		{ label: "All", value: "all" },
		...categories.value.map(cat => ({
			label: cat.name,
			value: cat.name
		}))
	];
});

function handleSuccess() {
	refresh();
	selectedProduct.value = null;
	rowSelection.value = {};
}
</script>

<template>
	<UDashboardPanel id="products">
		<template #header>
			<UDashboardNavbar title="Products">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right>
					<ProductsAddModal @success="handleSuccess" />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<div class="flex flex-wrap items-center justify-between gap-1.5">
				<UInput
					v-model="searchQuery"
					class="max-w-sm"
					icon="i-lucide-search"
					placeholder="Search products..."
				/>

				<div class="flex flex-wrap items-center gap-1.5">
					<ProductsDeleteModal
						ref="deleteModalRef"
						:count="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
						:product="selectedProduct"
						:selected-ids="selectedIds"
						@success="handleSuccess"
					>
						<UButton
							v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
							label="Delete"
							color="error"
							variant="subtle"
							icon="i-lucide-trash"
						>
							<template #trailing>
								<UKbd>
									{{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
								</UKbd>
							</template>
						</UButton>
					</ProductsDeleteModal>

					<USelect
						v-model="categoryFilter"
						:items="categoryItems"
						:ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
						placeholder="Filter category"
						class="min-w-32"
					/>

					<UDropdownMenu
						:items="
							table?.tableApi
								?.getAllColumns()
								.filter((column: any) => column.getCanHide())
								.map((column: any) => ({
									label: upperFirst(column.id),
									type: 'checkbox' as const,
									checked: column.getIsVisible(),
									onUpdateChecked(checked: boolean) {
										table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
									},
									onSelect(e?: Event) {
										e?.preventDefault()
									}
								}))
						"
						:content="{ align: 'end' }"
					>
						<UButton
							label="Display"
							color="neutral"
							variant="outline"
							trailing-icon="i-lucide-settings-2"
						/>
					</UDropdownMenu>
				</div>
			</div>

			<UTable
				ref="table"
				v-model:column-filters="columnFilters"
				v-model:column-visibility="columnVisibility"
				v-model:row-selection="rowSelection"
				v-model:pagination="pagination"
				:pagination-options="{
					getPaginationRowModel: getPaginationRowModel()
				}"
				class="shrink-0"
				:data="data"
				:columns="columns"
				:loading="status === 'pending'"
				:ui="{
					base: 'table-fixed border-separate border-spacing-0',
					thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
					tbody: '[&>tr]:last:[&>td]:border-b-0',
					th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
					td: 'border-b border-default',
					separator: 'h-0'
				}"
			/>

			<div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
				<div class="text-sm text-muted">
					{{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
					{{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
				</div>

				<div class="flex items-center gap-1.5">
					<UPagination
						:default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
						:items-per-page="table?.tableApi?.getState().pagination.pageSize"
						:total="table?.tableApi?.getFilteredRowModel().rows.length"
						@update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
					/>
				</div>
			</div>

			<!-- Edit Modal -->
			<ProductsEditModal
				ref="editModalRef"
				:product="selectedProduct"
				@success="handleSuccess"
			/>
		</template>
	</UDashboardPanel>
</template>
