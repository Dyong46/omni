<template>
	<div>
		{{ count }}
	</div>
</template>

<script setup lang="js">
import { storeToRefs } from "pinia";
import { useCounterStore } from "~/stores/counter";

const counterStore = useCounterStore();
const { count } = storeToRefs(counterStore);

counterStore.increment();
</script>