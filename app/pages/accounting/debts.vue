<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard();

</script>

<template>
	<UDashboardPanel id="accounting-debts">
		<template #header>
			<UDashboardNavbar title="Debts" :ui="{ right: 'gap-3' }">
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
			<p>Accounting debts page content goes here.</p>
		</template>
	</UDashboardPanel>
</template>
