import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Load categories from API
    import('../../services/api').then(module => {
      module.default.get('/categories').then(res => {
        setCategories(res.data);
      }).catch(err => console.error("Lỗi tải danh mục navbar:", err));
    });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-cyan-600 text-white shadow-lg relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-8 py-4 relative">
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 font-semibold hover:text-cyan-100 transition focus:outline-none"
            >
              <Menu className="w-5 h-5" />
              <span>Danh mục sản phẩm</span>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-3 w-64 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden transform transition-all opacity-100 scale-100">
                <Link 
                  to="/special-offers?category=all" 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center px-5 py-3.5 text-cyan-700 bg-cyan-50/50 hover:bg-cyan-50 font-bold border-b border-gray-100 transition-colors"
                >
                  📦 <span className="ml-2">Tất cả sản phẩm</span>
                </Link>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {categories.map((cat, index) => (
                    <Link 
                      key={cat.MaDanhMuc || index}
                      to={`/special-offers?category=${encodeURIComponent(cat.TenDanhMuc)}`}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-50 hover:text-cyan-600 hover:pl-6 transition-all duration-200 border-b border-gray-50 last:border-0"
                    >
                      {cat.TenDanhMuc}
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
