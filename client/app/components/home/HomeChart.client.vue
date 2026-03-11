<script setup lang="ts">
import { eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format } from "date-fns";
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from "@unovis/vue";
import orderService from "~/services/order.service";
import type { Period, Range } from "~/types";

const cardRef = useTemplateRef<HTMLElement | null>("cardRef");

const props = defineProps<{
  period: Period
  range: Range
}>();

type DataRecord = {
  date: Date
  amount: number
}

const { width } = useElementSize(cardRef);
const data = ref<DataRecord[]>([]);
const loading = ref(false);
const loadError = ref<string | null>(null);

const formatKey = (date: Date): string => format(date, "yyyy-MM-dd");

function getDatesForPeriod(period: Period, range: Range): Date[] {
	if (period === "weekly") {
		return eachWeekOfInterval(range);
	}

	if (period === "monthly") {
		return eachMonthOfInterval(range);
	}

	return eachDayOfInterval(range);
}

watch([() => props.period, () => props.range.start, () => props.range.end], async () => {
	loading.value = true;
	loadError.value = null;

	try {
		const dates = getDatesForPeriod(props.period, props.range);
		const response = await orderService.getRevenueChart({
			period: props.period,
			startDate: props.range.start.toISOString(),
			endDate: props.range.end.toISOString()
		});
		const amountByDate = new Map(response.points.map(point => [point.date, point.amount]));

		data.value = dates.map(date => ({
			date,
			amount: amountByDate.get(formatKey(date)) ?? 0
		}));
	} catch (error) {
		console.error("Failed to load revenue chart:", error);
		loadError.value = "Unable to load revenue chart.";
		data.value = [];
	} finally {
		loading.value = false;
	}
}, { immediate: true });

const x = (_: DataRecord, i: number) => i;
const y = (d: DataRecord) => d.amount;

const total = computed(() => data.value.reduce((acc: number, { amount }) => acc + amount, 0));

const formatNumber = (value: number) => value.toLocaleString("vi-VN") + " ₫";

const formatDate = (date: Date): string => {
	return ({
		daily: format(date, "d MMM"),
		weekly: format(date, "d MMM"),
		monthly: format(date, "MMM yyyy")
	})[props.period];
};

const xTicks = (i: number) => {
	if (i === 0 || i === data.value.length - 1 || !data.value[i]) {
		return "";
	}

	return formatDate(data.value[i].date);
};

const template = (d: DataRecord) => `${formatDate(d.date)}: ${formatNumber(d.amount)}`;

</script>

<template>
	<UCard ref="cardRef" :ui="{ root: 'overflow-visible', body: '!px-0 !pt-0 !pb-3' }">
		<template #header>
			<div>
				<p class="text-xs text-muted uppercase mb-1.5">
					Revenue
				</p>
				<p class="text-3xl text-highlighted font-semibold">
					{{ formatNumber(total) }}
				</p>
				<p v-if="loadError" class="mt-2 text-sm text-error">
					{{ loadError }}
				</p>
			</div>
		</template>

		<div v-if="loading" class="px-6 pb-6">
			<USkeleton class="h-96 w-full" />
		</div>

		<VisXYContainer
			v-else
			:data="data"
			:padding="{ top: 40 }"
			class="h-96"
			:width="width"
		>
			<VisLine
				:x="x"
				:y="y"
				color="var(--ui-primary)"
			/>
			<VisArea
				:x="x"
				:y="y"
				color="var(--ui-primary)"
				:opacity="0.1"
			/>

			<VisAxis
				type="x"
				:x="x"
				:tick-format="xTicks"
			/>

			<VisCrosshair
				color="var(--ui-primary)"
				:template="template"
			/>

			<VisTooltip />
		</VisXYContainer>
	</UCard>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: var(--ui-bg);

  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);

  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>
