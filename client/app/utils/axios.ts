import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";

const getBaseURL = () => {
	const baseURL = import.meta.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000/api";
	
	console.log(baseURL);
	
	return baseURL;
};

const axiosInstance: AxiosInstance = axios.create({
	baseURL: getBaseURL(),
	timeout: 15000,
	headers: {
		"Content-Type": "application/json"
	}
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const resolveRefreshQueue = (token: string | null) => {
	refreshQueue.forEach((cb) => cb(token));
	refreshQueue = [];
};

const redirectToLogin = () => {
	localStorage.removeItem("token");
	localStorage.removeItem("refresh_token");
	localStorage.removeItem("auth_user");

	if (globalThis.window !== undefined && globalThis.window.location.pathname !== "/login") {
		globalThis.window.location.href = "/login";
	}
};

// Request interceptor - Add token to requests
axiosInstance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = localStorage.getItem("token");
    
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
    
		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

axiosInstance.interceptors.response.use(
	(response) => {
		return response.data;
	},
	async (error: AxiosError) => {
		const { response } = error;
		const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    
		if (response?.status === 401 && originalRequest && !originalRequest._retry) {
			const refreshToken = localStorage.getItem("refresh_token");

			if (!refreshToken) {
				redirectToLogin();
				throw error;
			}

			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					refreshQueue.push((newToken) => {
						if (!newToken) {
							reject(error);
							return;
						}

						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${newToken}`;
						}

						resolve(axiosInstance(originalRequest));
					});
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const refreshResponse = await axios.post(`${getBaseURL()}/auth/refresh`, {
					refresh_token: refreshToken,
				});

				const newAccessToken = refreshResponse.data?.access_token as string;
				const newRefreshToken = refreshResponse.data?.refresh_token as string;

				if (!newAccessToken || !newRefreshToken) {
					throw new Error("Invalid refresh response");
				}

				localStorage.setItem("token", newAccessToken);
				localStorage.setItem("refresh_token", newRefreshToken);

				resolveRefreshQueue(newAccessToken);

				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				}

				return axiosInstance(originalRequest);
			} catch (refreshError) {
				resolveRefreshQueue(null);
				redirectToLogin();
				throw refreshError;
			} finally {
				isRefreshing = false;
			}
		}

		if (response?.status === 401) {
			redirectToLogin();
		}
    
		throw error;
	}
);

export default axiosInstance;
