<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/table-core";
import type { Row } from "@tanstack/table-core";
import orderService, {
	type Order,
	type OrderChannel,
	type OrderShipmentStatus,
} from "~/services/order.service";

const { isNotificationsSlideoverOpen } = useDashboard();
const toast = useToast();

const UBadge = resolveComponent("UBadge");
const UInput = resolveComponent("UInput");
const USelect = resolveComponent("USelect");

const searchQuery = ref("");
const channelFilter = ref<OrderChannel | "all">("all");
const statusFilter = ref<OrderShipmentStatus | "all">("all");
const updatingOrderId = ref<number | null>(null);

const data = ref<Order[]>([]);
const status = ref<"idle" | "pending" | "success" | "error">("idle");
const pagination = ref({ pageIndex: 0, pageSize: 10 });

const statusOptions = [
	{ label: "New", value: "new" },
	{ label: "Confirmed", value: "confirmed" },
	{ label: "Packing", value: "packing" },
	{ label: "Shipping", value: "shipping" },
	{ label: "Delivered", value: "delivered" },
	{ label: "Cancelled", value: "cancelled" },
];

const channelOptions = [
	{ label: "All channels", value: "all" },
	{ label: "Offline", value: "offline" },
	{ label: "Shopee", value: "shopee" },
	{ label: "TikTok", value: "tiktok" },
];

const filterStatusOptions = [{ label: "All statuses", value: "all" }, ...statusOptions];

const loadShipments = async () => {
	status.value = "pending";
	try {
		const filters: { channel?: OrderChannel; status?: OrderShipmentStatus } = {};

		if (channelFilter.value !== "all") {
			filters.channel = channelFilter.value;
		}

		if (statusFilter.value !== "all") {
			filters.status = statusFilter.value;
		}

		let orders = await orderService.getAll(filters);

		if (searchQuery.value.trim()) {
			const keyword = searchQuery.value.trim().toLowerCase();

			orders = orders.filter((order) => {
				const customer = (order.customerName ?? "").toLowerCase();
				const phone = (order.phone ?? "").toLowerCase();
				const id = String(order.id);

				return customer.includes(keyword) || phone.includes(keyword) || id.includes(keyword);
			});
		}

		data.value = orders;
		status.value = "success";
	} catch (error) {
		status.value = "error";
		console.error("Failed to load shipments:", error);
	}
};

async function updateShipmentStatus(order: Order, nextStatus: OrderShipmentStatus) {
	if (order.status === nextStatus || updatingOrderId.value) {
		return;
	}

	updatingOrderId.value = order.id;
	try {
		await orderService.updateShipmentStatus(order.id, nextStatus);
		order.status = nextStatus;

		toast.add({
			title: "Shipment updated",
			description: `Order #${order.id} moved to ${nextStatus}`,
			color: "success",
		});
	} catch (error) {
		console.error("Failed to update shipment status:", error);
		toast.add({
			title: "Update failed",
			description: "Could not update shipment status",
			color: "error",
		});
	} finally {
		updatingOrderId.value = null;
	}
}

function getStatusColor(currentStatus: string | null | undefined) {
	const colorMap: Record<string, "warning" | "info" | "primary" | "success" | "error"> = {
		new: "warning",
		confirmed: "info",
		packing: "primary",
		shipping: "primary",
		delivered: "success",
		cancelled: "error",
	};

	return colorMap[currentStatus ?? ""] ?? "warning";
}

const columns: TableColumn<Order>[] = [
	{ accessorKey: "id", header: "Order ID" },
	{
		accessorKey: "customerName",
		header: "Customer",
		cell: ({ row }: { row: Row<Order> }) => {
			const name = row.original.customerName || `Order #${row.original.id}`;

			return h("div", { class: "flex flex-col" }, [
				h("p", { class: "font-medium text-highlighted" }, name),
				h("p", { class: "text-xs text-muted" }, row.original.phone || "-"),
			]);
		},
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
		id: "shipmentStatus",
		header: "Shipment Status",
		cell: ({ row }: { row: Row<Order> }) => {
			const currentStatus = (row.original.status ?? "new") as OrderShipmentStatus;

			return h("div", { class: "flex items-center gap-2" }, [
				h(
					UBadge,
					{ class: "capitalize", variant: "subtle", color: getStatusColor(currentStatus) },
					() => currentStatus,
				),
				h(USelect, {
					modelValue: currentStatus,
					items: statusOptions,
					class: "w-36",
					size: "xs",
					disabled: updatingOrderId.value === row.original.id,
					"onUpdate:modelValue": (value: OrderShipmentStatus) => {
						if (!value) {
							return;
						}

						updateShipmentStatus(row.original, value);
					},
				}),
			]);
		},
	},
	{
		accessorKey: "shippingAddress",
		header: "Shipping Address",
		cell: ({ row }: { row: Row<Order> }) => row.original.shippingAddress || "-",
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
		cell: ({ row }: { row: Row<Order> }) =>
			new Date(row.original.createdAt).toLocaleString("vi-VN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			}),
	},
];

watch([searchQuery, channelFilter, statusFilter], () => {
	loadShipments();
});

onMounted(() => {
	loadShipments();
});

</script>

<template>
	<UDashboardPanel id="shipments">
		<template #header>
			<UDashboardNavbar title="Shipments" :ui="{ right: 'gap-3' }">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right>
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
			<div class="flex flex-wrap items-center gap-2 mb-4">
				<UInput
					v-model="searchQuery"
					icon="i-lucide-search"
					placeholder="Search by order ID, customer, phone"
					class="w-full md:w-80"
				/>
				<USelect
					v-model="channelFilter"
					:items="channelOptions"
					class="w-full md:w-44"
				/>
				<USelect
					v-model="statusFilter"
					:items="filterStatusOptions"
					class="w-full md:w-52"
				/>
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
		</template>
	</UDashboardPanel>
</template>
