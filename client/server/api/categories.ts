import { getApiBaseURL } from "../utils/api";

export default defineEventHandler(async (event) => {
	const baseURL = getApiBaseURL();

	return await $fetch(`${baseURL}/categories`);
});
