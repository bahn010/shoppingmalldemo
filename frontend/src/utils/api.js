import axios from "axios";

const api = axios.create({
  baseURL: `/api`,
  headers: {  
    "Content-Type": "application/json",
  },
});

// 디버깅을 위한 환경변수 로그
console.log("🔍 DEBUG - Environment Variables:");
console.log("  - REACT_APP_BACKEND_PROXY:", process.env.REACT_APP_BACKEND_PROXY);
console.log("  - REACT_APP_LOCAL_BACKEND:", process.env.REACT_APP_LOCAL_BACKEND);
console.log("  - NODE_ENV:", process.env.NODE_ENV);
/**
 * console.log all requests and responses
 */
api.interceptors.request.use(
  (request) => {
    const token = sessionStorage.getItem("token");
    console.log("🔍 DEBUG - API Request Details:");
    console.log("  - URL:", request.url);
    console.log("  - Method:", request.method);
    console.log("  - Base URL:", request.baseURL);
    console.log("  - Full URL:", request.baseURL + request.url);
    console.log("  - Token exists:", !!token);
    console.log("  - Headers:", request.headers);
    
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Starting Request", request);
    return request; 
  },
  function (error) {
    console.log("🚨 REQUEST ERROR", error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response);
    return response;
  },
  function (error) {
    console.log("🚨 API Error Details:");
    console.log("  - Error code:", error.code);
    console.log("  - Error message:", error.message);
    console.log("  - Error response:", error.response);
    console.log("  - Error config:", error.config);
    console.log("  - Error stack:", error.stack);
    
    // 네트워크 에러 처리
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('🌐 Network error - Backend server might be down or URL is incorrect');
      console.error('Current backend URL:', process.env.REACT_APP_LOCAL_BACKEND || 'http://shoppingmalldemo.ap-northeast-2.elasticbeanstalk.com');
      return Promise.reject(new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'));
    }
    
    if (error.response && error.response.data) {
      if (typeof error.response.data === 'object' && error.response.data.message) {
        return Promise.reject(new Error(error.response.data.message));
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
