<template>
	<UContainer class="py-10">
		<h1 class="text-3xl font-bold mb-6">
			Dashboard
		</h1>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
			<UCard>
				<template #header>
					<h3 class="font-semibold">
						Tổng doanh thu
					</h3>
				</template>
				<p class="text-2xl font-bold">
					{{ formatCurrency(1234567890) }}
				</p>
			</UCard>

			<UCard>
				<template #header>
					<h3 class="font-semibold">
						Đơn hàng
					</h3>
				</template>
				<p class="text-2xl font-bold">
					1,234
				</p>
			</UCard>

			<UCard>
				<template #header>
					<h3 class="font-semibold">
						Khách hàng
					</h3>
				</template>
				<p class="text-2xl font-bold">
					5,678
				</p>
			</UCard>
		</div>

		<UCard>
			<template #header>
				<h3 class="font-semibold">
					Hoạt động gần đây
				</h3>
			</template>
			<p class="text-gray-600">
				Chưa có dữ liệu...
			</p>
		</UCard>
	</UContainer>
</template>

<script setup lang="ts">
definePageMeta({
	middleware: ["auth"]
});

useSeoMeta({
	title: "Dashboard - OmniSale"
});
</script>
