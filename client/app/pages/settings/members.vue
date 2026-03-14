<script setup lang="ts">
import authService, { type AuthUser } from "~/services/auth.service";

const toast = useToast();
const authStore = useAuthStore();

if (!authStore.isAuthenticated && import.meta.client) {
	authStore.initAuth();
}

const currentUser = computed(() => authStore.user as { role?: string } | null);
const isAdmin = computed(() => currentUser.value?.role === "admin");

if (import.meta.client && authStore.isAuthenticated && !isAdmin.value) {
	await navigateTo("/");
}

const users = ref<AuthUser[]>([]);
const q = ref("");
const loading = ref(false);

const createOpen = ref(false);
const createForm = reactive({
	username: "",
	password: ""
});
const creating = ref(false);

const editOpen = ref(false);
const editForm = reactive({
	id: 0,
	username: "",
	password: ""
});
const updating = ref(false);
const deletingId = ref<number | null>(null);

const filteredUsers = computed(() => {
	const query = q.value.trim().toLowerCase();

	if (!query) return users.value;

	return users.value.filter((user) =>
		user.username.toLowerCase().includes(query)
	);
});

async function loadUsers() {
	loading.value = true;
	try {
		users.value = await authService.getUsers();
	} catch (error) {
		console.error("Failed to load users", error);
		toast.add({ title: "Error", description: "Failed to load members", color: "error" });
	} finally {
		loading.value = false;
	}
}

function resetCreateForm() {
	createForm.username = "";
	createForm.password = "";
}

async function createUser() {
	if (!createForm.username.trim() || !createForm.password.trim()) {
		toast.add({ title: "Error", description: "Username and password are required", color: "error" });
		return;
	}

	creating.value = true;
	try {
		const created = await authService.createUser({
			username: createForm.username.trim(),
			password: createForm.password
		});

		users.value.unshift(created);
		createOpen.value = false;
		resetCreateForm();
		toast.add({ title: "Success", description: "Member created", color: "success" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to create member";

		toast.add({ title: "Error", description: message, color: "error" });
	} finally {
		creating.value = false;
	}
}

function openEdit(user: AuthUser) {
	editForm.id = user.id;
	editForm.username = user.username;
	editForm.password = "";
	editOpen.value = true;
}

async function updateUser() {
	if (!editForm.username.trim()) {
		toast.add({ title: "Error", description: "Username is required", color: "error" });
		return;
	}

	updating.value = true;
	try {
		const payload: { username?: string; password?: string } = {
			username: editForm.username.trim()
		};

		if (editForm.password.trim()) {
			payload.password = editForm.password;
		}

		const updated = await authService.updateUser(editForm.id, payload);

		users.value = users.value.map((u) => (u.id === updated.id ? updated : u));
		editOpen.value = false;
		toast.add({ title: "Success", description: "Member updated", color: "success" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to update member";

		toast.add({ title: "Error", description: message, color: "error" });
	} finally {
		updating.value = false;
	}
}

async function deleteUser(user: AuthUser) {
	if (deletingId.value) return;

	deletingId.value = user.id;
	try {
		await authService.deleteUser(user.id);
		users.value = users.value.filter((u) => u.id !== user.id);
		toast.add({ title: "Success", description: "Member deleted", color: "success" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Failed to delete member";

		toast.add({ title: "Error", description: message, color: "error" });
	} finally {
		deletingId.value = null;
	}
}

onMounted(() => {
	if (isAdmin.value) {
		loadUsers();
	}
});
</script>

<template>
	<div v-if="!isAdmin" class="p-4">
		<UAlert color="error" title="Access denied" description="Only admin can access members management." />
	</div>

	<div v-else>
		<UPageCard
			title="Members"
			description="Manage user accounts (role=user)."
			variant="naked"
			orientation="horizontal"
			class="mb-4"
		>
			<UButton
				label="Add user"
				icon="i-lucide-user-plus"
				color="primary"
				class="w-fit lg:ms-auto"
				@click="createOpen = true"
			/>
		</UPageCard>

		<UPageCard variant="subtle" :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
			<template #header>
				<UInput
					v-model="q"
					icon="i-lucide-search"
					placeholder="Search username"
					class="w-full"
				/>
			</template>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-default text-left text-muted">
							<th class="px-4 py-3">ID</th>
							<th class="px-4 py-3">Username</th>
							<th class="px-4 py-3">Role</th>
							<th class="px-4 py-3">Created</th>
							<th class="px-4 py-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						<tr v-if="loading">
							<td colspan="5" class="px-4 py-6 text-center text-muted">Loading...</td>
						</tr>
						<tr v-else-if="filteredUsers.length === 0">
							<td colspan="5" class="px-4 py-6 text-center text-muted">No users found</td>
						</tr>
						<tr v-for="user in filteredUsers" :key="user.id" class="border-b border-default/50">
							<td class="px-4 py-3">{{ user.id }}</td>
							<td class="px-4 py-3 font-medium">{{ user.username }}</td>
							<td class="px-4 py-3">
								<UBadge color="neutral" variant="subtle">{{ user.role }}</UBadge>
							</td>
							<td class="px-4 py-3 text-muted">{{ new Date(user.createdAt).toLocaleString("vi-VN") }}</td>
							<td class="px-4 py-3">
								<div class="flex justify-end gap-2">
									<UButton label="Edit" size="xs" variant="outline" @click="openEdit(user)" />
									<UButton
										label="Delete"
										size="xs"
										color="error"
										variant="soft"
										:loading="deletingId === user.id"
										@click="deleteUser(user)"
									/>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</UPageCard>

		<UModal v-model:open="createOpen" title="Add user" description="Create a new user account with role user.">
			<template #body>
				<div class="space-y-3">
					<div class="space-y-1">
						<p class="text-sm font-medium text-highlighted">Username</p>
						<UInput v-model="createForm.username" placeholder="Enter username" />
					</div>
					<div class="space-y-1">
						<p class="text-sm font-medium text-highlighted">Password</p>
						<UInput v-model="createForm.password" type="password" placeholder="Enter password" />
					</div>
				</div>
			</template>
			<template #footer>
				<div class="flex justify-end gap-2 w-full">
					<UButton label="Cancel" variant="outline" @click="createOpen = false" />
					<UButton label="Create" color="primary" :loading="creating" @click="createUser" />
				</div>
			</template>
		</UModal>

		<UModal v-model:open="editOpen" title="Edit user" description="Update username or password.">
			<template #body>
				<div class="space-y-3">
					<div class="space-y-1">
						<p class="text-sm font-medium text-highlighted">Username</p>
						<UInput v-model="editForm.username" placeholder="Enter username" />
					</div>
					<div class="space-y-1">
						<p class="text-sm font-medium text-highlighted">New password</p>
						<UInput v-model="editForm.password" type="password" placeholder="Leave empty to keep current password" />
					</div>
				</div>
			</template>
			<template #footer>
				<div class="flex justify-end gap-2 w-full">
					<UButton label="Cancel" variant="outline" @click="editOpen = false" />
					<UButton label="Save" color="primary" :loading="updating" @click="updateUser" />
				</div>
			</template>
		</UModal>
	</div>
</template>
