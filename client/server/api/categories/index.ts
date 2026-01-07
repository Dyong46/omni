export default defineEventHandler(async (event) => {
	return await apiCall(event, "/categories");
});
