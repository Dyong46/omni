<script setup lang="ts">
import orderService, { type Order, type OrderShipmentStatus } from "~/services/order.service";

const { isNotificationsSlideoverOpen } = useDashboard();

const range = ref<"today" | "7d" | "30d">("7d");
const loading = ref(false);
const orders = ref<Order[]>([]);

function getStatusColor(status: OrderShipmentStatus) {
	const colors: Record<OrderShipmentStatus, "warning" | "info" | "primary" | "success" | "error"> = {
		new: "warning",
		confirmed: "info",
		packing: "primary",
		shipping: "primary",
		delivered: "success",
		cancelled: "error",
	};

	return colors[status];
}

function getDateRange(value: "today" | "7d" | "30d") {
	const endDate = new Date();
	const startDate = new Date();

	if (value === "today") {
		startDate.setHours(0, 0, 0, 0);
	} else if (value === "7d") {
		startDate.setDate(startDate.getDate() - 6);
	} else {
		startDate.setDate(startDate.getDate() - 29);
	}

	return {
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString(),
	};
}

const loadDashboard = async () => {
	loading.value = true;
	try {
		const dateRange = getDateRange(range.value);

		orders.value = await orderService.getAll({
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
		});
	} catch (error) {
		console.error("Failed to load shipments dashboard:", error);
		orders.value = [];
	} finally {
		loading.value = false;
	}
};

const shipmentStats = computed(() => {
	const total = orders.value.length;
	const delivered = orders.value.filter((order) => order.status === "delivered").length;
	const shipping = orders.value.filter((order) => order.status === "shipping").length;
	const pending = orders.value.filter((order) =>
		["new", "confirmed", "packing"].includes(order.status),
	).length;
	const cancelled = orders.value.filter((order) => order.status === "cancelled").length;

	return {
		total,
		delivered,
		shipping,
		pending,
		cancelled,
		deliveryRate: total ? Math.round((delivered / total) * 100) : 0,
	};
});

const statusBreakdown = computed(() => {
	const statuses: OrderShipmentStatus[] = [
		"new",
		"confirmed",
		"packing",
		"shipping",
		"delivered",
		"cancelled",
	];

	return statuses.map((status) => ({
		status,
		count: orders.value.filter((order) => order.status === status).length,
	}));
});

const recentShipments = computed(() => orders.value.slice(0, 8));

watch(range, () => {
	loadDashboard();
});

onMounted(() => {
	loadDashboard();
});

</script>

<template>
	<UDashboardPanel id="shipments-dashboard">
		<template #header>
			<UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
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
			<div class="flex items-center justify-end mb-4">
				<USelect
					v-model="range"
					:items="[
						{ label: 'Today', value: 'today' },
						{ label: 'Last 7 days', value: '7d' },
						{ label: 'Last 30 days', value: '30d' }
					]"
					class="w-44"
				/>
			</div>

			<UPageGrid class="lg:grid-cols-5 gap-4 mb-6">
				<UPageCard title="Total Shipments" icon="i-lucide-truck" variant="subtle">
					<USkeleton v-if="loading" class="h-8 w-20" />
					<span v-else class="text-2xl font-semibold text-highlighted">{{ shipmentStats.total }}</span>
				</UPageCard>
				<UPageCard title="Pending" icon="i-lucide-package-search" variant="subtle">
					<USkeleton v-if="loading" class="h-8 w-20" />
					<span v-else class="text-2xl font-semibold text-warning">{{ shipmentStats.pending }}</span>
				</UPageCard>
				<UPageCard title="Shipping" icon="i-lucide-truck" variant="subtle">
					<USkeleton v-if="loading" class="h-8 w-20" />
					<span v-else class="text-2xl font-semibold text-primary">{{ shipmentStats.shipping }}</span>
				</UPageCard>
				<UPageCard title="Delivered" icon="i-lucide-package-check" variant="subtle">
					<USkeleton v-if="loading" class="h-8 w-20" />
					<span v-else class="text-2xl font-semibold text-success">{{ shipmentStats.delivered }}</span>
				</UPageCard>
				<UPageCard title="Delivery Rate" icon="i-lucide-percent" variant="subtle">
					<USkeleton v-if="loading" class="h-8 w-20" />
					<span v-else class="text-2xl font-semibold text-highlighted">{{ shipmentStats.deliveryRate }}%</span>
				</UPageCard>
			</UPageGrid>

			<div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
				<UCard class="xl:col-span-1">
					<template #header>
						<div class="font-semibold">Status Breakdown</div>
					</template>
					<div class="space-y-3">
						<div
							v-for="item in statusBreakdown"
							:key="item.status"
							class="flex items-center justify-between"
						>
							<UBadge :color="getStatusColor(item.status)" variant="subtle" class="capitalize">
								{{ item.status }}
							</UBadge>
							<span class="font-semibold">{{ item.count }}</span>
						</div>
					</div>
				</UCard>

				<UCard class="xl:col-span-2">
					<template #header>
						<div class="font-semibold">Recent Shipments</div>
					</template>

					<div v-if="loading" class="space-y-3">
						<USkeleton v-for="n in 6" :key="n" class="h-10 w-full" />
					</div>

					<div v-else-if="recentShipments.length === 0" class="text-sm text-muted py-6 text-center">
						No shipments in this range.
					</div>

					<div v-else class="space-y-2">
						<div
							v-for="order in recentShipments"
							:key="order.id"
							class="flex items-center justify-between border border-default rounded-lg px-3 py-2"
						>
							<div class="min-w-0">
								<p class="font-medium truncate">#{{ order.id }} • {{ order.customerName || "Guest" }}</p>
								<p class="text-xs text-muted truncate">{{ order.shippingAddress || "No address" }}</p>
							</div>
							<div class="flex items-center gap-2 pl-3">
								<UBadge :color="getStatusColor((order.status || 'new') as OrderShipmentStatus)" variant="subtle" class="capitalize">
									{{ order.status || "new" }}
								</UBadge>
							</div>
						</div>
					</div>
				</UCard>
			</div>
		</template>
	</UDashboardPanel>
</template>
