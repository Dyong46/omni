import axios from "~/utils/axios";

export interface CheckoutSessionStatusResponse {
	sessionId: string;
	status: "open" | "complete" | "expired" | null;
	paymentStatus: "paid" | "unpaid" | "no_payment_required";
	paid: boolean;
	orderId?: number;
}

class PaymentService {
	private readonly endpoint = "/payment";

	async getSessionStatus(sessionId: string): Promise<CheckoutSessionStatusResponse> {
		return axios.get(`${this.endpoint}/session-status/${sessionId}`);
	}
}

export default new PaymentService();
