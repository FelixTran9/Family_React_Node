import { Link } from 'react-router-dom';
import CategoryCard from '../components/UI/CategoryCard';
import ProductCard from '../components/UI/ProductCard';
import { useEffect, useState } from 'react';
import API from '../services/api';

const BACKEND = 'http://localhost:5002';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy sản phẩm và danh mục từ DB
    Promise.all([
      API.get('/products'),
      API.get('/categories'),
    ]).then(([prodRes, catRes]) => {
      // Map cột DB sang format ProductCard cần
      const mapped = prodRes.data.map(sp => ({
        product_code: sp.MaSP,
        name: sp.TenSP,
        price: sp.GiaBan,
        image: sp.HinhAnh
          ? (sp.HinhAnh.startsWith('http') ? sp.HinhAnh : `${BACKEND}/uploads/${sp.HinhAnh}`)
          : '',
        category: sp.TenDanhMuc || '',
        MaDanhMuc: sp.MaDanhMuc,
      }));
      setProducts(mapped);
      setCategories(catRes.data);
    }).catch(err => {
      console.error('Lỗi tải dữ liệu:', err);
    }).finally(() => setLoading(false));
  }, []);

  // Lấy 5 sản phẩm đầu làm "bán chạy"
  const bestSellers = products.slice(0, 5);

  return (
    <>
      <section className="bg-gradient-to-r from-cyan-600 to-cyan-500 py-16 relative">
        <div className="container mx-auto px-4">
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=400&fit=crop" 
              alt="Hero" 
              className="w-full h-full object-cover transform hover:scale-105 transition duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
              <div className="px-12 text-white max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">Cửa Hàng Tiện Lợi <br/>Hàng Đầu Việt Nam</h1>
                <p className="text-xl mb-8 text-gray-200">Phục vụ 24/7 với hơn 200+ cửa hàng trên toàn quốc</p>
                <Link to="/special-offers" className="bg-white text-cyan-700 px-8 py-4 rounded-full font-bold hover:bg-cyan-50 hover:shadow-lg transition">
                  Khám phá ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Danh mục sản phẩm từ DB */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center">
            <span className="w-1.5 h-8 bg-cyan-600 rounded-full mr-4 block"></span>
            Danh mục sản phẩm
          </h2>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.MaDanhMuc}
                  to={`/special-offers?category=${encodeURIComponent(cat.TenDanhMuc)}`}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl hover:bg-cyan-50 hover:shadow-md transition group"
                >
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-cyan-600 transition">
                    <span className="text-2xl">🛍️</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 text-center group-hover:text-cyan-700 transition line-clamp-2">
                    {cat.TenDanhMuc}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {['Sandwich', 'Thức ăn phụ', 'Salad', 'Tráng miệng', 'Bánh mì', 'Bánh ngọt', 'Thực phẩm', 'Dịch vụ'].map((name, idx) => (
                <CategoryCard key={idx} category={{ name, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop' }} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight text-white drop-shadow-md">
            ƯU ĐÃI ĐẶC BIỆT THÁNG MỚI
          </h2>
          <p className="text-white text-xl">Đồng giá hấp dẫn - Nhanh tay kẻo lỡ!</p>
        </div>
      </section>

      {/* Sản phẩm bán chạy từ DB */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center">
            <span className="w-1.5 h-8 bg-cyan-600 rounded-full mr-4 block"></span>
            Sản phẩm nổi bật
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {bestSellers.map(p => (
                <ProductCard key={p.product_code} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8 text-lg">Chưa có sản phẩm nào trong hệ thống.</p>
          )}

          {products.length > 5 && (
            <div className="text-center mt-8">
              <Link to="/special-offers" className="inline-block bg-cyan-600 text-white px-8 py-3 rounded-full font-bold hover:bg-cyan-700 transition">
                Xem tất cả sản phẩm ({products.length})
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
