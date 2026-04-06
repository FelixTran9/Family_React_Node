import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Check, ArrowLeft, Star, Heart } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Mock fetch product
    let isMounted = true;
    setTimeout(() => {
      if (!isMounted) return;
      // Dummy data based on the ID to simulate an API request
      const mockProduct = {
        product_code: id,
        name: id === '1' ? 'Miếng gà chiên tiêu Pe-Bo-Chi' : `Sản phẩm mẫu ${id}`,
        price: id === '1' ? 28000 : 25000,
        category: 'Đồ chiên',
        description: 'Món gà chiên tuyệt hảo với lớp vỏ ngoài giòn rụm, thịt bên trong mềm ngọt tự nhiên, kết hợp cùng vị thơm nồng đặc trưng của tiêu đen. Sản phẩm rất phù hợp cho những bữa ăn nhẹ hoặc ăn kèm cùng bạn bè.',
        ingredients: 'Thịt gà tươi, bột chiên giòn, tiêu đen, gia vị độc quyền FamilyMart.',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
        rating: 4.8,
        reviews: 124
      };
      setProduct(mockProduct);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      // If quantity is more than 1, add it sequentially or adapt logic (CartContext uses 1 usually per click)
      // We will loop or adapt CartContext. Since CartContext addToCart currently adds 1, 
      // let's just cheat and add it multiple times, or we can update CartContext. 
      // For now, let's dispatch it 1 time with total requested quantity structure.
      // Assuming CartContext addToCart accepts the object, updateQuantity can be used.
      // But let's keep it simple: Add to cart once, and if they chose qty > 1 we can just loop.
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-700">Sản phẩm không tồn tại</h2>
        <Link to="/" className="text-cyan-600 mt-4 inline-block hover:underline">Quay về trang chủ</Link>
      </div>
    );
  }

  const formattedPrice = parseFloat(product.price).toLocaleString('vi-VN');

  return (
    <div className="bg-white min-h-[80vh]">
      <div className="container mx-auto px-4 py-8">
        
        <Link to="/special-offers" className="inline-flex items-center text-gray-500 hover:text-cyan-600 mb-8 transition font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại danh sách
        </Link>
        
        <div className="grid md:grid-cols-2 gap-12 bg-white">
          <div className="relative rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-4 bg-gray-50">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-auto object-cover rounded-2xl"
            />
            <button className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
              <Heart className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col">
            <div className="mb-2">
              <span className="bg-cyan-100 text-cyan-800 text-sm font-bold px-4 py-1.5 rounded-full inline-block">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-4xl font-extrabold text-gray-800 mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <span className="text-gray-500 font-medium">({product.reviews} đánh giá)</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 font-medium tracking-wide">Đã bán 1.2k+</span>
            </div>

            <div className="text-5xl font-black text-cyan-600 mb-8">
              {formattedPrice} <span className="text-2xl text-cyan-500">đ</span>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="border-t border-b border-gray-100 py-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-2">Thành phần:</h3>
              <p className="text-gray-600 items-baseline">{product.ingredients}</p>
            </div>

            <div className="flex items-center space-x-6 mt-auto">
              <div className="flex items-center border-2 border-gray-200 rounded-xl">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-5 py-3 text-xl text-gray-600 hover:bg-gray-100 rounded-l-xl transition"
                >-</button>
                <span className="px-6 py-3 font-bold text-lg select-none">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-5 py-3 text-xl text-gray-600 hover:bg-gray-100 rounded-r-xl transition"
                >+</button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={added}
                className={`flex-1 py-4 px-8 rounded-xl font-bold flex items-center justify-center text-lg transition-all shadow-lg ${
                  added 
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30' 
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/30'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-6 h-6 mr-3" />
                    Đã thêm vào giỏ
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6 mr-3" />
                    Thêm vào giỏ hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
