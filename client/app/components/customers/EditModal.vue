<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import customerService, { type Customer } from "~/services/customer.service";

const props = defineProps<{
	customer: Customer | null
}>();

const schema = z.object({
	name: z.string().min(2, "Too short").optional(),
	email: z.string().email("Invalid email").optional(),
	phone: z.string().min(10, "Phone number must be at least 10 digits")
});

const open = ref(false);
const isLoading = ref(false);

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
	name: undefined,
	email: undefined,
	phone: undefined
});

const toast = useToast();

const emit = defineEmits<{
	success: []
}>();

// Watch for customer changes and update state
watch(() => props.customer, (newCustomer) => {
	if (newCustomer && open.value) {
		state.name = newCustomer.name;
		state.email = newCustomer.email;
		state.phone = newCustomer.phone;
	}
}, { immediate: true });

watch(() => open.value, (isOpen) => {
	if (isOpen && props.customer) {
		state.name = props.customer.name;
		state.email = props.customer.email;
		state.phone = props.customer.phone;
	}
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
	if (!props.customer) return;

	isLoading.value = true;
	try {
		await customerService.update(props.customer.id, {
			name: event.data.name,
			email: event.data.email,
			phone: event.data.phone
		});

		toast.add({
			title: "Success",
			description: `Customer "${event.data.name || event.data.phone}" has been updated`,
			color: "success"
		});

		open.value = false;
		emit("success");
	} catch (error: any) {
		toast.add({
			title: "Error",
			description: error.message || "Failed to update customer",
			color: "error"
		});
	} finally {
		isLoading.value = false;
	}
}

defineExpose({ open });
</script>

<template>
	<UModal
		v-model:open="open"
		:title="`Edit customer`"
		description="Update customer information"
	>
		<template #body>
			<UForm
				:schema="schema"
				:state="state"
				class="space-y-4"
				@submit="onSubmit"
			>
				<UFormField label="Name" placeholder="John Doe" name="name">
					<UInput v-model="state.name" class="w-full" />
				</UFormField>

				<UFormField label="Email" placeholder="john.doe@example.com" name="email">
					<UInput v-model="state.email" class="w-full" />
				</UFormField>

				<UFormField label="Phone" placeholder="0901234567" name="phone" required>
					<UInput v-model="state.phone" class="w-full" />
				</UFormField>

				<div class="flex justify-end gap-2">
					<UButton
						label="Cancel"
						color="neutral"
						variant="subtle"
						@click="open = false"
					/>
					<UButton
						label="Update"
						color="primary"
						variant="solid"
						type="submit"
						:loading="isLoading"
					/>
				</div>
			</UForm>
		</template>
	</UModal>
</template>
