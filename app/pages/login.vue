<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const schema = z.object({
	email: z.email({ message: "Invalid email address" }),
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

async function onSubmit(event: FormSubmitEvent<Schema>) {
	toast.add({ title: "Success", description: "The form has been submitted.", color: "success" });
	console.log(event.data);
}

useSeoMeta({
	title: "Đăng nhập - OmniSale"
});
</script>

<template>
	<UContainer class="py-10 flex items-center justify-center min-h-screen">
		<UCard>
			<!-- <template #header>
				<h1 class="text-2xl font-bold">
					Login
				</h1>
			</template> -->

			<UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
				<UFormField label="Email" name="email">
					<UInput v-model="state.email" />
				</UFormField>

				<UFormField label="Password" name="password">
					<UInput v-model="state.password" type="password" />
				</UFormField>

				<UButton type="submit">
					Submit
				</UButton>
			</UForm>
		</UCard>
	</UContainer>
</template>
