import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_PROXY}/api/`,
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
    
    if (error.response && error.response.data) {
      // 백엔드에서 보낸 에러 메시지가 있는 경우
      if (typeof error.response.data === 'object' && error.response.data.message) {
        return Promise.reject(new Error(error.response.data.message));
      }
      // 문자열로 직접 에러 메시지가 온 경우
      if (typeof error.response.data === 'string') {
        return Promise.reject(new Error(error.response.data));
      }
      return Promise.reject(new Error(error.response.data));
    }
    
    // 네트워크 에러 등 기타 에러
    return Promise.reject(new Error(error.message || "네트워크 오류가 발생했습니다."));
  }
);

export default api;
