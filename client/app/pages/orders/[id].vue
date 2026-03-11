<script setup lang="ts">
import orderService, { type Order } from "~/services/order.service";

const route = useRoute();
const order = ref<Order | null>(null);
const status = ref<"idle" | "pending" | "success" | "error">("idle");

const orderId = computed(() => Number(route.params.id));

const paymentStatus = computed(() => {
	return order.value?.status === "paid" ? "paid" : "unpaid";
});

const paymentColor = computed(() => {
	return paymentStatus.value === "paid" ? "success" : "warning";
});

async function loadOrder() {
	if (!Number.isFinite(orderId.value)) {
		status.value = "error";
		return;
	}

	status.value = "pending";

	try {
		order.value = await orderService.getById(orderId.value);
		status.value = "success";
	} catch (error) {
		console.error("Failed to load order:", error);
		status.value = "error";
	}
}

onMounted(() => {
	loadOrder();
});
</script>

<template>
	<UDashboardPanel :id="`order-${route.params.id}`">
		<template #header>
			<UDashboardNavbar :title="order ? `Order #${order.id}` : 'Order Detail'">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
				<template #right>
					<UButton label="Back to orders" variant="ghost" to="/orders" />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<div v-if="status === 'pending'" class="p-6">
				<UCard>
					<div class="py-10 text-center text-sm text-muted">Loading order details...</div>
				</UCard>
			</div>

			<div v-else-if="status === 'error' || !order" class="p-6">
				<UCard>
					<div class="flex flex-col items-center gap-4 py-10 text-center">
						<p class="text-sm text-muted">Unable to load this order.</p>
						<UButton label="Back to orders" to="/orders" variant="outline" />
					</div>
				</UCard>
			</div>

			<div v-else class="space-y-6 p-6">
				<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<UCard>
						<template #header>
							<h3 class="font-semibold">Customer</h3>
						</template>
						<div class="space-y-3 text-sm">
							<div>
								<p class="text-muted">Name</p>
								<p class="font-medium">{{ order.customerName || "Walk-in customer" }}</p>
							</div>
							<div>
								<p class="text-muted">Phone</p>
								<p class="font-medium">{{ order.phone }}</p>
							</div>
							<div>
								<p class="text-muted">Email</p>
								<p class="font-medium">{{ order.email || "—" }}</p>
							</div>
						</div>
					</UCard>

					<UCard>
						<template #header>
							<h3 class="font-semibold">Order Summary</h3>
						</template>
						<div class="space-y-3 text-sm">
							<div class="flex items-center justify-between gap-3">
								<span class="text-muted">Channel</span>
								<UBadge class="capitalize" variant="subtle">{{ order.channel }}</UBadge>
							</div>
							<div class="flex items-center justify-between gap-3">
								<span class="text-muted">Order Status</span>
								<UBadge class="capitalize" variant="subtle">{{ order.status }}</UBadge>
							</div>
							<div class="flex items-center justify-between gap-3">
								<span class="text-muted">Payment</span>
								<UBadge :color="paymentColor" class="capitalize" variant="subtle">{{ paymentStatus }}</UBadge>
							</div>
							<div class="flex items-center justify-between gap-3">
								<span class="text-muted">Created At</span>
								<span class="font-medium">{{ new Date(order.createdAt).toLocaleString() }}</span>
							</div>
						</div>
					</UCard>

					<UCard>
						<template #header>
							<h3 class="font-semibold">Delivery</h3>
						</template>
						<div class="space-y-3 text-sm">
							<div>
								<p class="text-muted">Shipping Address</p>
								<p class="font-medium">{{ order.shippingAddress || "—" }}</p>
							</div>
							<div>
								<p class="text-muted">Items</p>
								<p class="font-medium">{{ order.items?.length || 0 }} product(s)</p>
							</div>
							<div>
								<p class="text-muted">Total Amount</p>
								<p class="text-lg font-semibold text-primary">{{ order.totalAmount.toLocaleString() }} VND</p>
							</div>
						</div>
					</UCard>
				</div>

				<UCard>
					<template #header>
						<div class="flex items-center justify-between gap-3">
							<h3 class="font-semibold">Order Items</h3>
							<span class="text-sm text-muted">{{ order.items?.length || 0 }} item(s)</span>
						</div>
					</template>

					<div class="overflow-x-auto">
						<table class="min-w-full border-separate border-spacing-0 text-sm">
							<thead>
								<tr class="bg-elevated/50">
									<th class="border-y border-l border-default px-4 py-3 text-left font-medium first:rounded-l-lg">Product</th>
									<th class="border-y border-default px-4 py-3 text-left font-medium">Unit Price</th>
									<th class="border-y border-default px-4 py-3 text-left font-medium">Quantity</th>
									<th class="border-y border-r border-default px-4 py-3 text-left font-medium last:rounded-r-lg">Line Total</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="item in order.items || []" :key="item.id">
									<td class="border-b border-default px-4 py-3">{{ item.product?.name || `Product #${item.productId}` }}</td>
									<td class="border-b border-default px-4 py-3">{{ item.price.toLocaleString() }} VND</td>
									<td class="border-b border-default px-4 py-3">{{ item.quantity }}</td>
									<td class="border-b border-default px-4 py-3 font-medium">{{ (item.price * item.quantity).toLocaleString() }} VND</td>
								</tr>
							</tbody>
						</table>
					</div>
				</UCard>
			</div>
		</template>
	</UDashboardPanel>
</template>