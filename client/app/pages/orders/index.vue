<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { upperFirst } from "scule";
import { getPaginationRowModel } from "@tanstack/table-core";
import type { Row } from "@tanstack/table-core";
import orderService, { type Order } from "~/services/order.service";

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UCheckbox = resolveComponent("UCheckbox");
const NuxtLink = resolveComponent("NuxtLink");

const toast = useToast();
const router = useRouter();
const table = useTemplateRef("table");
const exporting = ref(false);

const columnFilters = ref([{
	id: "email",
	value: ""
}]);
const columnVisibility = ref();
const rowSelection = ref({ 1: true });

// Fetch orders data
const data = ref<Order[]>([]);
const status = ref<"idle" | "pending" | "success" | "error">("idle");

const loadOrders = async () => {
	status.value = "pending";
	try {
		data.value = await orderService.getAll();
		status.value = "success";
	} catch (error) {
		status.value = "error";
		console.error("Failed to load orders:", error);
	}
};

onMounted(() => {
	loadOrders();
});

async function exportOrders() {
	if (exporting.value) return;

	exporting.value = true;
	try {
		const orders = await orderService.getAll();

		if (!orders.length) {
			toast.add({
				title: "No data",
				description: "There are no orders to export.",
				color: "warning"
			});
			return;
		}

		const rows = orders.map(order => ({
			"Order ID": order.id,
			"Customer Name": order.customerName,
			Phone: order.phone,
			Email: order.email ?? "",
			Channel: order.channel,
			"Shipping Address": order.shippingAddress,
			"Order Status": order.status,
			"Payment Status": order.paymentStatus,
			"Total Amount": order.totalAmount,
			"Created At": order.createdAt,
			"Updated At": order.updatedAt
		}));

		const XLSX = await import("xlsx");
		const worksheet = XLSX.utils.json_to_sheet(rows);
		const workbook = XLSX.utils.book_new();

		XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
		XLSX.writeFile(workbook, `orders-${new Date().toISOString().slice(0, 10)}.xlsx`);

		toast.add({
			title: "Export completed",
			description: "Orders were exported to XLSX successfully.",
			color: "success"
		});
	} catch (error) {
		console.error("Failed to export orders:", error);
		toast.add({
			title: "Export failed",
			description: "Could not export orders to XLSX.",
			color: "error"
		});
	} finally {
		exporting.value = false;
	}
}

function getRowItems(row: Row<Order>) {
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
			type: "separator"
		},
		{
			label: "View order details",
			icon: "i-lucide-list",
			onSelect() {
				router.push(`/orders/${row.original.id}`);
			}
		},
		{
			label: "View payment status",
			icon: "i-lucide-wallet",
			onSelect() {
				router.push(`/orders/${row.original.id}`);
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
				toast.add({
					title: "Customer deleted",
					description: "The customer has been deleted."
				});
			}
		}
	];
}

const columns: TableColumn<Order>[] = [
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
						row.original.customerName?.charAt(0).toUpperCase() || "?"
					)
				]),
				h("div", undefined, [
					h(
						NuxtLink,
						{
							to: `/orders/${row.original.id}`,
							class: "font-medium text-highlighted hover:underline"
						},
						() => row.original.customerName || `Order #${row.original.id}`
					),
					h("p", { class: "" }, `@${row.original.customerName}`)
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
		}
	},
	{
		accessorKey: "channel",
		header: "Channel",
		cell: ({ row }) => {
			const colorMap: Record<string, "neutral" | "primary" | "error"> = {
				offline: "neutral",
				tiktok: "error",
				shopee: "primary"
			};
			const ch = row.original.channel ?? "offline";

			return h(
				UBadge,
				{ class: "capitalize", variant: "subtle", color: colorMap[ch] ?? "neutral" },
				() => ch
			);
		}
	},
	{
		accessorKey: "shippingAddress",
		header: "Shipping Address",
		cell: ({ row }) => row.original.shippingAddress ?? "—"
	},
	{
		id: "payment",
		header: "Payment",
		cell: ({ row }) => {
			const paymentStatus = row.original.paymentStatus ?? "unpaid";
			const colorMap = {
				paid: "success" as const,
				unpaid: "warning" as const,
				refunded: "neutral" as const
			};

			return h(
				UBadge,
				{ class: "capitalize", variant: "subtle", color: colorMap[paymentStatus] },
				() => paymentStatus
			);
		}
	},
	{
		accessorKey: "status",
		header: "Status",
		filterFn: "equals",
		cell: ({ row }) => {
			const colorMap: Record<string, "neutral" | "warning" | "success" | "error"> = {
				new: "warning",
				pending: "warning",
				processing: "neutral",
				delivered: "success",
				completed: "success",
				cancelled: "error"
			};

			return h(UBadge, { class: "capitalize", variant: "subtle", color: colorMap[row.original.status] ?? "neutral" }, () =>
				row.original.status
			);
		}
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

const statusFilter = ref("all");

watch(() => statusFilter.value, (newVal) => {
	if (!table?.value?.tableApi) return;

	const statusColumn = table.value.tableApi.getColumn("status");

	if (!statusColumn) return;

	if (newVal === "all") {
		statusColumn.setFilterValue(undefined);
	} else {
		statusColumn.setFilterValue(newVal);
	}
});

const pagination = ref({
	pageIndex: 0,
	pageSize: 10
});

</script>

<template>
	<UDashboardPanel id="orders">
		<template #header>
			<UDashboardNavbar title="Orders">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right>
					<UButton
						label="Export data"
						icon="i-lucide-download"
						variant="outline"
						:loading="exporting"
						@click="exportOrders"
					/>
					<UButton label="Create order" icon="i-lucide-plus" to="orders/new-order" />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<div class="flex flex-wrap items-center justify-between gap-1.5">
				<UInput
					:model-value="(table?.tableApi?.getColumn('email')?.getFilterValue() as string)"
					class="max-w-sm"
					icon="i-lucide-search"
					placeholder="Filter emails..."
					@update:model-value="table?.tableApi?.getColumn('email')?.setFilterValue($event)"
				/>

				<div class="flex flex-wrap items-center gap-1.5">
					<CustomersDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
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

					<USelect
						v-model="statusFilter"
						:items="[
							{ label: 'All orders', value: 'all' },
							{ label: 'New orders', value: 'new' },
							{ label: 'Pending orders', value: 'pending' },
							{ label: 'Processing orders', value: 'processing' },
							{ label: 'Delivered orders', value: 'delivered' },
							{ label: 'Cancelled orders', value: 'cancelled' }
						]"
						:ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
						placeholder="Filter status"
						class="min-w-28"
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
		</template>
	</UDashboardPanel>
</template>
