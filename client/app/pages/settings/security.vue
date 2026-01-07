<script setup lang="ts">
import * as z from "zod";
import type { FormError, FormSubmitEvent } from "@nuxt/ui";

const passwordSchema = z.object({
	current: z.string().min(6, "Must be at least 6 characters"),
	new: z.string().min(6, "Must be at least 6 characters")
});

type PasswordSchema = z.output<typeof passwordSchema>

const authStore = useAuthStore();
const toast = useToast();
const loading = ref(false);

const password = reactive<Partial<PasswordSchema>>({
	current: undefined,
	new: undefined
});

const validate = (state: Partial<PasswordSchema>): FormError[] => {
	const errors: FormError[] = [];

	if (state.current && state.new && state.current === state.new) {
		errors.push({ name: "new", message: "Passwords must be different" });
	}
	return errors;
};

async function onSubmit(event: FormSubmitEvent<PasswordSchema>) {
	loading.value = true;

	try {
		// Send both current and new password for verification
		await $fetch("/api/users/password", {
			method: "PUT",
			body: {
				currentPassword: event.data.current,
				newPassword: event.data.new
			}
		});

		toast.add({
			title: "Success",
			description: "Your password has been updated successfully.",
			icon: "i-lucide-check",
			color: "success"
		});

		// Reset form
		password.current = undefined;
		password.new = undefined;
	} catch (error: unknown) {
		const err = error as { data?: { message?: string } };

		toast.add({
			title: "Update failed",
			description: err.data?.message || "Failed to update password",
			color: "error",
			icon: "i-lucide-alert-circle"
		});
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<UPageCard
		title="Password"
		description="Confirm your current password before setting a new one."
		variant="subtle"
	>
		<UForm
			:schema="passwordSchema"
			:state="password"
			:validate="validate"
			class="flex flex-col gap-4 max-w-xs"
			@submit="onSubmit"
		>
			<UFormField name="current" label="Current Password" required>
				<UInput
					v-model="password.current"
					type="password"
					placeholder="Enter current password"
					:disabled="loading"
					class="w-full"
				/>
			</UFormField>
			<UFormField name="new" label="New Password" required>
				<UInput
					v-model="password.new"
					type="password"
					placeholder="Enter new password"
					:disabled="loading"
					class="w-full"
				/>
			</UFormField>
			<UButton 
				label="Update Password" 
				class="w-fit" 
				type="submit"
				:loading="loading"
				:disabled="loading"
			/>
		</UForm>
	</UPageCard>
	<UPageCard
		title="Account"
		description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
		class="bg-linear-to-tl from-error/10 from-5% to-default"
	>
		<template #footer>
			<UButton label="Delete account" color="error" />
		</template>
	</UPageCard>
</template>
