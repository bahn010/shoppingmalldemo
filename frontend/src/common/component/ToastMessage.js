import React from "react";
import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faExclamationTriangle, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { clearToastMessage } from "../../features/common/uiSlice";

const ToastMessage = () => {
  const { toastMessage } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const location = useLocation();
  
  const createToastContent = (message, status, toastId) => {
    const icons = {
      success: faCheck,
      error: faTimes,
      warning: faExclamationTriangle,
      info: faInfoCircle
    };

    const handleCustomClose = (e) => {
      e.stopPropagation();
      toast.dismiss(toastId);
      // 강제 제거도 시도
      setTimeout(() => {
        const toastElements = document.querySelectorAll(`[data-testid="${toastId}"]`);
        toastElements.forEach(el => el.remove());
      }, 50);
    };

    return (
      <div className="toast-content">
        <div className="toast-icon">
          <FontAwesomeIcon icon={icons[status]} />
        </div>
        <span>{message}</span>
        <button 
          className="custom-toast-close" 
          onClick={handleCustomClose}
          type="button"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    );
  };

  // 모든 토스트 강제 제거 함수
  const dismissAllToasts = useCallback(() => {
    toast.dismiss();
    // DOM에서 직접 제거 (강제)
    setTimeout(() => {
      const toastElements = document.querySelectorAll('.Toastify__toast-container .Toastify__toast');
      toastElements.forEach(el => el.remove());
    }, 100);
  }, []);


  useEffect(() => {
    dismissAllToasts();
  }, [location.pathname, dismissAllToasts]);
  
  useEffect(() => {
    if (toastMessage && toastMessage.message !== "" && toastMessage.status !== "") {
      const { message, status } = toastMessage;
      
      dismissAllToasts();
      
      setTimeout(() => {
        const toastId = `${status}-${Date.now()}`;
        toast[status](createToastContent(message, status, toastId), {
          toastId: toastId,
          position: "top-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false, // 커스텀 버튼만 사용
          pauseOnHover: false,
          draggable: false, 
          pauseOnFocusLoss: false,
          closeButton: false, // 기본 닫기 버튼 비활성화
        });
      }, 150);
      
      dispatch(clearToastMessage());
    }
  }, [toastMessage, dispatch, dismissAllToasts]);
  
  return (
    <ToastContainer
      position="top-left"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss={false}
      draggable={false}
      pauseOnHover={false}
      theme="light"
      limit={1}
      closeButton={false}
      enableMultiContainer={false}
      containerId="main-toast-container"
      toastClassName="custom-toast"
    />
  );
};

export default ToastMessage;
