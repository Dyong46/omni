<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard();

</script>

<template>
	<UDashboardPanel id="products-pricing-list">
		<template #header>
			<UDashboardNavbar title="Pricing List" :ui="{ right: 'gap-3' }">
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
			<p>Products pricing list page content goes here.</p>
		</template>
	</UDashboardPanel>
</template>
