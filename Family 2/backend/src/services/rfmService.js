import pool from "../config/db.js";

/**
 * Ghi log vào NHAT_KY_AI
 */
const ghiNhatKy = async (chucNang, thamSo, ketQua, soXuLy, soCanhBao, thoiGianMs, trangThai = "thanh_cong", loi = null) => {
  try {
    await pool.query(
      `INSERT INTO NHAT_KY_AI (ChucNang, ThamSo, KetQua_Tom_Tat, SoLuongXuLy, SoLuongCanhBao, ThoiGianChay_ms, TrangThai, ThongBaoLoi)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [chucNang, JSON.stringify(thamSo), typeof ketQua === "string" ? ketQua : JSON.stringify(ketQua), soXuLy, soCanhBao, thoiGianMs, trangThai, loi]
    );
  } catch (e) {
    console.error("Lỗi ghi nhật ký AI:", e.message);
  }
};

/**
 * Xác định hạng khách hàng dựa trên điểm RFM tổng hợp
 */
const xacDinhHang = (diemRFM) => {
  if (diemRFM >= 80) return "KimCuong";
  if (diemRFM >= 60) return "Vang";
  if (diemRFM >= 40) return "Bac";
  return "Dong";
};

/**
 * Gợi ý ưu đãi theo hạng
 */
const goiYUuDai = (hang, diemRFM) => {
  switch (hang) {
    case "KimCuong":
      return "Ưu tiên giải quyết khiếu nại, tặng quà sinh nhật, mời tham gia chương trình thành viên VIP đặc biệt, giảm giá 15-20%";
    case "Vang":
      return "Thông báo sản phẩm mới trước, mã giảm giá 10%, chương trình tích điểm x2";
    case "Bac":
      return "Gửi email khuyến mãi định kỳ, voucher giảm giá 5%, nhắc nhở mua hàng";
    default:
      return "Gửi thông báo chương trình khuyến mãi, tặng voucher nhỏ để khuyến khích quay lại";
  }
};

/**
 * Tính điểm RFM và phân loại khách hàng
 * R = Recency (số ngày từ lần mua gần nhất — thấp hơn = tốt hơn)
 * F = Frequency (số lần mua)
 * M = Monetary (tổng chi tiêu)
 */
export const tinhRFM = async () => {
  const batDau = Date.now();
  const now = new Date();
  const kyPhanTich = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    // Lấy dữ liệu RFM thô cho tất cả khách hàng
    const [khachHangList] = await pool.query(
      `SELECT
         kh.MaKH,
         kh.TenKH,
         DATEDIFF(NOW(), MAX(dbh.NgayDat)) AS Recency,
         COUNT(DISTINCT dbh.MaDon) AS Frequency,
         COALESCE(SUM(dbh.TongThanhToan), 0) AS Monetary,
         MAX(DATE(dbh.NgayDat)) AS NgayMuaGanNhat
       FROM KHACH_HANG kh
       LEFT JOIN DON_BAN_HANG dbh ON kh.MaKH = dbh.MaKH
         AND dbh.TrangThai NOT IN ('đã_hủy', 'huy')
       GROUP BY kh.MaKH, kh.TenKH
       HAVING Frequency > 0`
    );

    if (khachHangList.length === 0) {
      const thoiGianMs = Date.now() - batDau;
      await ghiNhatKy("phan_loai_khach", { kyPhanTich }, "Không có dữ liệu đủ để phân tích RFM", 0, 0, thoiGianMs);
      return { soKhachPhanLoai: 0, kyPhanTich, thoiGianMs };
    }

    // Tính min/max để chuẩn hóa
    const recencies = khachHangList.map((k) => k.Recency);
    const frequencies = khachHangList.map((k) => k.Frequency);
    const monetaries = khachHangList.map((k) => Number(k.Monetary));

    const minR = Math.min(...recencies);
    const maxR = Math.max(...recencies);
    const minF = Math.min(...frequencies);
    const maxF = Math.max(...frequencies);
    const minM = Math.min(...monetaries);
    const maxM = Math.max(...monetaries);

    // Hàm chuẩn hóa [0, 100] — Recency: thấp hơn = điểm cao hơn
    const normalize = (val, min, max, invert = false) => {
      if (max === min) return 50;
      const score = ((val - min) / (max - min)) * 100;
      return invert ? 100 - score : score;
    };

    let soKhachPhanLoai = 0;

    for (const kh of khachHangList) {
      const diemR = normalize(kh.Recency, minR, maxR, true); // Recency thấp → điểm cao
      const diemF = normalize(kh.Frequency, minF, maxF, false);
      const diemM = normalize(Number(kh.Monetary), minM, maxM, false);

      // Trọng số: R=30%, F=30%, M=40%
      const diemRFM = Math.round((diemR * 0.3 + diemF * 0.3 + diemM * 0.4) * 100) / 100;
      const hang = xacDinhHang(diemRFM);
      const ltv = Number(kh.Monetary) * (kh.Frequency > 0 ? 1.2 : 1); // Ước tính LTV đơn giản

      // Upsert PHAN_LOAI_KHACH_HANG
      const [existing] = await pool.query(
        "SELECT MaPhanLoai FROM PHAN_LOAI_KHACH_HANG WHERE MaKH = ? AND KyPhanTich = ?",
        [kh.MaKH, kyPhanTich]
      );

      if (existing.length > 0) {
        await pool.query(
          `UPDATE PHAN_LOAI_KHACH_HANG SET
             HangKH=?, DiemRFM=?, DiemRecency=?, DiemFrequency=?, DiemMonetary=?,
             TongChiTieu=?, SoLanMua=?, NgayMuaGanNhat=?, GiaTri_LTV=?, DeNghiUuDai=?, NgayPhanLoai=NOW()
           WHERE MaKH=? AND KyPhanTich=?`,
          [hang, diemRFM, diemR, diemF, diemM, kh.Monetary, kh.Frequency, kh.NgayMuaGanNhat, ltv, goiYUuDai(hang, diemRFM), kh.MaKH, kyPhanTich]
        );
      } else {
        await pool.query(
          `INSERT INTO PHAN_LOAI_KHACH_HANG
           (MaKH, KyPhanTich, HangKH, DiemRFM, DiemRecency, DiemFrequency, DiemMonetary,
            TongChiTieu, SoLanMua, NgayMuaGanNhat, GiaTri_LTV, DeNghiUuDai)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [kh.MaKH, kyPhanTich, hang, diemRFM, diemR, diemF, diemM, kh.Monetary, kh.Frequency, kh.NgayMuaGanNhat, ltv, goiYUuDai(hang, diemRFM)]
        );
      }

      soKhachPhanLoai++;
    }

    const thoiGianMs = Date.now() - batDau;
    await ghiNhatKy(
      "phan_loai_khach",
      { kyPhanTich },
      { soKhachPhanLoai, kyPhanTich },
      soKhachPhanLoai,
      soKhachPhanLoai,
      thoiGianMs
    );

    return { soKhachPhanLoai, kyPhanTich, thoiGianMs };
  } catch (err) {
    const thoiGianMs = Date.now() - batDau;
    await ghiNhatKy("phan_loai_khach", { kyPhanTich }, null, 0, 0, thoiGianMs, "loi", err.message);
    throw err;
  }
};
