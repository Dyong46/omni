<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const schema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

type Schema = z.output<typeof schema>;

definePageMeta({
	layout: "auth"
});

const state = reactive<Partial<Schema>>({
	email: undefined,
	password: undefined
});

const toast = useToast();
const loading = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
	loading.value = true;

	// Simulate API call
	await new Promise(resolve => setTimeout(resolve, 1000));

	toast.add({
		title: "Login successful",
		description: "Welcome back to OmniSale",
		color: "success",
		icon: "i-lucide-check-circle"
	});

	loading.value = false;
	console.log(event.data);

	// Navigate to home
	navigateTo("/");
}

useSeoMeta({
	title: "Login - OmniSale"
});
</script>

<template>
	<UContainer class="py-10 flex items-center justify-center min-h-screen">
		<div class="w-full max-w-md space-y-8">
			<!-- Logo & Header -->
			<div class="text-center space-y-3">
				<div class="inline-flex items-center justify-center size-14 rounded-xl bg-primary/10 ring-1 ring-primary/20">
					<UIcon name="i-lucide-shopping-bag" class="size-7 text-primary" />
				</div>
				<div>
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
						Welcome back
					</h1>
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Sign in to your OmniSale account
					</p>
				</div>
			</div>

			<!-- Login Card -->
			<UCard class="overflow-hidden">
				<div class="p-6 sm:p-8 space-y-6">
					<UForm :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
						<UFormField label="Email" name="email" required>
							<UInput
								v-model="state.email"
								type="email"
								placeholder="you@example.com"
								icon="i-lucide-mail"
								size="lg"
								:disabled="loading"
							/>
						</UFormField>

						<UFormField label="Password" name="password" required>
							<UInput
								v-model="state.password"
								type="password"
								placeholder="Enter your password"
								icon="i-lucide-lock"
								size="lg"
								:disabled="loading"
							/>
						</UFormField>

						<UButton
							type="submit"
							size="lg"
							block
							:loading="loading"
							:disabled="loading"
						>
							<span>Sign in</span>
						</UButton>
					</UForm>
				</div>
			</UCard>

			<!-- Sign up link -->
			<p class="text-center text-sm text-gray-600 dark:text-gray-400">
				Don't have an account?
				<UButton variant="link" size="sm" class="p-0 h-auto font-semibold" :padded="false" to="/register">
					Sign up
				</UButton>
			</p>
		</div>
	</UContainer>
</template>
