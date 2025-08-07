import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "react-router-dom";

const SearchBox = ({ searchQuery, setSearchQuery, placeholder, field }) => {
  const [query] = useSearchParams();
  const [keyword, setKeyword] = useState(query.get(field) || "");

  const handleSearch = () => {
    setSearchQuery({ ...searchQuery, page: 1, [field]: keyword });
  };

  const onCheckEnter = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="search-box">
      <FontAwesomeIcon 
        icon={faSearch} 
        onClick={handleSearch}
        style={{ cursor: "pointer" }}
      />
      <input
        type="text"
        placeholder={placeholder}
        onKeyPress={onCheckEnter}
        onChange={(event) => setKeyword(event.target.value)}
        value={keyword}
      />
    </div>
  );
};

export default SearchBox;
