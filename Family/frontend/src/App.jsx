import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Pages
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

function App() {
  return (
    <Router>
      <Routes>
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
      </Routes>

    </Router>
  );
}

export default App;
