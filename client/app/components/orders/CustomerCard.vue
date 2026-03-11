<script setup lang="ts">
import customerService from "~/services/customer.service";
import type { Customer } from "~/types/customer";
import { z } from "zod";

const props = defineProps<{
	selectedCustomer: Customer | null;
}>();

const emit = defineEmits<{
	"update:selectedCustomer": [value: Customer | null];
}>();

const toast = useToast();
const customerSearchQuery = ref("");
const customerSearchError = ref("");
const isSearching = ref(false);
const phoneSchema = z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

const debouncedCustomerSearch = useDebounceFn(async (phone: string) => {
	const phoneQuery = phone.trim();

	try {
		isSearching.value = true;
		const searchedCustomers = await customerService.search(phoneQuery);
		const firstCustomer = searchedCustomers?.[0] ?? null;

		if (!firstCustomer) {
			emit("update:selectedCustomer", null);
			toast.add({ title: "Not found", description: "No customer found with this phone number", color: "warning" });
			return;
		}

		emit("update:selectedCustomer", firstCustomer);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Failed to search for customer";

		toast.add({ title: "Error", description: errorMessage, color: "error" });
	} finally {
		isSearching.value = false;
	}
}, 500);

watch(customerSearchQuery, (value) => {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		customerSearchError.value = "";
		emit("update:selectedCustomer", null);
		return;
	}

	const validationResult = phoneSchema.safeParse(trimmedValue);

	if (!validationResult.success) {
		customerSearchError.value = validationResult.error.issues[0]?.message || "Invalid input";
		emit("update:selectedCustomer", null);
		return;
	}

	customerSearchError.value = "";

	debouncedCustomerSearch(value);
});

watch(
	() => props.selectedCustomer,
	(value) => {
		if (value?.phone) {
			customerSearchQuery.value = value.phone;
		}
	},
	{ immediate: true }
);
</script>

<template>
	<UCard variant="outline">
		<template #header>
			<h3 class="font-semibold">Customer</h3>
		</template>

		<div>
			<div class="space-y-1">
				<UInput
					v-model="customerSearchQuery"
					placeholder="Enter phone number"
					icon="i-lucide-search"
					class="w-full"
				/>
				<p v-if="customerSearchError" class="text-xs text-error">{{ customerSearchError }}</p>
			</div>

			<div v-if="props.selectedCustomer" class="mt-3 rounded-md border p-3">
				<p class="font-medium">{{ props.selectedCustomer.name || "Unnamed customer" }}</p>
				<p class="text-sm text-muted">{{ props.selectedCustomer.phone }}</p>
			</div>
		</div>
	</UCard>
</template>
