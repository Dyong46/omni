<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import authService from "~/services/auth.service";

const fileRef = ref<HTMLInputElement>();

const profileSchema = z.object({
	name: z.string().min(2, "Too short"),
	email: z.string().email("Invalid email"),
	username: z.string().min(2, "Username must be at least 2 characters"),
	avatar: z.string().optional(),
	bio: z.string().optional()
});

type ProfileSchema = z.output<typeof profileSchema>

const authStore = useAuthStore();
const toast = useToast();
const loading = ref(false);
const loadingProfile = ref(true);

const profile = reactive<Partial<ProfileSchema>>({
	name: "",
	email: "",
	username: "",
	avatar: undefined,
	bio: undefined
});

// Load profile on mount
onMounted(async () => {
	try {
		loadingProfile.value = true;
		const response = await authService.getProfile();
		
		profile.username = response.username;
		profile.name = response.username;
		profile.email = `${response.username}@omnisale.com`;
		profile.bio = `Role: ${response.role}`;
	} catch (error: any) {
		toast.add({
			title: "Error loading profile",
			description: error.message || "Failed to load profile",
			color: "error",
			icon: "i-lucide-alert-circle"
		});
	} finally {
		loadingProfile.value = false;
	}
});

async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
	loading.value = true;
	
	try {
		const response = await authService.updateProfile({
			username: event.data.username
		});

		// Update store with new user data
		if (authStore.user) {
			authStore.user.username = response.username;
			if (import.meta.client) {
				localStorage.setItem("auth_user", JSON.stringify(authStore.user));
			}
		}

		toast.add({
			title: "Success",
			description: "Your username has been updated successfully.",
			icon: "i-lucide-check",
			color: "success"
		});
	} catch (error: any) {
		toast.add({
			title: "Update failed",
			description: error.message || "Failed to update profile",
			color: "error",
			icon: "i-lucide-alert-circle"
		});
	} finally {
		loading.value = false;
	}
}

function onFileChange(e: Event) {
	const input = e.target as HTMLInputElement;

	if (!input.files?.length) {
		return;
	}

	profile.avatar = URL.createObjectURL(input.files[0]!);
}

function onFileClick() {
	fileRef.value?.click();
}
</script>

<template>
	<div v-if="loadingProfile" class="flex items-center justify-center min-h-[400px]">
		<UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
	</div>

	<UForm
		v-else
		id="settings"
		:schema="profileSchema"
		:state="profile"
		@submit="onSubmit"
	>
		<UPageCard
			title="Profile Settings"
			description="Update your username and other profile information."
			variant="naked"
			orientation="horizontal"
			class="mb-4"
		>
			<UButton
				form="settings"
				label="Save changes"
				color="neutral"
				type="submit"
				:loading="loading"
				:disabled="loading"
				class="w-fit lg:ms-auto"
			/>
		</UPageCard>

		<UPageCard variant="subtle">
			<UFormField
				name="username"
				label="Username"
				description="Your unique username for logging in. This will be updated in the system."
				required
				class="flex max-sm:flex-col justify-between items-start gap-4"
			>
				<UInput
					v-model="profile.username"
					autocomplete="off"
					:disabled="loading"
					placeholder="Enter your username"
				/>
			</UFormField>
			<USeparator />
			<UFormField
				name="name"
				label="Display Name"
				description="How your name appears throughout the system (display only)."
				class="flex max-sm:flex-col justify-between items-start gap-4"
			>
				<UInput
					v-model="profile.name"
					autocomplete="off"
					disabled
				/>
			</UFormField>
			<USeparator />
			<UFormField
				name="email"
				label="Email"
				description="Email address for notifications (display only)."
				class="flex max-sm:flex-col justify-between items-start gap-4"
			>
				<UInput
					v-model="profile.email"
					type="email"
					autocomplete="off"
					disabled
				/>
			</UFormField>
			<USeparator />
			<UFormField
				name="avatar"
				label="Avatar"
				description="Profile picture (coming soon - display only)."
				class="flex max-sm:flex-col justify-between sm:items-center gap-4"
			>
				<div class="flex flex-wrap items-center gap-3">
					<UAvatar
						:src="profile.avatar"
						:alt="profile.username || 'User'"
						size="lg"
						:text="profile.username?.charAt(0).toUpperCase()"
					/>
					<UButton
						label="Choose"
						color="neutral"
						disabled
					/>
				</div>
			</UFormField>
			<USeparator />
			<UFormField
				name="bio"
				label="Bio"
				description="Brief description for your profile (display only)."
				class="flex max-sm:flex-col justify-between items-start gap-4"
				:ui="{ container: 'w-full' }"
			>
				<UTextarea
					v-model="profile.bio"
					:rows="3"
					autoresize
					disabled
					class="w-full"
					placeholder="Your bio..."
				/>
			</UFormField>
		</UPageCard>
	</UForm>
</template>
