import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";
import SearchBox from "../../common/component/SearchBox";
import NewItemDialog from "./component/NewItemDialog";
import ProductTable from "./component/ProductTable";
import {
  getProductList,
  deleteProduct,
  setSelectedProduct,
} from "../../features/product/productSlice";

const AdminProductPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useSearchParams();
  const dispatch = useDispatch();
  const { productList, totalPageNum } = useSelector((state) => state.product);
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    page: query.get("page") || 1,
    name: query.get("name") || "",
  }); //검색 조건들을 저장하는 객체

  const [mode, setMode] = useState("new");

  // 새로고침 시 검색 조건 초기화
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 새로고침 시 검색 조건을 localStorage에 저장
      if (searchQuery.name || searchQuery.page !== 1) {
        localStorage.setItem('wasSearching', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [searchQuery.name, searchQuery.page]);

  // 페이지 로드 시 이전에 검색 중이었다면 검색 조건 초기화
  useEffect(() => {
    const wasSearching = localStorage.getItem('wasSearching');
    if (wasSearching === 'true') {
      localStorage.removeItem('wasSearching');
      navigate("/");
    }
  }, [navigate]);

  const tableHeader = [
    "#",
    "Sku",
    "Name",
    "Price",
    "Stock",
    "Image",
    "Status",
    "",
  ];


  useEffect(() => {
    dispatch(getProductList({...searchQuery}));
  }, []);
  
  useEffect(() => {

    if (searchQuery.name === "") {
      delete searchQuery.name;
    }
    navigate(`?page=${searchQuery.page}&name=${searchQuery.name}`);
    dispatch(getProductList(searchQuery));
  }, [searchQuery, navigate, dispatch]);

  const deleteItem = (id) => {
    //아이템 삭제하기
    if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      dispatch(deleteProduct({ id, searchQuery }));
    }
  };

  const openEditForm = (product) => {
    setMode("edit");
    dispatch(setSelectedProduct(product));
    setShowDialog(true);
  };

  const handleClickNewItem = () => {
    setMode("new");
    setShowDialog(true);
  };

  const handlePageClick = ({ selected }) => {
    setSearchQuery({...searchQuery, page: selected + 1 });
  };

  return (
    <div className="locate-center">
      <Container>
        <div className="mt-2">
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="제품 이름으로 검색"
            field="name"
          />
        </div>
        <Button className="mt-2 mb-2" onClick={handleClickNewItem} variant="secondary">
          Add New Item +
        </Button>

        <ProductTable
          header={tableHeader}
          data={productList}
          deleteItem={deleteItem}
          openEditForm={openEditForm}
          searchQuery={searchQuery}
        />
        {totalPageNum > 1 && productList.length > 0 && (
          <ReactPaginate
            nextLabel={<FontAwesomeIcon icon={faChevronRight} />}
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={totalPageNum}
            forcePage={searchQuery.page - 1}
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

      <NewItemDialog
        mode={mode}
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default AdminProductPage;
