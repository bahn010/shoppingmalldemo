import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_PROXY}/api`,
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
    console.log("API Error:", error);
    
    // 네트워크 에러 처리
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network error - Backend server might be down or URL is incorrect');
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
