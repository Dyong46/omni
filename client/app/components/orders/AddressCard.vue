<script setup lang="ts">
const props = defineProps<{
	shippingAddress: string;
}>();

const emit = defineEmits<{
	"update:shippingAddress": [value: string];
}>();

const cityOptions = [
	{ label: "Ho Chi Minh City", value: "Ho Chi Minh City" },
	{ label: "Ha Noi", value: "Ha Noi" },
	{ label: "Da Nang", value: "Da Nang" }
];

const wardByCity: Record<string, string[]> = {
	"Ho Chi Minh City": ["Ben Nghe", "Ben Thanh", "Vo Thi Sau", "Da Kao"],
	"Ha Noi": ["Hang Trong", "Dien Bien", "Kim Ma", "Lang Ha"],
	"Da Nang": ["Hai Chau I", "Hai Chau II", "Thach Thang", "Phuoc Ninh"]
};

const selectedCity = ref("");
const selectedWard = ref("");
const addressDetail = ref("");

const wardOptions = computed(() => {
	if (!selectedCity.value) {
		return [] as Array<{ label: string; value: string }>;
	}

	const wards = wardByCity[selectedCity.value] || [];

	return wards.map(ward => ({ label: ward, value: ward }));
});

const composedAddress = computed(() => {
	return [addressDetail.value.trim(), selectedWard.value, selectedCity.value]
		.filter(Boolean)
		.join(", ");
});

watch(composedAddress, (value) => {
	emit("update:shippingAddress", value);
}, { immediate: true });

watch(selectedCity, () => {
	selectedWard.value = "";
});

watch(() => props.shippingAddress, (value) => {
	const normalized = value.trim();

	if (!normalized) {
		addressDetail.value = "";
		selectedWard.value = "";
		selectedCity.value = "";
		return;
	}

	const parts = normalized.split(",").map(part => part.trim()).filter(Boolean);

	if (parts.length < 3) {
		addressDetail.value = normalized;
		return;
	}

	const city = parts[parts.length - 1] || "";
	const ward = parts[parts.length - 2] || "";
	const detail = parts.slice(0, -2).join(", ");

	selectedCity.value = city;
	selectedWard.value = ward;
	addressDetail.value = detail;
}, {
	immediate: true
});
</script>

<template>
	<UCard>
		<template #header>
			<h3 class="font-semibold">Shipping Address *</h3>
		</template>

		<div class="space-y-4">
			<USelect
				v-model="selectedCity"
				:items="cityOptions"
				placeholder="Select city"
				class="w-full"
			/>

			<USelect
				v-model="selectedWard"
				:items="wardOptions"
				placeholder="Select ward"
				:disabled="!selectedCity"
				class="w-full"
			/>

			<UTextarea
				v-model="addressDetail"
				placeholder="Street, building, apartment..."
				class="w-full"
			/>

			<p class="text-xs text-muted">Required: city, ward, and detailed address.</p>
		</div>
	</UCard>
</template>
