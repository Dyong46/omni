<template>
	<UContainer class="py-10">
		<UCard>
			<template #header>
				<h1 class="text-2xl font-bold">
					Đăng nhập
				</h1>
			</template>

			<form class="space-y-4" @submit.prevent="handleLogin">
				<UFormGroup label="Email" name="email">
					<UInput
						v-model="form.email"
						type="email"
						placeholder="your@email.com"
					/>
				</UFormGroup>

				<UFormGroup label="Mật khẩu" name="password">
					<UInput
						v-model="form.password"
						type="password"
						placeholder="••••••••"
					/>
				</UFormGroup>

				<UButton type="submit" block>
					Đăng nhập
				</UButton>
			</form>
		</UCard>
	</UContainer>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "default"
});

const form = ref({
	email: "",
	password: ""
});

const handleLogin = () => {
	// TODO: Implement login logic
	console.log("Login:", form.value);
};

useSeoMeta({
	title: "Đăng nhập - OmniSale"
});
</script>
