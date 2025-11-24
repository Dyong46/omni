export default defineEventHandler((event) => {
	console.log("Hello API called", event);
	return {
		hello: "world"
	};
});
