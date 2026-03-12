<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/table-core";
import type { Row } from "@tanstack/table-core";
import orderService, { type Order } from "~/services/order.service";
import { formatCurrency } from "~/utils/formatters";

const { isNotificationsSlideoverOpen } = useDashboard();
const toast = useToast();
const router = useRouter();

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const data = ref<Order[]>([]);
const status = ref<"idle" | "pending" | "success" | "error">("idle");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const confirmingId = ref<number | null>(null);
const deletingId = ref<number | null>(null);

const loadDrafts = async () => {
	status.value = "pending";
	try {
		data.value = await orderService.getDrafts();
		status.value = "success";
	} catch (error) {
		status.value = "error";
		console.error("Failed to load drafts:", error);
	}
};

async function confirmDraft(order: Order) {
	if (confirmingId.value) return;
	confirmingId.value = order.id;
	try {
		await orderService.confirmDraft(order.id);
		toast.add({
			title: "Order confirmed",
			description: `Draft #${order.id} has been converted to an active order.`,
			color: "success",
		});
		loadDrafts();
	} catch (error) {
		console.error("Failed to confirm draft:", error);
		toast.add({ title: "Error", description: "Could not confirm draft", color: "error" });
	} finally {
		confirmingId.value = null;
	}
}

async function deleteDraft(order: Order) {
	if (deletingId.value) return;
	deletingId.value = order.id;
	try {
		await orderService.delete(order.id);
		toast.add({
			title: "Draft deleted",
			description: `Draft #${order.id} has been removed.`,
			color: "success",
		});
		data.value = data.value.filter((o) => o.id !== order.id);
	} catch (error) {
		console.error("Failed to delete draft:", error);
		toast.add({ title: "Error", description: "Could not delete draft", color: "error" });
	} finally {
		deletingId.value = null;
	}
}

function getRowItems(row: Row<Order>) {
	return [
		{
			label: "Confirm order",
			icon: "i-lucide-check-circle",
			onSelect: () => confirmDraft(row.original),
		},
		{ type: "separator" },
		{
			label: "Delete draft",
			icon: "i-lucide-trash",
			color: "error",
			onSelect: () => deleteDraft(row.original),
		},
	];
}

const columns: TableColumn<Order>[] = [
	{ accessorKey: "id", header: "ID" },
	{
		accessorKey: "customerName",
		header: "Customer",
		cell: ({ row }: { row: Row<Order> }) =>
			h("div", { class: "flex flex-col" }, [
				h("p", { class: "font-medium text-highlighted" }, row.original.customerName || "—"),
				h("p", { class: "text-xs text-muted" }, row.original.phone || ""),
			]),
	},
	{
		accessorKey: "channel",
		header: "Channel",
		cell: ({ row }: { row: Row<Order> }) => {
			const colorMap: Record<string, "neutral" | "primary" | "error"> = {
				offline: "neutral",
				shopee: "primary",
				tiktok: "error",
			};

			return h(
				UBadge,
				{ class: "capitalize", variant: "subtle", color: colorMap[row.original.channel] ?? "neutral" },
				() => row.original.channel,
			);
		},
	},
	{
		accessorKey: "totalAmount",
		header: "Total",
		cell: ({ row }: { row: Row<Order> }) => formatCurrency(row.original.totalAmount),
	},
	{
		accessorKey: "shippingAddress",
		header: "Shipping Address",
		cell: ({ row }: { row: Row<Order> }) => row.original.shippingAddress || "—",
	},
	{
		accessorKey: "createdAt",
		header: "Saved At",
		cell: ({ row }: { row: Row<Order> }) =>
			new Date(row.original.createdAt).toLocaleString("vi-VN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			}),
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }: { row: Row<Order> }) =>
			h(
				"div",
				{ class: "flex items-center gap-1 justify-end" },
				[
					h(UButton, {
						label: "Confirm",
						size: "xs",
						color: "success",
						variant: "subtle",
						loading: confirmingId.value === row.original.id,
						onClick: () => confirmDraft(row.original),
					}),
					h(UDropdownMenu, {
						items: getRowItems(row),
					}, {
						default: () =>
							h(UButton, {
								icon: "i-lucide-ellipsis-vertical",
								size: "xs",
								color: "neutral",
								variant: "ghost",
							}),
					}),
				],
			),
	},
];

onMounted(() => {
	loadDrafts();
});
</script>

<template>
	<UDashboardPanel id="draft-orders">
		<template #header>
			<UDashboardNavbar title="Draft Orders" :ui="{ right: 'gap-3' }">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right>
					<UButton
						label="New Draft"
						icon="i-lucide-plus"
						color="primary"
						to="/orders/new-order"
					/>
					<UTooltip text="Notifications" :shortcuts="['N']">
						<UButton
							color="neutral"
							variant="ghost"
							square
							@click="isNotificationsSlideoverOpen = true"
						>
							<UChip color="error" inset>
								<UIcon name="i-lucide-bell" class="size-5 shrink-0" />
							</UChip>
						</UButton>
					</UTooltip>
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<div v-if="status === 'error'" class="text-center py-16 text-muted">
				<UIcon name="i-lucide-alert-circle" class="text-3xl mb-2" />
				<p>Failed to load draft orders.</p>
				<UButton label="Retry" variant="outline" class="mt-4" @click="loadDrafts" />
			</div>

			<div v-else>
				<div class="flex items-center justify-between mb-4">
					<p class="text-sm text-muted">
						{{ data.length }} draft{{ data.length !== 1 ? "s" : "" }} saved
					</p>
				</div>

				<UTable
					v-model:pagination="pagination"
					:data="data"
					:columns="columns"
					:loading="status === 'pending'"
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

				<div v-if="status === 'success' && data.length === 0" class="text-center py-16 text-muted">
					<UIcon name="i-lucide-file-text" class="text-4xl mb-3 opacity-30" />
					<p class="font-medium">No draft orders</p>
					<p class="text-sm mt-1">Save an order as draft from the new order form.</p>
					<UButton label="Create new order" icon="i-lucide-plus" class="mt-4" to="/orders/new-order" />
				</div>
			</div>
		</template>
	</UDashboardPanel>
</template>
