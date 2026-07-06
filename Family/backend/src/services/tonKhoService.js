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
 * Quét LO_HANG → tạo CANH_BAO_TON_KHO
 * - Tồn kho lâu ngày (ton_kho_lau)
 * - Sắp hết hạn (sap_het_han)
 * - Đã hết hạn (da_het_han)
 */
export const quetCanhBaoTonKho = async () => {
  const batDau = Date.now();
  let soCanhBaoTao = 0;
  let soLoQuet = 0;

  try {
    // Lấy cấu hình cảnh báo (ưu tiên theo danh mục, fallback NULL)
    const [cauHinhList] = await pool.query(
      "SELECT * FROM CAU_HINH_CANH_BAO WHERE KichHoat = 1"
    );

    // Lấy cấu hình mặc định (MaDanhMuc IS NULL)
    const cauHinhMacDinh = cauHinhList.find((c) => !c.MaDanhMuc) || {
      NguongTonKhoLau: 90,
      NguongSapHetHan: 30,
    };

    // Lấy tất cả lô hàng còn hàng
    const [loHangList] = await pool.query(
      `SELECT lh.MaLo, lh.MaSP, lh.MaNH, lh.SoLuongConLai, lh.NgayNhapKho, lh.HanSuDung,
              sp.TenSP, sp.MaDanhMuc,
              DATEDIFF(NOW(), lh.NgayNhapKho) AS SoNgayTonKho,
              DATEDIFF(lh.HanSuDung, NOW()) AS SoNgayConLaiHSD
       FROM LO_HANG lh
       JOIN SAN_PHAM sp ON lh.MaSP = sp.MaSP
       WHERE lh.SoLuongConLai > 0`
    );

    soLoQuet = loHangList.length;

    for (const lo of loHangList) {
      // Lấy cấu hình theo danh mục (nếu có)
      const cauHinhDanhMuc = cauHinhList.find((c) => c.MaDanhMuc === lo.MaDanhMuc);
      const cauHinh = cauHinhDanhMuc || cauHinhMacDinh;

      // Kiểm tra cảnh báo đã có chưa (tránh duplicate trong ngày)
      const kiemTraDuplicate = async (loaiCanhBao) => {
        const [existing] = await pool.query(
          `SELECT MaCanhBao FROM CANH_BAO_TON_KHO
           WHERE MaLo = ? AND LoaiCanhBao = ? AND TrangThai != 'bo_qua'
             AND DATE(NgayCanhBao) = CURDATE()`,
          [lo.MaLo, loaiCanhBao]
        );
        return existing.length > 0;
      };

      const taoCanBao = async (loaiCanhBao, noiDung, soNgay1, soNgay2, mucDo) => {
        await pool.query(
          `INSERT INTO CANH_BAO_TON_KHO
           (LoaiCanhBao, MaSP, MaLo, NoiDung, SoNgayTonKho, SoNgayConLai, MucDoUuTien, TrangThai)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'chua_xu_ly')`,
          [loaiCanhBao, lo.MaSP, lo.MaLo, noiDung, soNgay1 ?? null, soNgay2 ?? null, mucDo]
        );
        soCanhBaoTao++;
      };

      // 1. Tồn kho lâu ngày
      if (lo.SoNgayTonKho >= cauHinh.NguongTonKhoLau) {
        const isDuplicate = await kiemTraDuplicate("ton_kho_lau");
        if (!isDuplicate) {
          const mucDo = lo.SoNgayTonKho >= cauHinh.NguongTonKhoLau * 2 ? 3 : 2;
          await taoCanBao(
            "ton_kho_lau",
            `Lô ${lo.MaLo} - ${lo.TenSP}: tồn kho ${lo.SoNgayTonKho} ngày, còn ${lo.SoLuongConLai} đơn vị`,
            lo.SoNgayTonKho,
            null,
            mucDo
          );
        }
      }

      // 2. Sắp hết hạn / đã hết hạn
      if (lo.HanSuDung !== null) {
        const ngayConLai = lo.SoNgayConLaiHSD;

        if (ngayConLai < 0) {
          // Đã hết hạn
          const isDuplicate = await kiemTraDuplicate("da_het_han");
          if (!isDuplicate) {
            await taoCanBao(
              "da_het_han",
              `Lô ${lo.MaLo} - ${lo.TenSP}: ĐÃ HẾT HẠN ${Math.abs(ngayConLai)} ngày, còn ${lo.SoLuongConLai} đơn vị cần xử lý`,
              null,
              ngayConLai,
              4
            );
          }
        } else if (ngayConLai <= cauHinh.NguongSapHetHan) {
          // Sắp hết hạn
          const isDuplicate = await kiemTraDuplicate("sap_het_han");
          if (!isDuplicate) {
            const mucDo = ngayConLai <= 7 ? 4 : ngayConLai <= 14 ? 3 : 2;
            await taoCanBao(
              "sap_het_han",
              `Lô ${lo.MaLo} - ${lo.TenSP}: sắp hết hạn sau ${ngayConLai} ngày, còn ${lo.SoLuongConLai} đơn vị`,
              null,
              ngayConLai,
              mucDo
            );
          }
        }
      }
    }

    const thoiGianMs = Date.now() - batDau;
    await ghiNhatKy(
      "canh_bao_ton_kho",
      { thoiDiemQuet: new Date().toISOString() },
      { soLoQuet, soCanhBaoTao },
      soLoQuet,
      soCanhBaoTao,
      thoiGianMs
    );

    return { soLoQuet, soCanhBaoTao, thoiGianMs };
  } catch (err) {
    const thoiGianMs = Date.now() - batDau;
    await ghiNhatKy("canh_bao_ton_kho", {}, null, 0, 0, thoiGianMs, "loi", err.message);
    throw err;
  }
};
