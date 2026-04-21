import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Customer Layout & Pages
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import SpecialOffers from './pages/SpecialOffers';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Stores from './pages/Stores';
import News from './pages/News';
import About from './pages/About';
import Policy from './pages/Policy';
import Recruitment from './pages/Recruitment';

// Admin Auth
import { AdminAuthProvider } from './context/AdminAuthContext';
import PrivateRoute from './components/admin/PrivateRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import StaffList from './pages/admin/staff/StaffList';
import StaffCreate from './pages/admin/staff/StaffCreate';
import StaffEdit from './pages/admin/staff/StaffEdit';
import ProductList from './pages/admin/products/ProductList';
import ProductCreate from './pages/admin/products/ProductCreate';
import ProductEdit from './pages/admin/products/ProductEdit';
import OrderList from './pages/admin/orders/OrderList';
import OrderCreate from './pages/admin/orders/OrderCreate';
import OrderDetail from './pages/admin/orders/OrderDetail';
import ShippingList from './pages/admin/shipping/ShippingList';
import ShippingCreate from './pages/admin/shipping/ShippingCreate';
import ShippingEdit from './pages/admin/shipping/ShippingEdit';
import PromotionList from './pages/admin/promotions/PromotionList';
import PromotionCreate from './pages/admin/promotions/PromotionCreate';
import PromotionEdit from './pages/admin/promotions/PromotionEdit';
import CustomerList from './pages/admin/customers/CustomerList';
import CustomerCreate from './pages/admin/customers/CustomerCreate';
import CustomerEdit from './pages/admin/customers/CustomerEdit';
import SupplierList from './pages/admin/suppliers/SupplierList';
import SupplierCreate from './pages/admin/suppliers/SupplierCreate';
import SupplierEdit from './pages/admin/suppliers/SupplierEdit';
import ReportPage from './pages/admin/ReportPage';
import NhapHangList from './pages/admin/nhapHang/NhapHangList';
import NhapHangCreate from './pages/admin/nhapHang/NhapHangCreate';
import NhapHangDetail from './pages/admin/nhapHang/NhapHangDetail';
import ChamCongList from './pages/admin/nhanSu/ChamCongList';
import BangLuongList from './pages/admin/nhanSu/BangLuongList';

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* ===== Customer Routes ===== */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="special-offers" element={<SpecialOffers />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="account" element={<Account />} />
            <Route path="orders" element={<Orders />} />
            <Route path="stores" element={<Stores />} />
            <Route path="news" element={<News />} />
            <Route path="about" element={<About />} />
            <Route path="policy" element={<Policy />} />
            <Route path="recruitment" element={<Recruitment />} />
          </Route>

          {/* ===== Admin Login (public) ===== */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ===== Admin Protected Routes ===== */}
          <Route
            path="/admin"
            element={<PrivateRoute><AdminLayout /></PrivateRoute>}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Staff */}
            <Route path="staff" element={<StaffList />} />
            <Route path="staff/create" element={<StaffCreate />} />
            <Route path="staff/:id/edit" element={<StaffEdit />} />

            {/* Products */}
            <Route path="products" element={<ProductList />} />
            <Route path="products/create" element={<ProductCreate />} />
            <Route path="products/:id/edit" element={<ProductEdit />} />

            {/* Orders */}
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/create" element={<OrderCreate />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="orders/:id/edit" element={<OrderDetail />} />

            {/* Shipping */}
            <Route path="shipping" element={<ShippingList />} />
            <Route path="shipping/create" element={<ShippingCreate />} />
            <Route path="shipping/:id/edit" element={<ShippingEdit />} />

            {/* Promotions */}
            <Route path="promotions" element={<PromotionList />} />
            <Route path="promotions/create" element={<PromotionCreate />} />
            <Route path="promotions/:id/edit" element={<PromotionEdit />} />

            {/* Customers */}
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/create" element={<CustomerCreate />} />
            <Route path="customers/:id/edit" element={<CustomerEdit />} />

            {/* Suppliers */}
            <Route path="suppliers" element={<SupplierList />} />
            <Route path="suppliers/create" element={<SupplierCreate />} />
            <Route path="suppliers/:id/edit" element={<SupplierEdit />} />

            {/* Nhập hàng */}
            <Route path="nhap-hang" element={<NhapHangList />} />
            <Route path="nhap-hang/create" element={<NhapHangCreate />} />
            <Route path="nhap-hang/:id" element={<NhapHangDetail />} />

            {/* Nhân sự - Chấm công & Bảng lương */}
            <Route path="nhan-su/cham-cong" element={<ChamCongList />} />
            <Route path="nhan-su/bang-luong" element={<BangLuongList />} />

            {/* Reports */}
            <Route path="reports" element={<ReportPage />} />
          </Route>
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
