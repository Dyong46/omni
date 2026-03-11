<script setup lang="ts">
defineProps<{
	subtotal: number;
	shippingFee: number;
	total: number;
	itemCount: number;
}>();

</script>

<template>
	<UCard>
		<template #header>
			<h3 class="font-semibold">Payment</h3>
		</template>
		
		<div class="space-y-3">
			<div class="flex justify-between items-center">
				<span class="text-light">Subtotal</span>
				<span>{{ itemCount }} item{{ itemCount === 1 ? '' : 's' }}</span>
				<span class="">{{ subtotal.toLocaleString('vi-VN') }} ₫</span>
			</div>
			
			<div class="flex justify-between items-center">
				<span class="text-secondary">Shipping Fee</span>
				<span>--</span>
				<div class="flex items-center gap-2">
					<span>0 ₫</span>
				</div>
			</div>
			
			<div class=" pt-3 flex justify-between items-center">
				<span class="font-semibold">Total</span>
				<span class="font-bold">
					{{ total.toLocaleString('vi-VN') }} ₫
				</span>
			</div>
		</div>
	</UCard>
</template>
