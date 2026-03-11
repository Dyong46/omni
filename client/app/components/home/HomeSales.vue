<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import orderService, { type Order } from "~/services/order.service";

const UBadge = resolveComponent("UBadge");
const NuxtLink = resolveComponent("NuxtLink");
const columns: TableColumn<Order>[] = [
	{
		accessorKey: "id",
		header: "ID",
		cell: ({ row }) =>
			h(
				NuxtLink,
				{ to: `/orders/${row.original.id}`, class: "font-mono text-primary hover:underline" },
				() => `#${row.original.id}`
			)
	},
	{
		accessorKey: "createdAt",
		header: "Date",
		cell: ({ row }) =>
			new Date(row.original.createdAt).toLocaleString("vi-VN", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			})
	},
	{
		id: "paymentStatus",
		header: "Payment",
		cell: ({ row }) => {
			const colorMap = {
				paid: "success" as const,
				unpaid: "warning" as const,
				refunded: "neutral" as const
			};
			const ps = row.original.paymentStatus ?? "unpaid";

			return h(UBadge, { class: "capitalize", variant: "subtle", color: colorMap[ps] }, () => ps);
		}
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => row.original.email ?? "—"
	},
	{
		accessorKey: "totalAmount",
		header: () => h("div", { class: "text-right" }, "Amount"),
		cell: ({ row }) => {
			const formatted = row.original.totalAmount.toLocaleString("vi-VN") + " ₫";

			return h("div", { class: "text-right font-medium" }, formatted);
		}
	}
];

const { data, status } = await useAsyncData("home-orders", () => orderService.getAll(), {
	default: () => [] as Order[]
});

</script>

<template>
	<UTable
		:data="data"
		:columns="columns"
		:loading="status === 'pending'"
		class="shrink-0"
		:ui="{
			base: 'table-fixed border-separate border-spacing-0',
			thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
			tbody: '[&>tr]:last:[&>td]:border-b-0',
			th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
			td: 'border-b border-default'
		}"
	/>
</template>
