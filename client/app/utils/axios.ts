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
	(error: AxiosError) => {
		const { response } = error;
    
		if (response?.status === 401) {
			localStorage.removeItem("token");
      
			if (globalThis.window !== undefined && globalThis.window.location.pathname !== "/login") {
				globalThis.window.location.href = "/login";
			}
		}
    
		return Promise.reject(error);
	}
);

export default axiosInstance;
