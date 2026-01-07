<script setup lang="ts">
import { ref } from 'vue';

const toast = useToast();
const router = useRouter();

const form = ref({
  channel: '',
  customerName: '',
  phone: '',
  email: '',
  shippingAddress: '',
  status: 'new',
  total_amount: 0
});

const submitting = ref(false);

async function submit() {
  submitting.value = true;
  try {
    await $fetch('/api/orders', { method: 'POST', body: form.value });
    toast.add({ title: 'Order created', description: 'New order created.' });
    router.push('/orders');
  } catch (err: any) {
    toast.add({ title: 'Error creating order', description: err?.message || 'Failed to create order', color: 'error' });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <UDashboardPanel id="new-order">
    <template #header>
      <UDashboardNavbar title="New Order">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Back to orders" variant="ghost" to="/orders" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-3xl">
        <UCard>
          <div class="p-6">
            <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-muted mb-1">Channel</label>
                <USelect
                  v-model="form.channel"
                  :items="[
                    { label: 'Shopee', value: 'shopee' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'Offline', value: 'offline' },
                    { label: 'Website', value: 'website' }
                  ]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-muted mb-1">Customer name</label>
                <UInput v-model="form.customerName" />
              </div>

              <div>
                <label class="block text-sm font-medium text-muted mb-1">Phone</label>
                <UInput v-model="form.phone" />
              </div>

              <div>
                <label class="block text-sm font-medium text-muted mb-1">Email</label>
                <UInput v-model="form.email" type="email" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-muted mb-1">Shipping address</label>
                <UTextarea v-model="form.shippingAddress" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-muted mb-1">Status</label>
                <USelect
                  v-model="form.status"
                  :items="[
                    { label: 'New', value: 'new' },
                    { label: 'Undelivered', value: 'undelivered' },
                    { label: 'Unpaid', value: 'unpaid' }
                  ]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-muted mb-1">Total amount</label>
                <UInput v-model="form.total_amount" type="number" />
              </div>

              <div class="md:col-span-2 flex justify-end mt-2">
                <UButton :loading="submitting" label="Create order" color="success" @click.prevent="submit" />
              </div>
            </form>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
