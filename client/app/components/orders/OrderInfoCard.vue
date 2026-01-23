<script setup lang="ts">
const props = defineProps<{
	orderInfo: {
		channel: string;
		warehouse: string;
		priceList: string;
		notes: string;
	};
}>();

const emit = defineEmits<{
	(e: "update:orderInfo", value: typeof props.orderInfo): void;
}>();

const localOrderInfo = computed({
	get: () => props.orderInfo,
	set: (value) => emit("update:orderInfo", value)
});

</script>

<template>
	<UCard>
		<template #header>
			<h3 class="font-semibold">Other Information</h3>
		</template>
		
		<div class="space-y-4">
			<div class="flex justify-between items-center">
				<div class="block text-sm font-medium mb-2">Channel</div>
				<USelect
					v-model="localOrderInfo.channel"
					:items="['Draft', 'POS']"
					class="min-w-48"
					:ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
				/>
			</div>
			
			<div class="flex justify-between items-center">
				<div class="block text-sm font-medium mb-2">Warehouse</div>
				<USelect
					v-model="localOrderInfo.warehouse"
					:items="['All Warehouses']"
					class="min-w-48"
					:ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
				/>
			</div>
			
			<div class="flex justify-between items-center">
				<div class="block text-sm font-medium mb-2">Price List</div>
				<USelect
					v-model="localOrderInfo.priceList"
					:items="[
						{ label: 'Default Price List', value: 'default' }
					]"
					class="min-w-48"
					:ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
				/>
			</div>
		</div>
	</UCard>
</template>
