import { config } from "@/config/config";
import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const axiosClient = axios.create({
  baseURL: config.BASE_URL,
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    const token = Cookies.get("accessToken");
    console.log(token, 'token finnaly get');

    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    return requestConfig;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;