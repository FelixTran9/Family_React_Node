import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingSupport from './FloatingSupport';
import AuthModal from '../Auth/AuthModal';

const MainLayout = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <Navbar />
      
      {/* Vùng không gian hiển thị nội dung động theo component được Router chỉ định */}
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
      <FloatingSupport />
      <AuthModal />
    </div>
  );
};

export default MainLayout;
