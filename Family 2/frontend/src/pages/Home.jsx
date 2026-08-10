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

      {/* Danh mục sản phẩm từ DB - PREMIUM DESIGN */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-4xl font-black text-gray-800 flex items-center tracking-tight">
                <span className="w-2 h-10 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-full mr-4 block"></span>
                Khám Phá Danh Mục
              </h2>
              <p className="text-gray-500 mt-2 ml-6 text-lg">Đa dạng lựa chọn, đáp ứng mọi nhu cầu hàng ngày</p>
            </div>
            <Link to="/special-offers" className="hidden md:flex items-center text-cyan-600 font-bold hover:text-cyan-800 transition">
              Xem tất cả <span className="ml-2 text-xl">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {(categories.length > 0 ? categories : [
              { MaDanhMuc: '1', TenDanhMuc: 'Sandwich' },
              { MaDanhMuc: '2', TenDanhMuc: 'Thức ăn phụ' },
              { MaDanhMuc: '3', TenDanhMuc: 'Salad' },
              { MaDanhMuc: '4', TenDanhMuc: 'Tráng miệng' },
              { MaDanhMuc: '5', TenDanhMuc: 'Bánh mì' },
              { MaDanhMuc: '6', TenDanhMuc: 'Đồ uống' },
            ]).map((cat, index) => {
              const bgImages = [
                "https://p16-lemon8-sign-sg.tiktokcdn.com/tos-alisg-v-a3e477-sg/oIIkvAn1IBCDAFdVb9EgQ8AeMi8PAGN9pfttQX~tplv-sdweummd6v-text-logo-v1:QGthcmxhLmZvb2RibG9n:q75.jpeg?lk3s=c7f08e79&source=lemon8_seo&x-expires=1778673600&x-signature=6xweZB0xoNlDLZO%2FobAwy6Ts%2BDQ%3D",
                "https://marketingai.mediacdn.vn/wp-content/uploads/2020/03/kantar_worldpanel_beautyCN_4.jpg",
                "https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=800&fit=crop",
                "https://cellphones.com.vn/sforum/wp-content/uploads/2023/07/review-do-gia-dung-thumb.jpg",
                "https://media-cdn-v2.laodong.vn/storage/newsportal/2023/3/5/1154482/Do-Uong-Co-Duong-4.jpg",
                "https://media-cdn-v2.laodong.vn/storage/newsportal/2023/3/5/1154482/Do-Uong-Co-Duong-4.jpg",
                "https://media-cdn-v2.laodong.vn/storage/newsportal/2023/3/5/1154482/Do-Uong-Co-Duong-4.jpg",
                "https://media-cdn-v2.laodong.vn/storage/newsportal/2023/3/5/1154482/Do-Uong-Co-Duong-4.jpg",
                "https://media-cdn-v2.laodong.vn/storage/newsportal/2023/3/5/1154482/Do-Uong-Co-Duong-4.jpg",
              ];
              const image = bgImages[index % bgImages.length];

              return (
                <Link
                  key={cat.MaDanhMuc}
                  to={`/special-offers?category=${encodeURIComponent(cat.TenDanhMuc)}`}
                  className="group relative rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 aspect-[4/5] flex flex-col justify-end"
                >
                  <img 
                    src={image} 
                    alt={cat.TenDanhMuc}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-6 z-10 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-extrabold text-xl leading-snug drop-shadow-md">
                      {cat.TenDanhMuc}
                    </h3>
                    <div className="w-8 h-1 bg-cyan-400 mt-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0"></div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/special-offers" className="inline-flex items-center justify-center w-full bg-cyan-100 text-cyan-700 py-4 rounded-xl font-bold hover:bg-cyan-200 transition">
              Xem tất cả danh mục
            </Link>
          </div>
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
