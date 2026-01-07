<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/table-core";
import type { Row } from "@tanstack/table-core";
import type { Product } from "~/types";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UInput = resolveComponent("UInput");
const UTable = resolveComponent("UTable");
const UTooltip = resolveComponent("UTooltip");
const UDashboardPanel = resolveComponent("UDashboardPanel");
const UDashboardNavbar = resolveComponent("UDashboardNavbar");
const UDashboardSidebarCollapse = resolveComponent("UDashboardSidebarCollapse");

const toast = useToast();
const table = useTemplateRef("table");

const searchQuery = ref("");
const editingId = ref<number | null>(null);
const editingValue = ref<number | null>(null);

// Fetch inventories
const { data, status, refresh } = await useFetch<Product[]>("/api/products/inventories", {
	lazy: true,
	watch: [searchQuery],
	query: computed(() => ({ q: searchQuery.value || undefined })),
});

function formatPrice(price: number) {
	return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

async function updateQuantity(id: number, quantity: number) {
	try {
		// Use existing product update API (client proxy at /api/products/[id].ts)
		await $fetch(`/api/products/${id}`, { method: 'PUT', body: { quantity } });
		toast.add({ title: 'Inventory updated', description: 'Quantity updated successfully' });
		refresh();
		editingId.value = null;
	} catch (err: any) {
		toast.add({ title: 'Error', description: err?.message || 'Failed to update inventory', color: 'error' });
	}
}

const columns: TableColumn<Product>[] = [
	{ accessorKey: 'id', header: 'ID' },
	{
		accessorKey: 'name',
		header: 'Product Name',
		cell: ({ row }: { row: Row<Product> }) => {
			return h('div', { class: 'flex items-center gap-3' }, [
				row.original.image
					? h('img', { src: row.original.image, alt: row.original.name, class: 'w-10 h-10 object-cover rounded' })
					: h('div', { class: 'w-10 h-10 bg-gray-200 rounded flex items-center justify-center' }, [h('span', { class: 'text-gray-500 text-xs' }, 'No img')]),
				h('div', undefined, [h('p', { class: 'font-medium text-highlighted' }, row.original.name), row.original.category ? h('p', { class: 'text-sm text-muted' }, row.original.category.name) : null])
			]);
		}
	},
	{
		accessorKey: 'price',
		header: 'Price',
		cell: ({ row }: { row: Row<Product> }) => formatPrice(row.original.price)
	},
	{
		accessorKey: 'quantity',
		header: 'Quantity',
		cell: ({ row }: { row: Row<Product> }) => {
			const qty = row.original.quantity;

			if (editingId.value === row.original.id) {
				return h('div', { class: 'flex items-center gap-2' }, [
					h(UInput, {
						modelValue: editingValue.value,
						'onUpdate:modelValue': (v: number) => (editingValue.value = v),
						type: 'number',
						class: 'w-24'
					}),
					h(UButton, { label: 'Save', color: 'primary', onClick: () => updateQuantity(row.original.id, editingValue.value ?? qty) }),
					h(UButton, { label: 'Cancel', variant: 'ghost', onClick: () => { editingId.value = null; editingValue.value = null; } })
				]);
			}

			const color = qty === 0 ? 'error' : qty < 10 ? 'warning' : 'success';

			return h('div', { class: 'flex items-center gap-2 justify-end' }, [
				h(UBadge, { color, variant: 'subtle', class: 'capitalize' }, () => (qty === 0 ? 'Out of stock' : qty < 10 ? 'Low stock' : 'In stock')),
				h('span', { class: 'text-sm text-muted' }, `(${qty})`),
				h(UButton, { icon: 'i-lucide-edit-2', variant: 'ghost', color: 'neutral', onClick: () => { editingId.value = row.original.id; editingValue.value = row.original.quantity; } })
			]);
		}
	}
];

const pagination = ref({ pageIndex: 0, pageSize: 10 });

// Trigger initial load
onMounted(() => refresh());
</script>

<template>
	<UDashboardPanel id="products-inventories">
		<template #header>
			<UDashboardNavbar title="Inventories" :ui="{ right: 'gap-3' }">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right>
					<UTooltip text="Notifications" :shortcuts="['N']">
						<UButton color="neutral" variant="ghost" square>
							<UChip color="error" inset>
								<UIcon name="i-lucide-bell" class="size-5 shrink-0" />
							</UChip>
						</UButton>
					</UTooltip>
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<div class="flex flex-wrap items-center justify-between gap-1.5 mb-3">
				<UInput v-model="searchQuery" class="max-w-sm" icon="i-lucide-search" placeholder="Search products..." />
			</div>

			<UTable
				ref="table"
				:data="data"
				:columns="columns"
				:loading="status === 'pending'"
				v-model:pagination="pagination"
				:pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
				:ui="{
					base: 'table-fixed border-separate border-spacing-0',
					thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
					tbody: '[&>tr]:last:[&>td]:border-b-0',
					th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
					td: 'border-b border-default',
					separator: 'h-0'
				}"
			/>
		</template>
	</UDashboardPanel>
</template>
