# Task: Bổ sung 3 module nghiệp vụ cho hệ thống quản lý cửa hàng (Express + MySQL)

Dự án hiện có sẵn cấu trúc controllers/routes theo pattern trong 
[dán 1-2 file controller mẫu, ví dụ supplierController.js + supplierRoutes.js].

Database schema đầy đủ trong file quanlycuahang-3.sql (đính kèm).

## Yêu cầu 1: Cảnh báo tồn kho lâu ngày / sắp hết hạn
- Sửa `createNhapHang` để insert thêm vào bảng LO_HANG (MaLo tự sinh, NgayNhapKho=NOW(), 
  HanSuDung lấy từ input nếu có)
- Tạo service `tonKhoService.js`: hàm `quetCanhBaoTonKho()` 
  - Query LO_HANG JOIN SAN_PHAM, tính SoNgayTonKho = DATEDIFF(NOW(), NgayNhapKho)
  - So với NguongTonKhoLau trong CAU_HINH_CANH_BAO theo MaDanhMuc (fallback NULL = mặc định)
  - Nếu vượt ngưỡng và SoLuongConLai > 0 → insert CANH_BAO_TON_KHO (loai=ton_kho_lau)
  - Tương tự cho HanSuDung sắp tới (loai=sap_het_han) và đã qua (da_het_han)
- Tạo controller + routes CRUD cho CANH_BAO_TON_KHO và CAU_HINH_CANH_BAO
- API: GET /api/admin/canh-bao-ton-kho, PATCH /:id/xu-ly

## Yêu cầu 2: Phát hiện khách hàng VIP (RFM)
- Service `rfmService.js`: hàm `tinhRFM()`
  - Từ DON_BAN_HANG + CT_DON_BAN, tính cho mỗi KH:
    Recency = số ngày từ lần mua gần nhất
    Frequency = số đơn hàng
    Monetary = tổng TongThanhToan
  - Chuẩn hóa điểm 0-100, xếp hạng HangKH (Dong/Bac/Vang/KimCuong) theo ngưỡng
  - Insert/update PHAN_LOAI_KHACH_HANG theo KyPhanTich hiện tại
- Controller CRUD cho CHAM_SOC_KHACH_HANG (ghi log chăm sóc KH VIP)
- API: GET /api/admin/khach-hang-vip?hang=Vang, POST /api/admin/cham-soc

## Yêu cầu 3: Dự báo xu hướng bán hàng
- Service `duBaoService.js`: hàm `duBaoXuHuong()`
  - So sánh SUM(SoLuong) theo tháng hiện tại vs tháng trước cho từng MaSP
  - Tính % tăng trưởng, nếu tăng đều liên tiếp → insert DU_BAO_XU_HUONG
  - Nếu vượt ngưỡng tăng trưởng → tạo DE_NGHI_DAT_HANG_DU_BAO (gợi ý nhập thêm)
- API: GET /api/admin/du-bao, GET /api/admin/de-nghi-dat-hang, PATCH /:id duyệt

## Chung
- Mỗi lần 1 trong 3 service trên chạy xong → insert log vào NHAT_KY_AI
  (ChucNang, ThamSo, KetQua_Tom_Tat, SoLuongXuLy, SoLuongCanhBao, ThoiGianChay_ms)
- Bảo vệ tất cả route admin bằng middleware authAdmin có sẵn
- Style code theo đúng pattern các file mẫu đính kèm (dùng pool.query, 
  try/catch trả JSON message tiếng Việt, transaction khi cần)