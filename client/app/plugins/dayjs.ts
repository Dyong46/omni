import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export default defineNuxtPlugin(() => {
	dayjs.locale("vi");
	dayjs.extend(relativeTime);
	dayjs.extend(utc);
	dayjs.extend(timezone);

	return {
		provide: {
			dayjs
		}
	};
});
