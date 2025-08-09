import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faExclamationTriangle, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { clearToastMessage } from "../../features/common/uiSlice";

const ToastMessage = () => {
  const { toastMessage } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  
  // 커스텀 토스트 컨텐츠 생성 함수
  const createToastContent = (message, status) => {
    const icons = {
      success: faCheck,
      error: faTimes,
      warning: faExclamationTriangle,
      info: faInfoCircle
    };

    return (
      <div className="toast-content">
        <div className="toast-icon">
          <FontAwesomeIcon icon={icons[status]} />
        </div>
        <span>{message}</span>
      </div>
    );
  };
  
  useEffect(() => {
    if (toastMessage && toastMessage.message !== "" && toastMessage.status !== "") {
      const { message, status } = toastMessage;
      
      // 커스텀 컨텐츠와 함께 토스트 표시
      toast[status](createToastContent(message, status), {
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        autoClose: 4000,
      });
      
      // 토스트 메시지 표시 후 상태 초기화
      dispatch(clearToastMessage());
    }
  }, [toastMessage, dispatch]);
  
  return (
    <ToastContainer
      position="top-center"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover
      theme="light"
      limit={3}
      toastClassName="custom-toast"
    />
  );
};

export default ToastMessage;
