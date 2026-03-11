<script setup lang="ts">
import type { Product } from "~/types/product";
import type { Customer } from "~/types/customer";
import orderService, { type CreateOrderDto } from "~/services/order.service";
import paymentService from "~/services/payment.service";

const toast = useToast();
const router = useRouter();

// State
const selectedProducts = ref<Array<Product & { quantity: number; selectedVariant?: string }>>([]);
const selectedCustomer = ref<Customer | null>(null);
const shippingAddress = ref("");
const shippingFee = ref(0);
const orderInfo = ref({
	channel: "offline",
	warehouse: "main",
	priceList: "default",
	notes: ""
});
const submitting = ref(false);
const showCheckoutQrModal = ref(false);
const checkoutUrl = ref("");
const checkoutSessionId = ref("");
const orderId = ref("");
const paymentPolling = ref(false);
let paymentPollingTimer: ReturnType<typeof setInterval> | null = null;

// Computed
const subtotal = computed(() => {
	return selectedProducts.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const itemCount = computed(() => {
	return selectedProducts.value.reduce((sum, item) => sum + item.quantity, 0);
});

const total = computed(() => {
	return subtotal.value + shippingFee.value;
});

const checkoutQrUrl = computed(() => {
	if (!checkoutUrl.value) return "";
	return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(checkoutUrl.value)}`;
});

async function copyCheckoutUrl() {
	if (!checkoutUrl.value) return;

	await navigator.clipboard.writeText(checkoutUrl.value);
	toast.add({ title: "Copied", description: "Payment link copied to clipboard" });
}

function stopPaymentPolling() {
	if (paymentPollingTimer) {
		clearInterval(paymentPollingTimer);
		paymentPollingTimer = null;
	}
	paymentPolling.value = false;
}

function startPaymentPolling() {
	if (!checkoutSessionId.value || paymentPolling.value) return;

	paymentPolling.value = true;
	paymentPollingTimer = setInterval(async () => {
		try {
			const status = await paymentService.getSessionStatus(checkoutSessionId.value);

			if (status.paid) {
				stopPaymentPolling();
				showCheckoutQrModal.value = false;
				toast.add({ title: "Payment Success", description: "Customer payment has been completed." });
				// Add delay to ensure toast is displayed before navigation
				await new Promise(resolve => setTimeout(resolve, 500));
				router.push(`/orders/${orderId.value}`);
			}
		} catch {
			// Keep polling; transient errors can happen when network is unstable.
		}
	}, 3000);
}

// Watch for modal close and stop polling if user exits
watch(showCheckoutQrModal, (isOpen) => {
	if (!isOpen) {
		stopPaymentPolling();
	}
});

onBeforeUnmount(() => {
	stopPaymentPolling();
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

	const normalizedShippingAddress = shippingAddress.value.trim();

	if (!normalizedShippingAddress) {
		toast.add({ title: "Error", description: "Please enter shipping address", color: "error" });
		return;
	}
	
	submitting.value = true;
	try {
		const orderData: CreateOrderDto = {
			channel: orderInfo.value.channel as CreateOrderDto["channel"],
			customerName: selectedCustomer.value.name,
			phone: selectedCustomer.value.phone,
			email: selectedCustomer.value.email,
			shippingAddress: normalizedShippingAddress,
			items: selectedProducts.value.map(p => ({
				productId: p.id,
				quantity: p.quantity,
				price: p.price
			})),
			status: "new"
		};
		
		const response = await orderService.create(orderData);

		if (response.checkoutUrl) {
			orderId.value = response.order.id.toString();
			checkoutUrl.value = response.checkoutUrl;
			checkoutSessionId.value = response.sessionId;
			showCheckoutQrModal.value = true;
			startPaymentPolling();
			toast.add({ title: "Success", description: "QR payment is ready. Ask customer to scan." });
			return;
		}

		toast.add({ title: "Success", description: "Order created successfully" });
		router.push("/orders");
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Failed to create order";

		toast.add({ title: "Error", description: message, color: "error" });
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

					<OrdersAddressCard
						:shipping-address="shippingAddress"
						@update:shipping-address="shippingAddress = $event"
					/>
					
					<!-- Payment Card -->
					<OrdersPaymentCard
						:subtotal="subtotal"
						:shipping-fee="shippingFee"
						:total="total"
						:item-count="itemCount"
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

			<UModal v-model:open="showCheckoutQrModal" title="Scan to Pay">
				<template #body>
					<div class="flex flex-col items-center gap-4 py-2">
						<img
							v-if="checkoutQrUrl"
							:src="checkoutQrUrl"
							alt="Stripe checkout QR"
							class="w-64 h-64 rounded-lg border border-default"
						>
						<p class="text-sm text-muted text-center">
							Customer can scan this QR code using their phone to open Stripe Checkout.
						</p>
						<UInput
							:model-value="checkoutUrl"
							readonly
							class="w-full"
						/>
					</div>
				</template>

				<template #footer>
					<div class="flex w-full gap-2">
						<UButton
							label="Copy payment link"
							variant="outline"
							class="flex-1"
							@click="copyCheckoutUrl"
						/>
						<UButton
							label="Done"
							class="flex-1"
							@click="stopPaymentPolling(); showCheckoutQrModal = false; router.push(`/orders/${orderId}`)"
						/>
					</div>
				</template>
			</UModal>
		</template>
	</UDashboardPanel>
</template>

