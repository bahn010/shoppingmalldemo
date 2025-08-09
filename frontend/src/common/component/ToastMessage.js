import React from "react";
import { useEffect } from "react";
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
  
  // 페이지 이동 시 모든 토스트 제거
  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);
  
  useEffect(() => {
    if (toastMessage && toastMessage.message !== "" && toastMessage.status !== "") {
      const { message, status } = toastMessage;
      
      // 기존 토스트 제거
      toast.dismiss();
      
      // 아이콘 선택
      const getIcon = (status) => {
        const icons = {
          success: faCheck,
          error: faTimes,
          warning: faExclamationTriangle,
          info: faInfoCircle
        };
        return icons[status] || faInfoCircle;
      };

      // 단순한 토스트 콘텐츠
      const ToastContent = ({ message, status, closeToast }) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              marginRight: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              fontSize: '10px'
            }}>
              <FontAwesomeIcon icon={getIcon(status)} />
            </div>
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              flex: 1
            }}>
              {message}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              closeToast();
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.15)',
              border: 'none',
              borderRadius: '4px',
              color: 'rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              marginLeft: '8px',
              flexShrink: 0,
              transition: 'all 0.2s ease',
              fontSize: '12px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(0, 0, 0, 0.25)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(0, 0, 0, 0.15)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      );

      // 토스트 표시
      toast[status](
        ({ closeToast }) => <ToastContent message={message} status={status} closeToast={closeToast} />,
        {
          position: "top-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
          pauseOnFocusLoss: false,
          closeButton: false,
        }
      );
      
      dispatch(clearToastMessage());
    }
  }, [toastMessage, dispatch]);
  
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
    />
  );
};

export default ToastMessage;
