<template>
	<UDashboardGroup unit="rem">
		<UDashboardSidebar
			id="default"
			v-model:open="open"
			collapsible
			resizable
			class="bg-elevated/25"
			:ui="{ footer: 'lg:border-t lg:border-default' }"
		>
			<template #header="{ collapsed }">
				<TeamsMenu :collapsed="collapsed" />
			</template>

			<template #default="{ collapsed }">
				<UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

				<UNavigationMenu
					:collapsed="collapsed"
					:items="links[0]"
					orientation="vertical"
					tooltip
					popover
				/>

				<UNavigationMenu
					:collapsed="collapsed"
					:items="links[1]"
					orientation="vertical"
					tooltip
					class="mt-auto"
				/>
			</template>

			<template #footer="{ collapsed }">
				<UserMenu :collapsed="collapsed" />
			</template>
		</UDashboardSidebar>

		<UDashboardSearch :groups="groups" />

		<slot />

		<NotificationsSlideover />
	</UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const toast = useToast();

const open = ref(false);

const links = [
	[{
		label: "Home",
		icon: "i-lucide-house",
		to: "/",
		onSelect: () => {
			open.value = false;
		}
	}, {
		label: "Orders",
		icon: "i-lucide-shopping-cart",
		type: "trigger",
		children: [{
			label: "All Orders",
			to: "/orders",
			exact: true,
			onSelect: () => {
				open.value = false;
			}
		}, {
			label: "Draft Orders",
			to: "/draft-orders",
			onSelect: () => {
				open.value = false;
			}
		}, {
			label: "Imcomplete",
			to: "/orders/checkouts",
			badge: "4",
			onSelect: () => {
				open.value = false;
			}
		}, {
			label: "Bunk Delivery",
			to: "/orders/mass-fulfill",
			onSelect: () => {
				open.value = false;
			}
		}]
	}, {
		label: "Ship",
		icon: "i-lucide-truck",
		type: "trigger",
		children: [{
			label: "Overview",
			to: "/shipments/dashboard",
			exact: true,
			onSelect: () => {
				open.value = false;
			}
		}, {
			label: "Ship",
			to: "/shipments",
			onSelect: () => {
				open.value = false;
			}
		}]
	}, {
		label: "Product",
		icon: "i-lucide-tag",
		type: "trigger",
		children: [{
			label: "All products",
			to: "/products",
			exact: true,
			onSelect: () => {
				open.value = false;
			}
		}, {
			label: "Product Groups",
			to: "/products/collections",
			onSelect: () => {
				open.value = false;
			}
		}, {
			label: "Price List",
			to: "/products/pricing-list",
			onSelect: () => {
				open.value = false;
			}
		}, {
			label: "Product Inventory",
			to: "/products/inventories",
			onSelect: () => {
				open.value = false;
			}
		}]
	}, {
		label: "Customers",
		icon: "i-lucide-users",
		to: "/customers",
		onSelect: () => {
			open.value = false;
		}
	}, {
		label: "Fund Book",
		icon: "i-lucide-circle-dollar-sign",
		type: "trigger",
		children: [{
			label: "Fund Book",
			to: "/accounting/transactions",
			exact: true,
			onSelect: () => {
				open.value = false;
			}
		}, {
			label: "Debt",
			to: "/accounting/debts",
			onSelect: () => {
				open.value = false;
			}
		}]
	}, {
		label: "Promotions",
		icon: "i-lucide-gift",
		to: "/discounts",
		onSelect: () => {
			open.value = false;
		}
	}, {
		label: "Report",
		icon: "i-lucide-chart-area",
		to: "/reports",
		onSelect: () => {
			open.value = false;
		}
	}, {
		label: "Settings",
		to: "/settings",
		icon: "i-lucide-settings",
		type: "trigger",
		children: [{
			label: "General",
			to: "/settings",
			exact: true,
			onSelect: () => {
				open.value = false;
			}
		}, {
			label: "Members",
			to: "/settings/members",
			onSelect: () => {
				open.value = false;
			}
		}, {
			label: "Notifications",
			to: "/settings/notifications",
			onSelect: () => {
				open.value = false;
			}
		}, {
			label: "Security",
			to: "/settings/security",
			onSelect: () => {
				open.value = false;
			}
		}]
	}]
] satisfies NavigationMenuItem[][];

const groups = computed(() => [
	{
		id: "links",
		label: "Go to",
		items: links.flat()
	}
]);

onMounted(async () => {
	const cookie = useCookie("cookie-consent");

	if (cookie.value === "accepted") {
		return;
	}

	toast.add({
		title: "We use first-party cookies to enhance your experience on our website.",
		duration: 0,
		close: false,
		actions: [{
			label: "Accept",
			color: "neutral",
			variant: "outline",
			onClick: () => {
				cookie.value = "accepted";
			}
		}, {
			label: "Opt out",
			color: "neutral",
			variant: "ghost"
		}]
	});
});
</script>