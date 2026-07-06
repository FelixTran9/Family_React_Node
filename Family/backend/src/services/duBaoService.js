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
 * Xác định xu hướng dựa trên % tăng trưởng
 */
const xacDinhXuHuong = (phanTramTangTruong) => {
  if (phanTramTangTruong >= 50) return "tang_manh";
  if (phanTramTangTruong >= 10) return "tang";
  if (phanTramTangTruong >= -10) return "on_dinh";
  if (phanTramTangTruong >= -50) return "giam";
  return "giam_manh";
};

/**
 * Tính toán số lượng đề nghị nhập thêm dựa trên xu hướng
 */
const tinhDeNghiNhap = (soLuongThangNay, xuHuong, tonKhoHienTai) => {
  switch (xuHuong) {
    case "tang_manh":
      return Math.max(0, Math.round(soLuongThangNay * 1.5) - tonKhoHienTai);
    case "tang":
      return Math.max(0, Math.round(soLuongThangNay * 1.2) - tonKhoHienTai);
    case "on_dinh":
      return Math.max(0, soLuongThangNay - tonKhoHienTai);
    default:
      return 0;
  }
};

/**
 * Chạy dự báo xu hướng bán hàng theo tháng
 * So sánh tháng hiện tại vs 2 tháng trước
 */
export const duBaoXuHuong = async () => {
  const batDau = Date.now();
  const now = new Date();
  const thangNay = now.getMonth() + 1;
  const namNay = now.getFullYear();
  const thangTruoc = thangNay === 1 ? 12 : thangNay - 1;
  const namThangTruoc = thangNay === 1 ? namNay - 1 : namNay;
  const thangHaiThangTruoc = thangTruoc === 1 ? 12 : thangTruoc - 1;
  const namHaiThangTruoc = thangTruoc === 1 ? namThangTruoc - 1 : namThangTruoc;

  const kyDuBao = `${namNay}-${String(thangNay + 1 > 12 ? 1 : thangNay + 1).padStart(2, "0")}`;

  try {
    // Lấy doanh số bán theo sản phẩm cho 3 tháng gần nhất
    const [thongKeList] = await pool.query(
      `SELECT
         ctd.MaSP,
         sp.TenSP,
         sp.TonKho,
         sp.MaDanhMuc,
         SUM(CASE
           WHEN MONTH(dbh.NgayDat) = ? AND YEAR(dbh.NgayDat) = ? THEN ctd.SoLuong ELSE 0
         END) AS SoLuongThangNay,
         SUM(CASE
           WHEN MONTH(dbh.NgayDat) = ? AND YEAR(dbh.NgayDat) = ? THEN ctd.SoLuong ELSE 0
         END) AS SoLuongThangTruoc,
         SUM(CASE
           WHEN MONTH(dbh.NgayDat) = ? AND YEAR(dbh.NgayDat) = ? THEN ctd.SoLuong ELSE 0
         END) AS SoLuongHaiThangTruoc
       FROM CT_DON_BAN ctd
       JOIN DON_BAN_HANG dbh ON ctd.MaDon = dbh.MaDon
       JOIN SAN_PHAM sp ON ctd.MaSP = sp.MaSP
       WHERE dbh.TrangThai NOT IN ('đã_hủy', 'huy')
         AND dbh.NgayDat >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
       GROUP BY ctd.MaSP, sp.TenSP, sp.TonKho, sp.MaDanhMuc`,
      [thangNay, namNay, thangTruoc, namThangTruoc, thangHaiThangTruoc, namHaiThangTruoc]
    );

    let soDuBaoTao = 0;
    let soDeNghiTao = 0;
    const NGUONG_TANG_TRUONG = 15; // % tăng trưởng tối thiểu để tạo đề nghị đặt hàng

    for (const sp of thongKeList) {
      const slThangNay = Number(sp.SoLuongThangNay) || 0;
      const slThangTruoc = Number(sp.SoLuongThangTruoc) || 0;
      const slHaiThangTruoc = Number(sp.SoLuongHaiThangTruoc) || 0;

      // Tính % tăng trưởng so với tháng trước
      let phanTramTangTruong = 0;
      if (slThangTruoc > 0) {
        phanTramTangTruong = ((slThangNay - slThangTruoc) / slThangTruoc) * 100;
      } else if (slThangNay > 0) {
        phanTramTangTruong = 100; // Bắt đầu bán
      }

      const xuHuong = xacDinhXuHuong(phanTramTangTruong);
      const doTinCay = Math.min(
        95,
        Math.max(30, 60 + (slHaiThangTruoc > 0 && slThangTruoc > 0 ? 20 : 0) + (slThangNay > 0 ? 15 : 0))
      );

      // Dự báo số lượng tháng tới (moving average đơn giản)
      const soLuongDuBao = Math.round(
        (slThangNay * 0.5 + slThangTruoc * 0.3 + slHaiThangTruoc * 0.2)
      );

      const deNghiNhapThem = tinhDeNghiNhap(soLuongDuBao, xuHuong, sp.TonKho);

      const lyDo = `Tháng trước: ${slThangTruoc}, tháng này: ${slThangNay} (${phanTramTangTruong > 0 ? "+" : ""}${phanTramTangTruong.toFixed(1)}%). Tồn kho hiện tại: ${sp.TonKho}`;
      const nguonDuLieu = `DON_BAN_HANG ${namHaiThangTruoc}-${String(thangHaiThangTruoc).padStart(2,"0")} đến ${namNay}-${String(thangNay).padStart(2,"0")}`;

      // Upsert DU_BAO_XU_HUONG
      const [existing] = await pool.query(
        "SELECT MaDuBao FROM DU_BAO_XU_HUONG WHERE MaSP = ? AND KyDuBao = ?",
        [sp.MaSP, kyDuBao]
      );

      let maDuBao;
      if (existing.length > 0) {
        maDuBao = existing[0].MaDuBao;
        await pool.query(
          `UPDATE DU_BAO_XU_HUONG SET
             SoLuongDuBao=?, DoTinCay=?, XuHuong=?, LyDo=?, DeNghiNhapThem=?, NgayDuBao=NOW(), NguonDuLieu=?
           WHERE MaDuBao=?`,
          [soLuongDuBao, doTinCay, xuHuong, lyDo, deNghiNhapThem, nguonDuLieu, maDuBao]
        );
      } else {
        const [result] = await pool.query(
          `INSERT INTO DU_BAO_XU_HUONG
           (MaSP, KyDuBao, LoaiKyDuBao, SoLuongDuBao, DoTinCay, XuHuong, LyDo, DeNghiNhapThem, NguonDuLieu)
           VALUES (?, ?, 'thang', ?, ?, ?, ?, ?, ?)`,
          [sp.MaSP, kyDuBao, soLuongDuBao, doTinCay, xuHuong, lyDo, deNghiNhapThem, nguonDuLieu]
        );
        maDuBao = result.insertId;
        soDuBaoTao++;
      }

      // Tạo DE_NGHI_DAT_HANG_DU_BAO nếu xu hướng tăng và cần nhập thêm
      if ((xuHuong === "tang" || xuHuong === "tang_manh") && deNghiNhapThem > 0 && phanTramTangTruong >= NGUONG_TANG_TRUONG) {
        const [existDeNghi] = await pool.query(
          "SELECT MaDeNghi FROM DE_NGHI_DAT_HANG_DU_BAO WHERE MaSP = ? AND MaDuBao = ? AND TrangThai = 'cho_duyet'",
          [sp.MaSP, maDuBao]
        );

        if (existDeNghi.length === 0) {
          await pool.query(
            `INSERT INTO DE_NGHI_DAT_HANG_DU_BAO
             (MaSP, MaDuBao, SoLuongDeNghi, LyDoDeNghi, TrangThai)
             VALUES (?, ?, ?, ?, 'cho_duyet')`,
            [sp.MaSP, maDuBao, deNghiNhapThem,
              `${sp.TenSP} tăng ${phanTramTangTruong.toFixed(1)}% trong tháng vừa qua. Cần nhập thêm ${deNghiNhapThem} đơn vị để đáp ứng nhu cầu dự báo.`]
          );
          soDeNghiTao++;
        }
      }
    }

    const thoiGianMs = Date.now() - batDau;
    await ghiNhatKy(
      "du_bao_xu_huong",
      { kyDuBao },
      { soSanPhamPhanTich: thongKeList.length, soDuBaoTao, soDeNghiTao },
      thongKeList.length,
      soDeNghiTao,
      thoiGianMs
    );

    return { soSanPhamPhanTich: thongKeList.length, soDuBaoTao, soDeNghiTao, kyDuBao, thoiGianMs };
  } catch (err) {
    const thoiGianMs = Date.now() - batDau;
    await ghiNhatKy("du_bao_xu_huong", { kyDuBao }, null, 0, 0, thoiGianMs, "loi", err.message);
    throw err;
  }
};
