/**
 * Format currency to VND
 */
export const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND"
	}).format(amount);
};

/**
 * Format date to Vietnamese format
 */
export const formatDate = (date: Date | string, format = "DD/MM/YYYY"): string => {
	const { $dayjs } = useNuxtApp();

	return $dayjs(date).format(format);
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, length: number): string => {
	if (text.length <= length) return text;
	return text.slice(0, length) + "...";
};
