import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    "Đồ chiên", "Lẩu", "Bánh hấp", "Thức uống Fami", 
    "Omusubi", "Sushi", "Cơm hộp", "Sandwich", "Bánh mì"
  ];

  return (
    <nav className="bg-cyan-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-8 py-4 relative">
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 font-semibold hover:text-cyan-100 transition"
            >
              <Menu className="w-5 h-5" />
              <span>Danh mục sản phẩm</span>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
                <div className="py-2">
                  <Link 
                    to="/special-offers?category=all" 
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-3 text-cyan-700 bg-cyan-50 font-semibold border-b border-gray-100 hover:bg-cyan-100"
                  >
                    📦 Tất cả sản phẩm
                  </Link>
                  {categories.map((cat, index) => (
                    <Link 
                      key={index}
                      to={`/special-offers?category=${encodeURIComponent(cat)}`}
                      onClick={() => setDropdownOpen(false)}
                      className={`block px-4 py-3 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition ${index !== categories.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Link to="/special-offers" className="font-medium hover:text-cyan-100 transition">Ưu đãi đặc biệt</Link>
          <Link to="/stores" className="font-medium hover:text-cyan-100 transition">Cửa hàng</Link>
          <Link to="/news" className="font-medium hover:text-cyan-100 transition">Tin tức</Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
