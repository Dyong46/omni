<script setup lang="ts">
import type { Product } from "~/types/product";
import type { Customer } from "~/types/customer";

const toast = useToast();
const router = useRouter();

// State
const selectedProducts = ref<Array<Product & { quantity: number; selectedVariant?: string }>>([]);
const selectedCustomer = ref<Customer | null>(null);
const shippingFee = ref(0);
const orderInfo = ref({
	channel: "offline",
	warehouse: "main",
	priceList: "default",
	notes: ""
});
const submitting = ref(false);

// Computed
const subtotal = computed(() => {
	return selectedProducts.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const total = computed(() => {
	return subtotal.value + shippingFee.value;
});

// Submit order
async function submit() {
	if (selectedProducts.value.length === 0) {
		toast.add({ title: "Error", description: "Please select at least one product", color: "error" });
		return;
	}
	
	if (!selectedCustomer.value) {
		toast.add({ title: "Error", description: "Please select a customer", color: "error" });
		return;
	}
	
	submitting.value = true;
	try {
		const orderData = {
			customerId: selectedCustomer.value.id,
			channel: orderInfo.value.channel,
			items: selectedProducts.value.map(p => ({
				productId: p.id,
				quantity: p.quantity,
				price: p.price
			})),
			subtotal: subtotal.value,
			shippingFee: shippingFee.value,
			total: total.value,
			notes: orderInfo.value.notes,
			status: "new"
		};
		
		await $fetch("/api/orders", { method: "POST", body: orderData });
		toast.add({ title: "Success", description: "Order created successfully" });
		router.push("/orders");
	} catch (err: any) {
		toast.add({ title: "Error", description: err?.message || "Failed to create order", color: "error" });
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
	<UDashboardPanel id="new-order">
		<template #header>
			<UDashboardNavbar title="Create Order">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
				<template #right>
					<UButton label="Back to orders" variant="ghost" to="/orders" />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
				<!-- Left Column -->
				<div class="lg:col-span-2 space-y-6">
					<!-- Product Card -->
					<OrdersProductCard
						:selected-products="selectedProducts"
						@update:selected-products="selectedProducts = $event"
					/>
					
					<!-- Payment Card -->
					<OrdersPaymentCard
						:subtotal="subtotal"
						:shipping-fee="shippingFee"
						:total="total"
						@update:shipping-fee="shippingFee = $event"
					/>
				</div>
				
				<!-- Right Column -->
				<div class="space-y-6">
					<!-- Customer Card -->
					<OrdersCustomerCard
						:selected-customer="selectedCustomer"
						@update:selected-customer="selectedCustomer = $event"
					/>
					
					<!-- Order Info Card -->
					<OrdersOrderInfoCard
						:order-info="orderInfo"
						@update:order-info="orderInfo = $event"
					/>

					<UCard>
						<template #header>
							<h3 class="font-semibold">Notes</h3>
						</template>
						<UTextarea
							v-model="orderInfo.notes"
							placeholder="Add any notes for this order..."
							class="w-full"
						/>
					</UCard>
					
					<!-- Action Buttons -->
					<div class="flex gap-3">
						<UButton
							label="Create Order"
							color="primary"
							block
							:loading="submitting"
							@click="submit"
						/>
					</div>
				</div>
			</div>
		</template>
	</UDashboardPanel>
</template>

