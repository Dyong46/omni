<script setup lang="ts">
import orderService from "~/services/order.service";
import customerService from "~/services/customer.service";

function formatVND(value: number): string {
	if (value >= 1_000_000_000) {
		return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B ₫";
	}
	if (value >= 1_000_000) {
		return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M ₫";
	}
	return value.toLocaleString("vi-VN") + " ₫";
}

const { data: stats, status } = await useAsyncData("dashboard-stats", async () => {
	const [statistics, totalCustomers] = await Promise.all([
		orderService.getStatistics(),
		customerService.count()
	]);

	return [
		{
			title: "Total Customers",
			icon: "i-lucide-users",
			value: totalCustomers.toLocaleString("vi-VN"),
			to: "/customers"
		},
		{
			title: "Total Orders",
			icon: "i-lucide-shopping-cart",
			value: statistics.totalOrders.toLocaleString("vi-VN"),
			to: "/orders"
		},
		{
			title: "Total Revenue",
			icon: "i-lucide-circle-dollar-sign",
			value: formatVND(statistics.totalRevenue),
			to: "/orders"
		}
	];
}, {
	default: () => []
});

</script>

<template>
	<UPageGrid class="lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-px">
		<UPageCard
			v-for="(stat, index) in stats"
			:key="index"
			:icon="stat.icon"
			:title="stat.title"
			:to="stat.to"
			variant="subtle"
			:ui="{
				container: 'gap-y-1.5',
				wrapper: 'items-start',
				leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
				title: 'font-normal text-muted text-xs uppercase'
			}"
			class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
		>
			<USkeleton v-if="status === 'pending'" class="h-8 w-28" />
			<span v-else class="text-2xl font-semibold text-highlighted">
				{{ stat.value }}
			</span>
		</UPageCard>
	</UPageGrid>
</template>
