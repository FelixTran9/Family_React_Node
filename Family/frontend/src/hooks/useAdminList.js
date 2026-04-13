import { useState, useEffect, useCallback } from "react";
import adminApi from "../services/adminApi";

/**
 * Hook chung để fetch danh sách có pagination + search
 * @param {string} endpoint - ví dụ "/staff", "/products"
 */
const useAdminList = (endpoint) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 15;

  const fetchData = useCallback(() => {
    setLoading(true);
    adminApi.get(endpoint, { params: { q, page, limit } })
      .then((res) => {
        setData(res.data.data || res.data);
        setTotal(res.data.total || 0);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Lỗi tải dữ liệu"))
      .finally(() => setLoading(false));
  }, [endpoint, q, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (value) => {
    setQ(value);
    setPage(1);
  };

  return { data, total, page, setPage, q, handleSearch, loading, error, fetchData, totalPages, limit };
};

export default useAdminList;
