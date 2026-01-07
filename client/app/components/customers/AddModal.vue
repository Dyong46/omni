<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const schema = z.object({
	name: z.string().min(2, "Too short").optional(),
	email: z.string().email("Invalid email").optional(),
	phone: z.string().min(10, "Phone number must be at least 10 digits")
});

const open = ref(false);
const isLoading = ref(false);

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
	name: undefined,
	email: undefined,
	phone: undefined
});

const toast = useToast();

const emit = defineEmits<{
	success: []
}>();

async function onSubmit(event: FormSubmitEvent<Schema>) {
	isLoading.value = true;
	try {
		await $fetch("/api/customers", {
			method: "POST",
			body: event.data
		});

		toast.add({
			title: "Success",
			description: `Customer "${event.data.name || event.data.phone}" has been added`,
			color: "success"
		});

		// Reset form
		state.name = undefined;
		state.email = undefined;
		state.phone = undefined;

		open.value = false;
		emit("success");
	} catch (error) {
		toast.add({
			title: "Error",
			description: "Failed to add customer",
			color: "error"
		});
	} finally {
		isLoading.value = false;
	}
}
</script>

<template>
	<UModal v-model:open="open" title="New customer" description="Add a new customer to the database">
		<UButton label="New customer" icon="i-lucide-plus" />

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
						label="Create"
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
