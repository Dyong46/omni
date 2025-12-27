<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { upperFirst } from "scule";
import { getPaginationRowModel } from "@tanstack/table-core";
import type { Row } from "@tanstack/table-core";
import type { Customer } from "~/types";

const UButton = resolveComponent("UButton");
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
const selectedCustomer = ref<Customer | null>(null);
const editModalRef = ref();
const deleteModalRef = ref();

const { data, status, refresh } = await useFetch<Customer[]>("/api/customers", {
	lazy: true,
	watch: [searchQuery],
	query: computed(() => ({
		q: searchQuery.value || undefined
	}))
});

function getRowItems(row: Row<Customer>) {
	return [
		{
			type: "label",
			label: "Actions"
		},
		{
			label: "Copy customer ID",
			icon: "i-lucide-copy",
			onSelect() {
				navigator.clipboard.writeText(row.original.id.toString());
				toast.add({
					title: "Copied to clipboard",
					description: "Customer ID copied to clipboard"
				});
			}
		},
		{
			label: "Edit customer",
			icon: "i-lucide-pencil",
			onSelect() {
				selectedCustomer.value = row.original;
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
			label: "Delete customer",
			icon: "i-lucide-trash",
			color: "error",
			onSelect() {
				selectedCustomer.value = row.original;
				nextTick(() => {
					if (deleteModalRef.value) {
						deleteModalRef.value.open = true;
					}
				});
			}
		}
	];
}

const columns: TableColumn<Customer>[] = [
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
		header: "Name",
		cell: ({ row }) => {
			return h("div", { class: "flex items-center gap-3" }, [
				h("div", {
					class: "w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"
				}, [
					h("span", { class: "text-primary font-medium" }, 
						row.original.name?.charAt(0).toUpperCase() || "?"
					)
				]),
				h("div", undefined, [
					h("p", { class: "font-medium text-highlighted" }, row.original.name || "—"),
					h("p", { class: "text-sm text-muted" }, row.original.phone)
				])
			]);
		}
	},
	{
		accessorKey: "email",
		header: ({ column }) => {
			const isSorted = column.getIsSorted();

			return h(UButton, {
				color: "neutral",
				variant: "ghost",
				label: "Email",
				icon: isSorted
					? isSorted === "asc"
						? "i-lucide-arrow-up-narrow-wide"
						: "i-lucide-arrow-down-wide-narrow"
					: "i-lucide-arrow-up-down",
				class: "-mx-2.5",
				onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
			});
		},
		cell: ({ row }) => row.original.email || "—"
	},
	{
		accessorKey: "phone",
		header: "Phone"
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

const pagination = ref({
	pageIndex: 0,
	pageSize: 10
});

function handleSuccess() {
	refresh();
	selectedCustomer.value = null;
}

</script>

<template>
	<UDashboardPanel id="customers">
		<template #header>
			<UDashboardNavbar title="Customers">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right>
					<CustomersAddModal />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<div class="flex flex-wrap items-center justify-between gap-1.5">
				<UInput
					v-model="searchQuery"
					class="max-w-sm"
					icon="i-lucide-search"
					placeholder="Search customers..."
				/>

				<div class="flex flex-wrap items-center gap-1.5">
					<CustomersDeleteModal
						ref="deleteModalRef"
						:count="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
						:customer="selectedCustomer"
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
					</CustomersDeleteModal>

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
			<CustomersEditModal
				ref="editModalRef"
				:customer="selectedCustomer"
				@success="handleSuccess"
			/>
		</template>
	</UDashboardPanel>
</template>
