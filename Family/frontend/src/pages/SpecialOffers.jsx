import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/UI/ProductCard';
import API from '../services/api';

const BACKEND = 'http://localhost:5002';

const SpecialOffers = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(category || 'all');

  useEffect(() => {
    Promise.all([
      API.get('/products'),
      API.get('/categories'),
    ]).then(([prodRes, catRes]) => {
      const mapped = prodRes.data.map(sp => ({
        product_code: sp.MaSP,
        name: sp.TenSP,
        price: sp.GiaBan,
        image: sp.HinhAnh
          ? (sp.HinhAnh.startsWith('http') ? sp.HinhAnh : `${BACKEND}/uploads/${sp.HinhAnh}`)
          : '',
        category: sp.TenDanhMuc || '',
        MaDanhMuc: sp.MaDanhMuc,
        TonKho: sp.TonKho,
      }));
      setAllProducts(mapped);
      setCategories(catRes.data);
    }).catch(err => {
      console.error('Lỗi tải sản phẩm:', err);
    }).finally(() => setLoading(false));
  }, []);

  // Đồng bộ activeCategory khi URL thay đổi
  useEffect(() => {
    setActiveCategory(category || 'all');
  }, [category]);

  // Lọc sản phẩm
  const products = allProducts.filter(p => {
    if (search) return p.name.toLowerCase().includes(search.toLowerCase());
    if (activeCategory && activeCategory !== 'all') return p.category === activeCategory;
    return true;
  });

  const title = search
    ? `Kết quả tìm kiếm: "${search}" (${products.length})`
    : (activeCategory && activeCategory !== 'all' ? `Danh mục: ${activeCategory}` : `Tất cả sản phẩm (${products.length})`);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
          <span className="w-1.5 h-8 bg-cyan-600 rounded-full mr-4 block"></span>
          {title}
        </h1>
      </div>

      {/* Filter danh mục */}
      {!search && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
              activeCategory === 'all'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-cyan-50'
            }`}
          >
            Tất cả
          </button>
          {categories.map(cat => (
            <button
              key={cat.MaDanhMuc}
              onClick={() => setActiveCategory(cat.TenDanhMuc)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
                activeCategory === cat.TenDanhMuc
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-cyan-50'
              }`}
            >
              {cat.TenDanhMuc}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {products.map(p => (
            <ProductCard key={p.product_code} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <img src="https://cdn-icons-png.flaticon.com/512/107/107135.png" alt="Not found" className="w-24 h-24 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Không tìm thấy sản phẩm!</h2>
          <p className="text-gray-500 mb-4">Vui lòng thử từ khóa khác hoặc chọn danh mục khác.</p>
          <button
            onClick={() => setActiveCategory('all')}
            className="inline-block bg-cyan-600 text-white px-6 py-2 rounded-full font-bold hover:bg-cyan-700 transition"
          >
            Xem tất cả
          </button>
        </div>
      )}
    </div>
  );
};

export default SpecialOffers;
