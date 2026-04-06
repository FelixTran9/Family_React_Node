import { Link } from 'react-router-dom';
import CategoryCard from '../components/UI/CategoryCard';
import ProductCard from '../components/UI/ProductCard';
import { useEffect, useState } from 'react';

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    // Mock dữ liệu tạm thời để giao diện hoạt động thay thế cho API
    const mockProducts = [
      { product_code: '1', name: 'Miếng gà chiên tiêu Pe-Bo-Chi', price: 28000, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop' },
      { product_code: '2', name: 'Xúc xích heo xông khói lớn', price: 21000, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop' },
      { product_code: '3', name: 'Xúc xích hộp lô bò phô mai', price: 16000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop' },
      { product_code: '4', name: 'Set Yêu Thích 1', price: 28000, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop' },
      { product_code: '5', name: 'Bánh Mì Kẹp Thịt', price: 15000, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop' },
    ];
    setBestSellers(mockProducts);
  }, []);

  const categories = [
    { name: 'Sandwich', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop' },
    { name: 'Thức ăn phụ', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop' },
    { name: 'Salad', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop' },
    { name: 'Tráng miệng', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&h=200&fit=crop' },
    { name: 'Bánh mì', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop' },
    { name: 'Bánh ngọt', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop' },
    { name: 'Thực phẩm', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&h=200&fit=crop' },
    { name: 'Dịch vụ', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop' }
  ];

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

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center">
            <span className="w-1.5 h-8 bg-cyan-600 rounded-full mr-4 block"></span>
            Sản phẩm đặc trưng của FamilyMart
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat, idx) => (
              <CategoryCard key={idx} category={cat} />
            ))}
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

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center">
            <span className="w-1.5 h-8 bg-cyan-600 rounded-full mr-4 block"></span>
            Sản phẩm bán chạy
          </h2>
          
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {bestSellers.map(p => (
                <ProductCard key={p.product_code} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8 text-lg">Đang tải giỏ hàng...</p>
          )}

        </div>
      </section>
    </>
  );
};

export default Home;
