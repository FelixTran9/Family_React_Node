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
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar: Danh mục sản phẩm (Chỉ hiện khi không search) */}
        {!search && (
          <div className="lg:w-1/4 xl:w-1/5 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h2 className="text-lg font-extrabold text-gray-800 mb-4 pb-3 border-b-2 border-gray-100 flex items-center">
                <span className="text-xl mr-2">📋</span> Danh mục
              </h2>
              {categories.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`text-left px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      activeCategory === 'all'
                        ? 'bg-cyan-50 text-cyan-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-cyan-600'
                    }`}
                  >
                    📦 Tất cả sản phẩm
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.MaDanhMuc}
                      onClick={() => setActiveCategory(cat.TenDanhMuc)}
                      className={`text-left px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                        activeCategory === cat.TenDanhMuc
                          ? 'bg-cyan-50 text-cyan-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-cyan-600'
                      }`}
                    >
                      {cat.TenDanhMuc}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="animate-pulse flex flex-col gap-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-10 bg-gray-100 rounded-xl"></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Content: Header + Products */}
        <div className="flex-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-100 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center">
              <span className="w-1.5 h-8 bg-cyan-600 rounded-full mr-4 block"></span>
              {title}
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {products.map(p => (
                <ProductCard key={p.product_code} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <img src="https://cdn-icons-png.flaticon.com/512/107/107135.png" alt="Not found" className="w-24 h-24 mx-auto mb-4 opacity-50 grayscale" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">Không tìm thấy sản phẩm!</h2>
              <p className="text-gray-500 mb-6">Có vẻ như danh mục này đang trống hoặc từ khóa không khớp.</p>
              <button
                onClick={() => setActiveCategory('all')}
                className="inline-block bg-cyan-600 text-white px-8 py-3 rounded-full font-bold hover:bg-cyan-700 shadow-md hover:shadow-lg transition-all"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SpecialOffers;
