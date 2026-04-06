import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';

const Header = () => {
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Điều hướng đến trang danh mục/ưu đãi đồng thời pass qua query parameter
      navigate(`/special-offers?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          
          <Link to="/" className="flex items-center cursor-pointer select-none
              text-3xl font-extrabold tracking-widest
              bg-gradient-to-r from-[rgb(6,174,205)] to-[rgb(0,200,220)]
              bg-clip-text text-transparent
              transition-all duration-300">
            <p>Famina</p>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên sản phẩm, từ khóa cần tìm..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-cyan-500" 
            />
            <button 
              type="submit"
              className="bg-cyan-500 text-white px-6 py-2 rounded-r-lg hover:bg-cyan-600 transition"
            >
              Tìm kiếm
            </button>
          </form>

          <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition text-gray-700">
            <ShoppingCart className="w-8 h-8" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          </Link>

        </div>
      </div>
    </header>
  );
};

export default Header;
