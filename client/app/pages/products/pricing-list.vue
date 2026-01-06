<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { getPaginationRowModel } from '@tanstack/table-core';
import type { Row } from '@tanstack/table-core';
import { ref, watch, onMounted } from 'vue';
import type { Product } from '~/types';
import type { Ref } from 'vue';

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');
const UDropdownMenu = resolveComponent('UDropdownMenu');
const UCheckbox = resolveComponent('UCheckbox');

const { isNotificationsSlideoverOpen } = useDashboard();

const table = useTemplateRef('table');

const { data, refresh } = await useFetch<Product[]>('/api/products', { lazy: true });

const products = ref<Product[]>([]);
const columnFilters = ref([{ id: 'name', value: '' }]);
const columnVisibility = ref();
const rowSelection = ref({});
const pagination = ref({ pageIndex: 0, pageSize: 10 });

// Edit price modal state
const isEditModalOpen = ref(false);
const editingProduct: Ref<Product | null> = ref(null);
const editPrice = ref<number | null>(null);
const priceError = ref('');

watch(data, (v) => {
	if (v) products.value = v;
});

function formatPrice(price: number) {
	return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDate(value: string | Date | undefined | null) {
	if (!value) return '—';
	let d: Date;
	if (typeof value === 'string') {
		const s = value.trim();
		// Detect explicit timezone (Z or +HH or -HH). If absent, assume UTC by appending 'Z'
		const hasTZ = /([zZ]|[+-]\d{2}(:?\d{2})?)$/.test(s);
		d = new Date(hasTZ ? s : s + 'Z');
	} else {
		d = value;
	}

	if (Number.isNaN(d.getTime())) return String(value);

	try {
		return new Intl.DateTimeFormat('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(d as Date);
	} catch (e) {
		return d.toLocaleDateString();
	}
}

function getRowItems(row: Row<Product>) {
	return [
		{ type: 'label', label: 'Actions' },
		{
			label: 'Edit price',
			icon: 'i-lucide-pencil',
			onSelect() {
				openEditPrice(row.original);
			},
		},
	];
}

function openEditPrice(product: Product) {
	editingProduct.value = product;
	editPrice.value = product.price;
	priceError.value = '';
	isEditModalOpen.value = true;
}

async function savePrice() {
	if (!editingProduct.value) return;
	const price = Number(editPrice.value);
	if (!Number.isFinite(price) || price < 0) {
		priceError.value = 'Giá không hợp lệ';
		return;
	}
	try {
		await $fetch(`/api/products/${editingProduct.value.id}/price`, { method: 'PUT', body: { price } });
		await refresh();
		isEditModalOpen.value = false;
		editingProduct.value = null;
	} catch (e) {
		console.error(e);
		priceError.value = 'Có lỗi khi lưu giá';
	}
}

const columns: TableColumn<Product>[] = [
	{
		id: 'select',
		header: ({ table }) =>
			h(UCheckbox, {
				modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
				'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
				ariaLabel: 'Select all',
			}),
		cell: ({ row }) =>
			h(UCheckbox, {
				modelValue: row.getIsSelected(),
				'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
				ariaLabel: 'Select row',
			}),
	},
	{ accessorKey: 'id', header: 'ID' },
	{
		accessorKey: 'name',
		header: 'Product Name',
		cell: ({ row }) =>
			h('div', { class: 'flex items-center gap-3' }, [
				row.original.image
					? h('img', { src: row.original.image, alt: row.original.name, class: 'w-10 h-10 object-cover rounded' })
					: h('div', { class: 'w-10 h-10 bg-gray-200 rounded flex items-center justify-center' }, [
							h('span', { class: 'text-gray-500 text-xs' }, 'No img'),
						]),
				h('div', undefined, [h('p', { class: 'font-medium text-highlighted' }, row.original.name), row.original.category ? h('p', { class: 'text-sm text-muted' }, row.original.category.name) : null]),
			]),
	},
	{
		accessorKey: 'price',
		header: ({ column }) => {
			const isSorted = column.getIsSorted();
			return h(UButton, {
				color: 'neutral',
				variant: 'ghost',
				label: 'Price',
				icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
				class: '-mx-2.5',
				onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
			});
		},
		cell: ({ row }) => formatPrice(row.original.price),
	},
	{ accessorKey: 'updatedAt', header: 'Updated At', cell: ({ row }) => formatDate(row.original.updatedAt) },
	{ accessorKey: 'category.name', header: 'Category', cell: ({ row }) => row.original.category?.name || '—' },
	{
		id: 'actions',
		cell: ({ row }) =>
			h('div', { class: 'text-right' },
				h(
					UDropdownMenu,
					{ content: { align: 'end' }, items: getRowItems(row) },
					() => h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost', class: 'ml-auto' })
				)
			),
	},
];

onMounted(async () => {
	await refresh();
});
</script>

<template>
	<UDashboardPanel id="products-pricing-list">
		<template #header>
			<UDashboardNavbar title="Pricing List">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
				<template #right>
					<div class="flex items-center gap-2">
						<UTooltip text="Notifications" :shortcuts="['N']">
							<UButton color="neutral" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
								<UChip color="error" inset>
									<UIcon name="i-lucide-bell" class="size-5 shrink-0" />
								</UChip>
							</UButton>
						</UTooltip>
					</div>
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<UTable
				ref="table"
				v-model:column-filters="columnFilters"
				v-model:column-visibility="columnVisibility"
				v-model:row-selection="rowSelection"
				v-model:pagination="pagination"
				:pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
				:data="products"
				:columns="columns"
				:ui="{
					base: 'table-fixed border-separate border-spacing-0',
					thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
					tbody: '[&>tr]:last:[&>td]:border-b-0',
					th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
					td: 'border-b border-default',
					separator: 'h-0'
				}"
			/>
			<!-- Edit price modal -->
			<div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
				<div class="absolute inset-0 bg-black/60" @click="isEditModalOpen = false"></div>
				<div class="relative w-full max-w-md mx-4 bg-slate-900 text-white rounded-lg shadow-lg p-6 ring-1 ring-slate-700">
					<h3 class="text-lg font-medium mb-2 text-white">Cập nhật giá</h3>
					<p class="text-sm text-slate-300 mb-4">Sản phẩm: <span class="font-medium text-white">{{ editingProduct?.name }}</span></p>
					<label class="block text-sm text-slate-300 mb-1">Giá (VND)</label>
					<input
						type="number"
						step="1"
						min="0"
						v-model.number="editPrice"
						class="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 mb-2 text-white placeholder-slate-400"
					/>
					<p v-if="priceError" class="text-sm text-rose-300 mb-2">{{ priceError }}</p>
					<div class="flex items-center justify-end gap-2 mt-4">
						<UButton variant="ghost" color="neutral" class="text-white" @click="(isEditModalOpen = false, editingProduct = null)">Hủy</UButton>
						<UButton color="success" class="shadow" @click="savePrice">Lưu</UButton>
					</div>
				</div>
			</div>
		</template>
	</UDashboardPanel>
</template>
