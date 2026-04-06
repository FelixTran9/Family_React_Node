import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-8 border-t-4 border-cyan-600">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          
          <div>
            <img 
              src="https://famima.vn/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75" 
              alt="FamilyMart" 
              className="h-12 mb-4" 
            />
            <p className="text-gray-600 text-sm mb-4">CÔNG TY TNHH CỬA HÀNG TIỆN LỢI GIA ĐÌNH VIỆT NAM</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2 text-gray-600">
                <MapPin className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <span>Tầng 8, Toà nhà An Khánh, 63 Phạm Ngọc Thạch, Q.3, TP.HCM</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                <span>(028) 3930 5180</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                <span>Hotline: 037 703 8778</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                <span>cskh@famima.vn</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800">Danh mục sản phẩm</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/special-offers" className="hover:text-cyan-600 transition">Ưu đãi đặc biệt</Link></li>
              <li><Link to="/stores" className="hover:text-cyan-600 transition">Cửa hàng</Link></li>
              <li><Link to="/news" className="hover:text-cyan-600 transition">Tin tức</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800">Về FamilyMart</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/about" className="hover:text-cyan-600 transition">Giới thiệu về FamilyMart</Link></li>
              <li><Link to="/policy" className="hover:text-cyan-600 transition">Chính sách chung</Link></li>
              <li><Link to="/recruitment" className="hover:text-cyan-600 transition">Tuyển dụng</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800">Kết Nối Với Chúng Tôi</h3>
            <div className="flex space-x-3 mb-6">
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition">
                F
              </a>
              <a href="#" className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition">
                Tiktok
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-3">Tải App FamiPoint</p>
              <div className="flex space-x-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/200px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" className="h-10 cursor-pointer" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/200px-Google_Play_Store_badge_EN.svg.png" alt="Google Play" className="h-10 cursor-pointer" />
              </div>
            </div>
          </div>

        </div>
        
        <div className="border-t pt-8 text-center text-gray-600 text-sm">
          <p>Copyright © 2025 famima.vn All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
