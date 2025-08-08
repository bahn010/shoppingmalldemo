import React, { Component } from "react";
import { Button } from "react-bootstrap";
import "../App.css";
import "../common/style/common.style.css";

const CLOUDNAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOADPRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

class CloudinaryUploadWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scriptLoaded: false,
      loading: true
    };
  }

  componentDidMount() {
    // 환경변수 검증
    if (!CLOUDNAME || !UPLOADPRESET) {
      console.error("Cloudinary 환경변수가 설정되지 않았습니다:", {
        CLOUDNAME,
        UPLOADPRESET
      });
      this.setState({ loading: false });
      return;
    }

    // Cloudinary 스크립트 로딩을 기다림
    this.loadCloudinaryScript();
  }

  loadCloudinaryScript = () => {
    // 이미 스크립트가 로드되어 있는지 확인
    if (window.cloudinary && window.cloudinary.createUploadWidget) {
      this.setState({ scriptLoaded: true, loading: false });
      this.initializeWidget();
      return;
    }

    // 스크립트가 이미 로드 중인지 확인
    if (document.querySelector('script[src*="widget.cloudinary.com"]')) {
      this.waitForCloudinary();
      return;
    }

    // 스크립트를 동적으로 로드
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.type = 'text/javascript';
    script.async = true;
    
    script.onload = () => {
      console.log("Cloudinary 스크립트 로딩 완료");
      this.setState({ scriptLoaded: true, loading: false });
      this.initializeWidget();
    };
    
    script.onerror = () => {
      console.error("Cloudinary 스크립트 로딩 실패");
      this.setState({ loading: false });
    };

    document.head.appendChild(script);
  };

  waitForCloudinary = () => {
    const maxAttempts = 30; // 더 많은 시도 횟수
    let attempts = 0;

    const checkCloudinary = () => {
      attempts++;
      
      if (window.cloudinary && window.cloudinary.createUploadWidget) {
        console.log("Cloudinary 스크립트 로딩 완료");
        this.setState({ scriptLoaded: true, loading: false });
        this.initializeWidget();
      } else if (attempts < maxAttempts) {
        console.log(`Cloudinary 스크립트 로딩 대기 중... (${attempts}/${maxAttempts})`);
        setTimeout(checkCloudinary, 200); // 더 짧은 간격
      } else {
        console.error("Cloudinary 스크립트 로딩 실패 - 브라우저 새로고침을 시도해보세요");
        this.setState({ loading: false });
      }
    };

    checkCloudinary();
  };

  initializeWidget = () => {
    try {
      if (!window.cloudinary || !window.cloudinary.createUploadWidget) {
        console.error("Cloudinary가 아직 로드되지 않았습니다.");
        return;
      }

      var myWidget = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUDNAME,
          uploadPreset: UPLOADPRESET,
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            console.log("Done! Here is the image info: ", result.info);
            const uploadedImageElement = document.getElementById("uploadedimage");
            if (uploadedImageElement) {
              uploadedImageElement.setAttribute("src", result.info.secure_url);
            }
            this.props.uploadImage(result.info.secure_url);
          } else if (error) {
            console.error("Upload error:", error);
          }
        }
      );

      const uploadWidgetElement = document.getElementById("upload_widget");
      if (uploadWidgetElement) {
        uploadWidgetElement.addEventListener(
          "click",
          function () {
            myWidget.open();
          },
          false
        );
      }
    } catch (error) {
      console.error("Cloudinary 위젯 초기화 오류:", error);
    }
  };

  render() {
    // 환경변수가 없으면 업로드 버튼을 비활성화
    if (!CLOUDNAME || !UPLOADPRESET) {
      return (
        <Button size="sm" className="ml-2" disabled>
          환경변수 설정 필요
        </Button>
      );
    }

    // 로딩 중이면 로딩 버튼 표시
    if (this.state.loading) {
      return (
        <Button size="sm" className="ml-2" disabled>
          로딩 중...
        </Button>
      );
    }

    return (
      <Button id="upload_widget" size="sm" className="ml-2">
        Upload Image +
      </Button>
    );
  }
}

export default CloudinaryUploadWidget;
