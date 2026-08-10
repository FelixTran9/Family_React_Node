import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  const formattedPrice = parseFloat(product.price).toLocaleString('vi-VN');
  
  const imageUrl = product.image 
    ? (product.image.startsWith('http') ? product.image : `/storage/${product.image}`)
    : 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop'; // default stub for missing images

  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
      <Link to={`/product/${product.product_code}`} className="relative block">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-48 object-cover bg-gray-50"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-cyan-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
            FamilyMart
          </span>
        </div>
      </Link>
      <div className="p-4 flex flex-col justify-between h-40">
        <div>
          <Link to={`/product/${product.product_code}`}>
            <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 hover:text-cyan-600 transition" title={product.name}>
              {product.name}
            </h3>
          </Link>
          <div className="text-cyan-600 font-extrabold text-xl mb-3">
            {formattedPrice} đ
          </div>
        </div>

        <button 
          onClick={handleAddToCart}
          disabled={added}
          className={`w-full border-2 py-2 rounded-xl font-bold flex items-center justify-center transition-all ${
            added 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white'
          }`}
        >
          {added ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Đã thêm
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Thêm vào giỏ
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
