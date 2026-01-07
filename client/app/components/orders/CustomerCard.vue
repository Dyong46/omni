<script setup lang="ts">
import type { Customer } from "~/types/customer";

const props = defineProps<{
	selectedCustomer: Customer | null;
}>();

const emit = defineEmits<{
	(e: "update:selectedCustomer", value: Customer | null): void;
}>();

const toast = useToast();
const customerSearchQuery = ref("");
const customers = ref<Customer[]>([]);
const showCustomerDropdown = ref(false);
const showCreateCustomerModal = ref(false);
const newCustomer = ref({ name: "", phone: "", email: "" });

// Customer search with debounce
const debouncedCustomerSearch = useDebounceFn(async () => {
	if (!customerSearchQuery.value.trim()) {
		customers.value = [];
		showCustomerDropdown.value = false;
		return;
	}
	
	try {
		const response = await $fetch<any>(`/api/customers?phone=${customerSearchQuery.value}`);

		customers.value = response.data || response || [];
		showCustomerDropdown.value = true;
	} catch (error) {
		console.error("Error searching customers:", error);
		customers.value = [];
		showCustomerDropdown.value = true;
	}
}, 500);

watch(customerSearchQuery, () => {
	debouncedCustomerSearch();
});

function selectCustomer(customer: Customer) {
	emit("update:selectedCustomer", customer);
	customerSearchQuery.value = customer.phone;
	showCustomerDropdown.value = false;
}

function openCreateCustomerModal() {
	newCustomer.value = { name: "", phone: customerSearchQuery.value, email: "" };
	showCreateCustomerModal.value = true;
	showCustomerDropdown.value = false;
}

async function createCustomer() {
	try {
		const response = await $fetch<any>("/api/customers", {
			method: "POST",
			body: newCustomer.value
		});
		const createdCustomer = response.data || response;

		emit("update:selectedCustomer", createdCustomer);
		customerSearchQuery.value = createdCustomer.phone;
		showCreateCustomerModal.value = false;
		toast.add({ title: "Success", description: "Customer created successfully" });
	} catch (error: any) {
		toast.add({ title: "Error", description: error?.message || "Failed to create customer", color: "error" });
	}
}
</script>

<template>
	<UCard variant="outline">
		<template #header>
			<h3 class="font-semibold">Customer</h3>
		</template>
		
		<div>
			<!-- Customer Search -->
			<div class="relative">
				<UInput
					v-model="customerSearchQuery"
					placeholder="Search phone customer"
					icon="i-lucide-search"
					class="w-full"
				/>
			</div>
		</div>
	</UCard>
	
	<!-- Create Customer Modal -->
	<UModal v-model="showCreateCustomerModal">
		<template #body>
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold">Create New Customer</h3>
						<UButton
							icon="i-lucide-x"
							color="primary"
							variant="ghost"
							@click="showCreateCustomerModal = false"
						/>
					</div>
				</template>
				
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium mb-2">Phone Number *</label>
						<UInput
							v-model="newCustomer.phone"
							placeholder="Enter phone number"
							size="lg"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium mb-2">Customer Name</label>
						<UInput
							v-model="newCustomer.name"
							placeholder="Enter customer name"
							size="lg"
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium mb-2">Email</label>
						<UInput
							v-model="newCustomer.email"
							type="email"
							placeholder="Enter email"
							size="lg"
						/>
					</div>
				</div>
				
				<template #footer>
					<div class="flex justify-end gap-3">
						<UButton
							label="Cancel"
							variant="outline"
							@click="showCreateCustomerModal = false"
						/>
						<UButton
							label="Create Customer"
							color="primary"
							:disabled="!newCustomer.phone"
							@click="createCustomer"
						/>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>
</template>
