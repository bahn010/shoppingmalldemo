import axios from "axios";

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? `${process.env.REACT_APP_BACKEND_PROXY}/api/`
    : "/api/",
  headers: {  
    "Content-Type": "application/json",
  },
});


/**
 * console.log all requests and responses
 */
api.interceptors.request.use(
  (request) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Starting Request", request);
    return request;
  },
  function (error) {
    console.log("REQUEST ERROR", error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  function (error) {
    console.log("Response Error:", error);
    console.log("Error response data:", error.response?.data);
    
    // 원래 error 객체를 그대로 반환하여 response 정보 유지
    return Promise.reject(error);
  }
);

export default api;
