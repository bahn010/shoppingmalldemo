import React, { useEffect } from "react";
import ProductCard from "./components/ProductCard";
import { Row, Col, Container } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";
import { ColorRing } from "react-loader-spinner";
import { getProductList } from "../../features/product/productSlice";

const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useSearchParams();

  const productList = useSelector((state) => state.product.productList);
  const totalPageNum = useSelector((state) => state.product.totalPageNum);
  const loading = useSelector((state) => state.product.loading);
  const name = query.get("name") || "";
  const page = query.get("page") || 1;

  // 페이지 로드 시 검색 조건이 있으면 초기화
  useEffect(() => {
    if (name) {
      // 검색 조건이 있으면 초기화
      setQuery({ page: "1" });
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  useEffect(() => {
    dispatch(
      getProductList({
        name,
        page,
      })
    );
  }, [name, page, dispatch]);

  const handlePageClick = ({ selected }) => {
    const newPage = selected + 1;
    const searchParams = new URLSearchParams();
    if (name) searchParams.set("name", name);
    searchParams.set("page", newPage);
    navigate(`?${searchParams.toString()}`);
  };

  // 로딩 중일 때 로딩 스피너 표시
  if (loading) {
    return (
      <Container className="display-center" style={{ minHeight: "400px" }}>
        <ColorRing
          visible={true}
          height="60"
          width="60"
          ariaLabel="loading"
          wrapperStyle={{}}
          wrapperClass=""
          colors={["#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6"]}
        />
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        {productList.length > 0 ? (
          productList.map((item) => (
            <Col md={3} sm={12} key={item._id}>
              <ProductCard item={item} />
            </Col>
          ))
        ) : (
          <div className="text-center" style={{ padding: "50px 0" }}>
            {name === "" ? (
              <h3></h3>
            ) : (
              <h3>일치하는 상품이 없습니다</h3>
            )}
            <p className="text-muted">
              {name === "" ? "새로운 상품을 기다려주세요." : "검색 조건을 변경해보세요."}
            </p>
          </div>
        )}
      </Row>
      
      {totalPageNum > 1 && productList.length > 0 && (
        <ReactPaginate
          nextLabel={<FontAwesomeIcon icon={faChevronRight} />}
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={totalPageNum}
          forcePage={parseInt(page) - 1}
          previousLabel={<FontAwesomeIcon icon={faChevronLeft} />}
          firstLabel={<FontAwesomeIcon icon={faAngleDoubleLeft} />}
          lastLabel={<FontAwesomeIcon icon={faAngleDoubleRight} />}
          renderOnZeroPageCount={null}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          firstClassName="page-item"
          firstLinkClassName="page-link"
          lastClassName="page-item"
          lastLinkClassName="page-link"
          breakLabel="..."
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination"
          activeClassName="active"
          className="display-center list-style-none"
        />
      )}
    </Container>
  );
};

export default LandingPage;
