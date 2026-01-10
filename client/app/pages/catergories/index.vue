<template>
	<UDashboardPanel id="categories">
		<template #header>
			<UDashboardNavbar title="Categories">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right>
					<div class="flex items-center gap-2">
						<UButton
							label="New Category"
							color="primary"
							variant="solid"
							icon="i-lucide-plus"
							@click="showForm = !showForm"
						/>
					</div>
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<div class="flex flex-col gap-4">
				<div v-if="showForm" class="p-4 bg-elevated rounded border">
					<form class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end" @submit.prevent="submit">
						<div class="sm:col-span-1">
							<UInput v-model="name" label="Name" placeholder="Category name" />
						</div>

						<div>
							<USelect v-model="parentId" :items="[{ label: 'No parent', value: null }, ...parentOptions]" label="Parent" />
						</div>

						<div class="flex items-center gap-2">
							<UButton :loading="pending" type="submit" label="Create" color="primary" />
							<UButton label="Cancel" variant="ghost" color="neutral" @click="showForm = false" />
						</div>
					</form>

					<p v-if="error" class="text-red-600 mt-2">{{ error }}</p>
					<p v-if="success" class="text-green-600 mt-2">{{ success }}</p>
				</div>

				<div class="p-4 bg-elevated rounded border">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-lg font-medium">Category tree</h3>
						<div class="text-sm text-muted">{{ totalNodes }} item(s)</div>
					</div>

					<div v-if="pending">Loading...</div>
					<div v-else>
						<ul class="space-y-2">
							<CategoryNode v-for="node in categoriesTree" :key="node.id" :node="node" />
						</ul>
						<div v-if="categoriesTree.length === 0" class="text-gray-500">No categories yet.</div>
					</div>
				</div>
			</div>
		</template>
	</UDashboardPanel>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h, onMounted } from "vue";
import categoryService, { type Category } from "~/services/category.service";

const name = ref("");
const parentId = ref<number | null>(null);
const error = ref("");
const success = ref("");
const showForm = ref(false);
const pending = ref(false);
const categoriesTree = ref<Category[]>([]);

// Fetch categories on mount
onMounted(async () => {
	await loadCategories();
});

const loadCategories = async () => {
	pending.value = true;
	try {
		categoriesTree.value = await categoryService.getTree();
	} catch (err: any) {
		error.value = err.message || "Failed to load categories";
	} finally {
		pending.value = false;
	}
};

const parentOptions = computed(() => {
	// returns items in format USelect expects: { label, value }
	const res: Array<{ label: string; value: number | null }> = [];

	function walk(nodes: any[], level = 0) {
		for (const n of nodes) {
			res.push({ label: `${"·".repeat(level)} ${n.name}`, value: n.id });
			if (n.children) walk(n.children, level + 1);
		}
	}

	walk(categoriesTree.value || []);
	return res;
});

const totalNodes = computed(() => {
	let c = 0;

	function walk(nodes: any[]) {
		for (const n of nodes) {
			c++;
			if (n.children) walk(n.children);
		}
	}
	walk(categoriesTree.value || []);
	return c;
});

async function submit() {
	error.value = "";
	success.value = "";
  
	if (!name.value || name.value.trim() === "") {
		error.value = "Name is required";
		return;
	}

	pending.value = true;
	try {
		await categoryService.create({
			name: name.value,
			parentId: parentId.value
		});
    
		success.value = "Category created successfully";
		name.value = "";
		parentId.value = null;
		showForm.value = false;
    
		// Reload categories
		await loadCategories();
	} catch (err: any) {
		error.value = err.message || "Failed to create category";
	} finally {
		pending.value = false;
	}
}

const CategoryNode = defineComponent({
	name: "CategoryNode",
	props: { node: { type: Object as () => any, required: true }},
	setup(props) {
		return () => h("li", [
			h("div", { class: "flex items-start gap-3" }, [
				h("div", { class: "flex-1" }, [
					h("div", { class: "font-medium" }, props.node.name),
					props.node.children ? h("div", { class: "text-sm text-muted mt-1" }, `Children: ${props.node.children.length}`) : null
				])
			]),
			props.node.children
				? h("ul", { class: "pl-6 mt-2 space-y-2" }, props.node.children.map((c: any) => h(CategoryNode, { node: c, key: c.id })))
				: null
		]);
	}
});

</script>
