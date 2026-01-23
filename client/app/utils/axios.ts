import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";

// Get base URL from environment variable or fallback to localhost
const getBaseURL = () => {
	// Server-side fallback
	return process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000/api";
};

// Create axios instance
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
		// Get token from localStorage
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

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
	(response) => {
		// Return data directly
		return response.data;
	},
	(error: AxiosError) => {
		const { response } = error;
    
		// Handle 401 - Unauthorized
		if (response?.status === 401) {
			// Clear token and redirect to login
			localStorage.removeItem("token");
      
			// Only redirect if not already on login page
			if (typeof globalThis.window !== "undefined" && globalThis.window.location.pathname !== "/login") {
				globalThis.window.location.href = "/login";
			}
		}
    
		// Handle other errors
		const errorMessage = (response?.data as any)?.message || error.message || "An error occurred";
    
		return Promise.reject({
			status: response?.status,
			message: errorMessage,
			data: response?.data
		});
	}
);

export default axiosInstance;
