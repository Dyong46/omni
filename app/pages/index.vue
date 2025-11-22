<template>
	<UContainer class="py-10">
		<div class="max-w-4xl mx-auto">
			<div class="text-center mb-8">
				<h1 class="text-4xl font-bold mb-4">
					{{ config.public.appName }}
				</h1>
				<p class="text-xl text-gray-600 dark:text-gray-300">
					Hệ thống quản lý bán hàng đa kênh
				</p>
			</div>

			<WelcomeCard class="mb-6">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
					<UCard>
						<template #header>
							<h3 class="font-semibold">
								Nuxt 4
							</h3>
						</template>
						<p class="text-sm text-gray-600">
							Framework Vue.js mạnh mẽ
						</p>
					</UCard>

					<UCard>
						<template #header>
							<h3 class="font-semibold">
								TypeScript
							</h3>
						</template>
						<p class="text-sm text-gray-600">
							Type-safe development
						</p>
					</UCard>

					<UCard>
						<template #header>
							<h3 class="font-semibold">
								Pinia
							</h3>
						</template>
						<p class="text-sm text-gray-600">
							State management
						</p>
					</UCard>
				</div>
			</WelcomeCard>

			<UCard>
				<template #header>
					<h3 class="font-semibold">
						Quick Start
					</h3>
				</template>
				<ul class="space-y-2">
					<li>✅ Nuxt 4 configured</li>
					<li>✅ TypeScript support</li>
					<li>✅ Pinia store setup</li>
					<li>✅ VueUse utilities</li>
					<li>✅ Form validation ready</li>
					<li>✅ API composables</li>
				</ul>
			</UCard>
		</div>
	</UContainer>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();

useSeoMeta({
	title: "OmniSale - Trang chủ",
	description: "Hệ thống quản lý bán hàng đa kênh"
});
</script>
