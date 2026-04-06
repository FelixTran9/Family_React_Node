import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/UI/ProductCard';

const SpecialOffers = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock call API
    let isMounted = true;
    setTimeout(() => {
      if (!isMounted) return;
      const mockDb = [
        { product_code: '1', name: 'Miếng gà chiên tiêu Pe-Bo-Chi', category: 'Đồ chiên', price: 28000, image: '' },
        { product_code: '2', name: 'Xúc xích heo xông khói lớn', category: 'Lẩu', price: 21000, image: '' },
        { product_code: '3', name: 'Trà Sữa Thái', category: 'Thức uống Fami', price: 20000, image: '' },
        { product_code: '5', name: 'Bánh Mì Kẹp Thịt', category: 'Bánh mì', price: 15000, image: '' },
      ];

      let filtered = mockDb;
      if (search) {
        filtered = mockDb.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      } else if (category && category !== 'all') {
        filtered = mockDb.filter(p => p.category === category);
      }
      
      setProducts(filtered);
      setLoading(false);
    }, 500);
  }, [search, category]);

  const title = search ? `Kết quả tìm kiếm cho: "${search}"` : (category && category !== 'all' ? `Danh mục: ${category}` : 'Tất cả sản phẩm & Ưu đãi');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
          <span className="w-1.5 h-8 bg-cyan-600 rounded-full mr-4 block"></span>
          {title}
        </h1>
      </div>

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
          <p className="text-gray-500">Vui lòng thử nghiệm với các từ khóa tìm kiếm hoặc danh mục khác.</p>
        </div>
      )}
    </div>
  );
};

export default SpecialOffers;
