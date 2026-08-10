# Famina Frontend - Hướng Dẫn Chi Tiết Luồng Chạy (ReactJS)

Dự án này là phiên bản chuyển đổi giao diện từ HTML/Blade tĩnh sang kiến trúc **ReactJS (Vite + Tailwind CSS v4)** dành cho hệ thống FamilyMart (Famina).

Dưới đây là tài liệu mô tả luồng hoạt động chi tiết của mã nguồn để bạn có thể dễ dàng nắm bắt, chỉnh sửa và kết nối với Backend API sau này.

---

## 1. Điểm Khởi Đầu (Entry Point)

Luồng chạy của ứng dụng bắt đầu từ file:
👉 **`src/main.jsx`**

- Tại đây, React sẽ tìm thẻ `<div id="root">` trong file `index.html` và chèn (render) toàn bộ ứng dụng vào đó.
- Trong `main.jsx`, component `<App />` được bọc bởi 2 **Context Providers**:
  1. `<AuthProvider>`: Cung cấp trạng thái User (đã đăng nhập trưa, thông tin name/email) cho toàn app.
  2. `<CartProvider>`: Cung cấp mảng giỏ hàng (cart), tính tổng tiền cho toàn app.
- Việc bọc ở cấp cao nhất này giúp **bất kỳ trang nào hay component nào** cũng có thể gọi ra dữ liệu Giỏ Hàng hoặc User mà không cần truyền props rườm rà.

---

## 2. Hệ Thống Định Tuyến (Routing & Layout)

👉 **`src/App.jsx`**

Sau khi vào `main.jsx`, luồng đi tiếp tới `App.jsx`. Đây là "Tổng đài giao thông" của React.
- Chúng ta sử dụng thư viện `react-router-dom` để rẽ nhánh.
- **Trục xương sống (Core Layout)**: Toàn bộ ứng dụng được bọc chung bởi `<Route path="/" element={<MainLayout />}>`. 
  => Điều này có nghĩa là mọi đường dẫn đều phải đi qua `MainLayout`.

👉 **`src/components/Layout/MainLayout.jsx`**
File này quy định "khung sườn" không bao giờ biến mất khi chuyển trang. Bao gồm:
1. `<TopBar />`: Nơi hiển thị thông tin support, nút Login/Tên user.
2. `<Header />`: Chứa Logo Famina, thanh Tìm kiếm, Icon Giỏ hàng.
3. `<Navbar />`: Thanh menu ngang màu xanh chứa các Category.
4. **`<Outlet />`**: Đây là cái ruột động! Khi bạn gõ URL `/cart`, React Router sẽ nhét nội dung của trang `Cart.jsx` vào giữa Outlet này. Khi gõ `/about`, nó sẽ nhét `About.jsx` vào.
5. `<Footer />` & `<FloatingSupport />` & `<AuthModal />`: Đáy trang và các nút hỗ trợ nổi.

---

## 3. Quản Lý Trạng Thái Dùng Chung (State Management)

Thay vì dùng `localStorage` rải rác từng file HTML như code cũ, dự án gom tất cả vào thư mục **`src/context`**:

- **`AuthContext.jsx`**: 
  - Khai báo state `currentUser`. 
  - Lưu các hàm `login()`, `register()`, `logout()`. 
  - Khi cần login, bất cứ file nào (ví dụ nút ở TopBar) chỉ cần gọi hàm `openAuthModal()`, popup AuthModal sẽ tự bật lên vì state isAuthModalOpen nằm ở đây.
- **`CartContext.jsx`**: 
  - Khai báo state `cart` (mảng rỗng hoặc load từ localStorage).
  - Có sẵn các chiêu thức: `addToCart()`, `removeFromCart()`, `updateQuantity()`.
  - Icon giỏ hàng trên Header tự đếm số lượng giỏ hàng nhờ vào biến tính toán trực tiếp từ mảng `cart` này.

*(Bạn có thể thấy rõ quy trình truyền tải khi click Nút "Thêm vào giỏ" ở ProductCard, Context sẽ tự tính số lượng và báo về Header để cập nhật icon số)*

---

## 4. Các Trang Giao Diện Màn Hình (Pages)

Sẽ được nhét vào `<Outlet />` của Layout tuỳ vào đường dẫn URL (như đã khai báo trong `App.jsx`).

- `/` ➔ **`src/pages/Home.jsx`**: Thể hiện dữ liệu Hero (ảnh lớn), Categories (danh mục), và danh sách sản phẩm bán chạy. Home sẽ `import` ProductCard, CategoryCard để lắp ráp vào grid layout.
- `/special-offers` ➔ **`src/pages/SpecialOffers.jsx`**: Khu vực xem sản phẩm đầy đủ. Code lấy tham số tìm kiếm qua URL (như `?search=xyz` hoặc `?category=abc`) để tự render ra mảng sản phẩm.
- `/product/:id` ➔ **`src/pages/ProductDetail.jsx`**: Xem chi tiết 1 sản phẩm, nơi đó bắt mã `id` để mock dữ liệu tạm, hiển thị số sao, mô tả chi tiết và bộ bấm +- Số lượng thêm vào giỏ.
- `/cart` ➔ **`src/pages/Cart.jsx`**: Bảng dữ liệu giỏ hàng, gọi ra Data từ CartContext để tính lại Tổng Phí và xử lý nút thanh toán.

*(Ngoài ra các file `About`, `Policy`, `Stores` đều là code Static (tĩnh) chỉ mang tính minh họa UI)*

---

## 5. Tái Sử Dụng Giao Diện Rời Rạc (UI Components)

Trong thư mục **`src/components/UI`**:
- **`ProductCard.jsx`**: Hiển thị 1 sản phẩm. Nó được tái sử dụng cả ở trang Chủ lẫn trang SpecialOffers. Được code chức năng click vào Chữ / Ảnh sẽ nhảy sang trang ProductDetail, bấm Nút thì nhảy thẳng lên CartContext.
- **`CategoryCard.jsx`**: Thẻ Danh mục.

---

## Tổng Kết Sơ Đồ Chạy:
1. Gõ Tên miền website (Ví dụ `localhost:5173`)
2. ➡️ Vào `main.jsx` (Load `AuthContext`, `CartContext` khởi động sẵn dữ liệu).
3. ➡️ Load `App.jsx` (Nhìn vào URL thấy đang là gốc `/`).
4. ➡️ Trình duyệt dựng khung `MainLayout.jsx` (Dựng Header trên đầu, Footer ở đít trang).
5. ➡️ `<Outlet>` chèn `Home.jsx` vào giữa.
6. ➡️ Trang Home tự render `ProductCard.jsx` với data mock. (App hiện xong UI toàn diện).

> **Lời khuyên trong tương lai:**
> Để kết nối NodeJS API, bạn tập trung vào hai file Context (`AuthContext` & `CartContext`), sửa hàm Call API fetch/axios ở các hàm như login() hoặc trang load sản phẩm (như useEffect trên `Home.jsx` hay `SpecialOffers.jsx`). Giao diện sẽ tự động thích ứng với data Back-end!
