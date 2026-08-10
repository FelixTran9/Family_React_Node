import crypto from "crypto";
import pool from "../config/db.js";

const genMaCC = () => "CC" + crypto.randomBytes(3).toString("hex").toUpperCase();
const genMaBL = () => "BL" + crypto.randomBytes(3).toString("hex").toUpperCase();
const DEFAULT_WORK_HOURS = 8;
const CHAM_CONG_TRANG_THAI_TINH_LUONG = ["di_lam", "lam_them"];
let chamCongSchemaPromise;
let bangLuongSchemaPromise;

const tinhThongTinChamCong = (GioVao, GioRa, TrangThai) => {
  if (GioVao && GioRa) {
    const [h1, m1] = GioVao.split(":").map(Number);
    const [h2, m2] = GioRa.split(":").map(Number);
    const soGioLam = Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);

    return {
      soGioLam,
      tangCa: Math.max(0, soGioLam - DEFAULT_WORK_HOURS),
    };
  }

  if (TrangThai === "nghi_phep" || TrangThai === "vang_mat") {
    return { soGioLam: 0, tangCa: 0 };
  }

  return { soGioLam: DEFAULT_WORK_HOURS, tangCa: 0 };
};

const getChamCongSchema = async () => {
  if (!chamCongSchemaPromise) {
    chamCongSchemaPromise = (async () => {
      const [columns] = await pool.query("SHOW COLUMNS FROM CHAM_CONG");
      const columnNames = new Set(columns.map((column) => column.Field));

      return {
        idColumn: columnNames.has("MaCC") ? "MaCC" : "MaChamCong",
        dateColumn: columnNames.has("NgayLam") ? "NgayLam" : "Ngay",
        noteColumn: columnNames.has("GhiChu") ? "GhiChu" : null,
        tangCaColumn: columnNames.has("TangCa") ? "TangCa" : null,
        usesGeneratedId: columnNames.has("MaCC"),
      };
    })();
  }

  return chamCongSchemaPromise;
};

const tinhTongLuong = ({ soNgayLam = 0, luongCoBan = 0, phuCap = 0, khauTru = 0, tienThuong = 0 }) =>
  Math.round(
    (Number(soNgayLam || 0) / 26) * Number(luongCoBan || 0) +
      Number(phuCap || 0) +
      Number(tienThuong || 0) -
      Number(khauTru || 0)
  );

const getBangLuongSchema = async () => {
  if (!bangLuongSchemaPromise) {
    bangLuongSchemaPromise = (async () => {
      const [columns] = await pool.query("SHOW COLUMNS FROM BANG_LUONG");
      const columnNames = new Set(columns.map((column) => column.Field));

      return {
        idColumn: columnNames.has("MaBL") ? "MaBL" : "MaLuong",
        dayCountColumn: columnNames.has("SoNgayLam") ? "SoNgayLam" : null,
        hourCountColumn: columnNames.has("SoGioLam") ? "SoGioLam" : null,
        deductionColumn: columnNames.has("KhauTru") ? "KhauTru" : columnNames.has("TienPhat") ? "TienPhat" : null,
        totalColumn: columnNames.has("TongLuong") ? "TongLuong" : columnNames.has("LuongThucLanh") ? "LuongThucLanh" : null,
        statusColumn: columnNames.has("TrangThai") ? "TrangThai" : null,
        noteColumn: columnNames.has("GhiChu") ? "GhiChu" : null,
        rewardColumn: columnNames.has("TienThuong") ? "TienThuong" : null,
        paidDateColumn: columnNames.has("NgayNhan") ? "NgayNhan" : null,
      };
    })();
  }

  return bangLuongSchemaPromise;
};

const getBangLuongQueryParts = async (alias = "bl") => {
  const schema = await getBangLuongSchema();
  const chamCongSchema = await getChamCongSchema();
  const summaryAlias = `${alias}_cc_summary`;
  const needsChamCongSummary = !schema.dayCountColumn || !schema.hourCountColumn;

  return {
    schema,
    summaryJoin: needsChamCongSummary
      ? `LEFT JOIN (
           SELECT cc.MaNV,
                  MONTH(cc.${chamCongSchema.dateColumn}) AS Thang,
                  YEAR(cc.${chamCongSchema.dateColumn}) AS Nam,
                  COUNT(CASE WHEN cc.TrangThai IN ('${CHAM_CONG_TRANG_THAI_TINH_LUONG.join("','")}') THEN 1 END) AS SoNgayLam,
                  COALESCE(SUM(cc.SoGioLam), 0) AS SoGioLam
           FROM CHAM_CONG cc
           GROUP BY cc.MaNV, MONTH(cc.${chamCongSchema.dateColumn}), YEAR(cc.${chamCongSchema.dateColumn})
         ) ${summaryAlias}
         ON ${summaryAlias}.MaNV = ${alias}.MaNV
        AND ${summaryAlias}.Thang = ${alias}.Thang
        AND ${summaryAlias}.Nam = ${alias}.Nam`
      : "",
    soNgayLamExpr: schema.dayCountColumn ? `${alias}.${schema.dayCountColumn}` : `COALESCE(${summaryAlias}.SoNgayLam, 0)`,
    soGioLamExpr: schema.hourCountColumn ? `${alias}.${schema.hourCountColumn}` : `COALESCE(${summaryAlias}.SoGioLam, 0)`,
    khauTruExpr: schema.deductionColumn ? `COALESCE(${alias}.${schema.deductionColumn}, 0)` : "0",
    tongLuongExpr: schema.totalColumn ? `COALESCE(${alias}.${schema.totalColumn}, 0)` : "0",
    trangThaiExpr: schema.statusColumn
      ? `${alias}.${schema.statusColumn}`
      : schema.paidDateColumn
        ? `CASE WHEN ${alias}.${schema.paidDateColumn} IS NULL THEN 'chua_thanh_toan' ELSE 'da_thanh_toan' END`
        : "'chua_thanh_toan'",
    ghiChuExpr: schema.noteColumn ? `${alias}.${schema.noteColumn}` : "NULL",
  };
};

// ===================== CHẤM CÔNG =====================

/**
 * GET /api/admin/cham-cong?thang=4&nam=2026&maNV=
 */
export const getChamCong = async (req, res) => {
  const { thang, nam, maNV = "", page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    const schema = await getChamCongSchema();
    let where = "WHERE 1=1";
    const params = [];
    if (thang) { where += ` AND MONTH(cc.${schema.dateColumn}) = ?`; params.push(thang); }
    if (nam)   { where += ` AND YEAR(cc.${schema.dateColumn}) = ?`;  params.push(nam);   }
    if (maNV)  { where += " AND cc.MaNV = ?";                        params.push(maNV);  }

    const [rows] = await pool.query(
      `SELECT cc.${schema.idColumn} AS MaCC, cc.MaNV, cc.${schema.dateColumn} AS NgayLam, cc.GioVao, cc.GioRa,
              cc.SoGioLam, cc.TrangThai, ${schema.noteColumn ? `cc.${schema.noteColumn}` : "NULL"} AS GhiChu,
              nv.TenNV, nv.TaiKhoan
       FROM CHAM_CONG cc
       LEFT JOIN NHAN_VIEN nv ON cc.MaNV = nv.MaNV
       ${where}
       ORDER BY cc.${schema.dateColumn} DESC, nv.TenNV
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM CHAM_CONG cc
       LEFT JOIN NHAN_VIEN nv ON cc.MaNV = nv.MaNV ${where}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu chấm công", error: err.message });
  }
};

/**
 * GET /api/admin/cham-cong/:id
 */
export const getChamCongById = async (req, res) => {
  try {
    const schema = await getChamCongSchema();
    const [rows] = await pool.query(
      `SELECT cc.${schema.idColumn} AS MaCC, cc.MaNV, cc.${schema.dateColumn} AS NgayLam, cc.GioVao, cc.GioRa,
              cc.SoGioLam, cc.TrangThai, ${schema.noteColumn ? `cc.${schema.noteColumn}` : "NULL"} AS GhiChu,
              nv.TenNV, nv.TaiKhoan
       FROM CHAM_CONG cc
       LEFT JOIN NHAN_VIEN nv ON cc.MaNV = nv.MaNV
       WHERE cc.${schema.idColumn} = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy bản ghi chấm công" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi", error: err.message });
  }
};

/**
 * POST /api/admin/cham-cong
 */
export const createChamCong = async (req, res) => {
  const { MaNV, NgayLam, GioVao, GioRa, TrangThai, GhiChu } = req.body;
  if (!MaNV || !NgayLam || !TrangThai) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc (Nhân viên, Ngày làm, Trạng thái)" });
  }
  try {
    const schema = await getChamCongSchema();
    // Kiểm tra đã chấm công ngày đó chưa
    const [exists] = await pool.query(
      `SELECT ${schema.idColumn} FROM CHAM_CONG WHERE MaNV = ? AND ${schema.dateColumn} = ?`,
      [MaNV, NgayLam]
    );
    if (exists.length > 0) {
      return res.status(400).json({ message: "Nhân viên này đã được chấm công cho ngày này" });
    }

    const { soGioLam, tangCa } = tinhThongTinChamCong(GioVao, GioRa, TrangThai);
    const insertColumns = ["MaNV", schema.dateColumn, "GioVao", "GioRa", "SoGioLam", "TrangThai"];
    const insertValues = [MaNV, NgayLam, GioVao || null, GioRa || null, soGioLam, TrangThai];

    let MaCC = null;
    if (schema.usesGeneratedId) {
      MaCC = genMaCC();
      let [check] = await pool.query(`SELECT ${schema.idColumn} FROM CHAM_CONG WHERE ${schema.idColumn} = ?`, [MaCC]);
      while (check.length > 0) {
        MaCC = genMaCC();
        [check] = await pool.query(`SELECT ${schema.idColumn} FROM CHAM_CONG WHERE ${schema.idColumn} = ?`, [MaCC]);
      }
      insertColumns.unshift(schema.idColumn);
      insertValues.unshift(MaCC);
    }
    if (schema.tangCaColumn) {
      insertColumns.push(schema.tangCaColumn);
      insertValues.push(tangCa);
    }
    if (schema.noteColumn) {
      insertColumns.push(schema.noteColumn);
      insertValues.push(GhiChu || null);
    }

    const placeholders = insertColumns.map(() => "?").join(", ");
    const [result] = await pool.query(
      `INSERT INTO CHAM_CONG (${insertColumns.join(", ")})
       VALUES (${placeholders})`,
      insertValues
    );
    res.status(201).json({
      message: schema.noteColumn || !GhiChu ? "Chấm công thành công" : "Chấm công thành công (ghi chú chưa được lưu ở schema hiện tại)",
      MaCC: schema.usesGeneratedId ? MaCC : result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi chấm công", error: err.message });
  }
};

/**
 * PUT /api/admin/cham-cong/:id
 */
export const updateChamCong = async (req, res) => {
  const { GioVao, GioRa, TrangThai, GhiChu } = req.body;
  if (!TrangThai) return res.status(400).json({ message: "Thiếu trạng thái" });
  try {
    const schema = await getChamCongSchema();
    const { soGioLam, tangCa } = tinhThongTinChamCong(GioVao, GioRa, TrangThai);
    const updateSet = ["GioVao=?", "GioRa=?", "SoGioLam=?", "TrangThai=?"];
    const updateValues = [GioVao || null, GioRa || null, soGioLam, TrangThai];

    if (schema.tangCaColumn) {
      updateSet.splice(3, 0, `${schema.tangCaColumn}=?`);
      updateValues.splice(3, 0, tangCa);
    }
    if (schema.noteColumn) {
      updateSet.push(`${schema.noteColumn}=?`);
      updateValues.push(GhiChu || null);
    }

    const [result] = await pool.query(
      `UPDATE CHAM_CONG SET ${updateSet.join(", ")} WHERE ${schema.idColumn}=?`,
      [...updateValues, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi chấm công" });
    }
    res.json({
      message: schema.noteColumn || !GhiChu ? "Cập nhật chấm công thành công" : "Cập nhật chấm công thành công (ghi chú chưa được lưu ở schema hiện tại)",
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
};

/**
 * DELETE /api/admin/cham-cong/:id
 */
export const deleteChamCong = async (req, res) => {
  try {
    const schema = await getChamCongSchema();
    const [result] = await pool.query(`DELETE FROM CHAM_CONG WHERE ${schema.idColumn} = ?`, [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi chấm công" });
    }
    res.json({ message: "Đã xóa bản ghi chấm công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa", error: err.message });
  }
};

// ===================== BẢNG LƯƠNG =====================

/**
 * GET /api/admin/bang-luong?thang=4&nam=2026
 */
export const getBangLuong = async (req, res) => {
  const { thang, nam, maNV = "", page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    const queryParts = await getBangLuongQueryParts("bl");
    let where = "WHERE 1=1";
    const params = [];
    if (thang) { where += " AND bl.Thang = ?"; params.push(thang); }
    if (nam)   { where += " AND bl.Nam = ?";   params.push(nam);   }
    if (maNV)  { where += " AND bl.MaNV = ?";  params.push(maNV); }

    const [rows] = await pool.query(
      `SELECT bl.${queryParts.schema.idColumn} AS MaBL, bl.MaNV, bl.Thang, bl.Nam,
              ${queryParts.soNgayLamExpr} AS SoNgayLam,
              ${queryParts.soGioLamExpr} AS SoGioLam,
              COALESCE(bl.LuongCoBan, 0) AS LuongCoBan,
              COALESCE(bl.PhuCap, 0) AS PhuCap,
              ${queryParts.khauTruExpr} AS KhauTru,
              ${queryParts.tongLuongExpr} AS TongLuong,
              ${queryParts.trangThaiExpr} AS TrangThai,
              ${queryParts.ghiChuExpr} AS GhiChu,
              nv.TenNV, nv.TaiKhoan
       FROM BANG_LUONG bl
       LEFT JOIN NHAN_VIEN nv ON bl.MaNV = nv.MaNV
       ${queryParts.summaryJoin}
       ${where}
       ORDER BY bl.Nam DESC, bl.Thang DESC, nv.TenNV
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM BANG_LUONG bl
       LEFT JOIN NHAN_VIEN nv ON bl.MaNV = nv.MaNV ${where}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy bảng lương", error: err.message });
  }
};

/**
 * GET /api/admin/bang-luong/:id
 */
export const getBangLuongById = async (req, res) => {
  try {
    const queryParts = await getBangLuongQueryParts("bl");
    const [rows] = await pool.query(
      `SELECT bl.${queryParts.schema.idColumn} AS MaBL, bl.MaNV, bl.Thang, bl.Nam,
              ${queryParts.soNgayLamExpr} AS SoNgayLam,
              ${queryParts.soGioLamExpr} AS SoGioLam,
              COALESCE(bl.LuongCoBan, 0) AS LuongCoBan,
              COALESCE(bl.PhuCap, 0) AS PhuCap,
              ${queryParts.khauTruExpr} AS KhauTru,
              ${queryParts.tongLuongExpr} AS TongLuong,
              ${queryParts.trangThaiExpr} AS TrangThai,
              ${queryParts.ghiChuExpr} AS GhiChu,
              nv.TenNV, nv.TaiKhoan
       FROM BANG_LUONG bl
       LEFT JOIN NHAN_VIEN nv ON bl.MaNV = nv.MaNV
       ${queryParts.summaryJoin}
       WHERE bl.${queryParts.schema.idColumn} = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy bảng lương" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi", error: err.message });
  }
};

/**
 * POST /api/admin/bang-luong/tinh-luong — Tự động tính lương từ chấm công
 */
export const tinhLuong = async (req, res) => {
  const { Thang, Nam, LuongCoBanMacDinh, PhuCap = 0, KhauTru = 0 } = req.body;
  if (!Thang || !Nam || !LuongCoBanMacDinh) {
    return res.status(400).json({ message: "Thiếu thông tin: Tháng, Năm, Lương cơ bản" });
  }
  const conn = await pool.getConnection();
  try {
    const bangLuongSchema = await getBangLuongSchema();
    const chamCongSchema = await getChamCongSchema();
    await conn.beginTransaction();

    // Lấy thống kê chấm công theo tháng
    const [chamCongData] = await conn.query(
      `SELECT cc.MaNV,
              COUNT(CASE WHEN cc.TrangThai IN ('${CHAM_CONG_TRANG_THAI_TINH_LUONG.join("','")}') THEN 1 END) AS SoNgayLam,
              SUM(cc.SoGioLam) AS TongGio
       FROM CHAM_CONG cc
       WHERE MONTH(cc.${chamCongSchema.dateColumn}) = ? AND YEAR(cc.${chamCongSchema.dateColumn}) = ?
       GROUP BY cc.MaNV`,
      [Thang, Nam]
    );

    if (chamCongData.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: "Không có dữ liệu chấm công cho tháng/năm này" });
    }

    let created = 0;
    let updated = 0;

    for (const cc of chamCongData) {
      const SoNgayLam = cc.SoNgayLam || 0;
      const SoGioLam = cc.TongGio || 0;

      const [existing] = await conn.query(
        `SELECT ${bangLuongSchema.idColumn} AS MaBL${
          bangLuongSchema.rewardColumn ? `, COALESCE(${bangLuongSchema.rewardColumn}, 0) AS TienThuong` : ""
        } FROM BANG_LUONG WHERE MaNV = ? AND Thang = ? AND Nam = ?`,
        [cc.MaNV, Thang, Nam]
      );
      const tienThuong = bangLuongSchema.rewardColumn && existing.length > 0 ? Number(existing[0].TienThuong || 0) : 0;
      const TongLuong = tinhTongLuong({
        soNgayLam: SoNgayLam,
        luongCoBan: LuongCoBanMacDinh,
        phuCap: PhuCap,
        khauTru: KhauTru,
        tienThuong,
      });

      if (existing.length > 0) {
        const updateSet = ["LuongCoBan=?", "PhuCap=?"];
        const updateValues = [LuongCoBanMacDinh, PhuCap];

        if (bangLuongSchema.dayCountColumn) {
          updateSet.push(`${bangLuongSchema.dayCountColumn}=?`);
          updateValues.push(SoNgayLam);
        }
        if (bangLuongSchema.hourCountColumn) {
          updateSet.push(`${bangLuongSchema.hourCountColumn}=?`);
          updateValues.push(SoGioLam);
        }
        if (bangLuongSchema.deductionColumn) {
          updateSet.push(`${bangLuongSchema.deductionColumn}=?`);
          updateValues.push(KhauTru);
        }
        if (bangLuongSchema.totalColumn) {
          updateSet.push(`${bangLuongSchema.totalColumn}=?`);
          updateValues.push(TongLuong);
        }
        if (bangLuongSchema.statusColumn) {
          updateSet.push(`${bangLuongSchema.statusColumn}='chua_thanh_toan'`);
        } else if (bangLuongSchema.paidDateColumn) {
          updateSet.push(`${bangLuongSchema.paidDateColumn}=NULL`);
        }

        await conn.query(
          `UPDATE BANG_LUONG SET ${updateSet.join(", ")} WHERE ${bangLuongSchema.idColumn}=?`,
          [...updateValues, existing[0].MaBL]
        );
        updated++;
      } else {
        let MaBL = genMaBL();
        let [chk] = await conn.query(`SELECT ${bangLuongSchema.idColumn} FROM BANG_LUONG WHERE ${bangLuongSchema.idColumn} = ?`, [MaBL]);
        while (chk.length > 0) {
          MaBL = genMaBL();
          [chk] = await conn.query(`SELECT ${bangLuongSchema.idColumn} FROM BANG_LUONG WHERE ${bangLuongSchema.idColumn} = ?`, [MaBL]);
        }

        const insertColumns = [bangLuongSchema.idColumn, "MaNV", "Thang", "Nam", "LuongCoBan", "PhuCap"];
        const insertValues = [MaBL, cc.MaNV, Thang, Nam, LuongCoBanMacDinh, PhuCap];

        if (bangLuongSchema.dayCountColumn) {
          insertColumns.push(bangLuongSchema.dayCountColumn);
          insertValues.push(SoNgayLam);
        }
        if (bangLuongSchema.hourCountColumn) {
          insertColumns.push(bangLuongSchema.hourCountColumn);
          insertValues.push(SoGioLam);
        }
        if (bangLuongSchema.rewardColumn) {
          insertColumns.push(bangLuongSchema.rewardColumn);
          insertValues.push(0);
        }
        if (bangLuongSchema.deductionColumn) {
          insertColumns.push(bangLuongSchema.deductionColumn);
          insertValues.push(KhauTru);
        }
        if (bangLuongSchema.totalColumn) {
          insertColumns.push(bangLuongSchema.totalColumn);
          insertValues.push(TongLuong);
        }
        if (bangLuongSchema.statusColumn) {
          insertColumns.push(bangLuongSchema.statusColumn);
          insertValues.push("chua_thanh_toan");
        }

        await conn.query(
          `INSERT INTO BANG_LUONG (${insertColumns.join(", ")})
           VALUES (${insertColumns.map(() => "?").join(", ")})`,
          insertValues
        );
        created++;
      }
    }

    await conn.commit();
    res.status(201).json({ message: `Đã tính lương: ${created} mới, ${updated} cập nhật`, created, updated });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi tính lương", error: err.message });
  } finally {
    conn.release();
  }
};

/**
 * POST /api/admin/bang-luong — Tạo bảng lương thủ công
 */
export const createBangLuong = async (req, res) => {
  const { MaNV, Thang, Nam, SoNgayLam, SoGioLam, LuongCoBan, PhuCap = 0, KhauTru = 0, GhiChu } = req.body;
  if (!MaNV || !Thang || !Nam || LuongCoBan === undefined) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }
  try {
    const bangLuongSchema = await getBangLuongSchema();
    const [existing] = await pool.query(
      `SELECT ${bangLuongSchema.idColumn} FROM BANG_LUONG WHERE MaNV = ? AND Thang = ? AND Nam = ?`,
      [MaNV, Thang, Nam]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Nhân viên này đã có bảng lương tháng này. Hãy chỉnh sửa bảng lương hiện có." });
    }

    let MaBL = genMaBL();
    let [check] = await pool.query(`SELECT ${bangLuongSchema.idColumn} FROM BANG_LUONG WHERE ${bangLuongSchema.idColumn} = ?`, [MaBL]);
    while (check.length > 0) {
      MaBL = genMaBL();
      [check] = await pool.query(`SELECT ${bangLuongSchema.idColumn} FROM BANG_LUONG WHERE ${bangLuongSchema.idColumn} = ?`, [MaBL]);
    }

    const TongLuong = tinhTongLuong({
      soNgayLam: SoNgayLam,
      luongCoBan: LuongCoBan,
      phuCap: PhuCap,
      khauTru: KhauTru,
      tienThuong: 0,
    });

    const insertColumns = [bangLuongSchema.idColumn, "MaNV", "Thang", "Nam", "LuongCoBan", "PhuCap"];
    const insertValues = [MaBL, MaNV, Thang, Nam, LuongCoBan, PhuCap];

    if (bangLuongSchema.dayCountColumn) {
      insertColumns.push(bangLuongSchema.dayCountColumn);
      insertValues.push(SoNgayLam || 0);
    }
    if (bangLuongSchema.hourCountColumn) {
      insertColumns.push(bangLuongSchema.hourCountColumn);
      insertValues.push(SoGioLam || 0);
    }
    if (bangLuongSchema.rewardColumn) {
      insertColumns.push(bangLuongSchema.rewardColumn);
      insertValues.push(0);
    }
    if (bangLuongSchema.deductionColumn) {
      insertColumns.push(bangLuongSchema.deductionColumn);
      insertValues.push(KhauTru);
    }
    if (bangLuongSchema.totalColumn) {
      insertColumns.push(bangLuongSchema.totalColumn);
      insertValues.push(TongLuong);
    }
    if (bangLuongSchema.statusColumn) {
      insertColumns.push(bangLuongSchema.statusColumn);
      insertValues.push("chua_thanh_toan");
    }
    if (bangLuongSchema.noteColumn) {
      insertColumns.push(bangLuongSchema.noteColumn);
      insertValues.push(GhiChu || null);
    }

    await pool.query(
      `INSERT INTO BANG_LUONG (${insertColumns.join(", ")})
       VALUES (${insertColumns.map(() => "?").join(", ")})`,
      insertValues
    );
    res.status(201).json({
      message: bangLuongSchema.noteColumn || !GhiChu ? "Tạo bảng lương thành công" : "Tạo bảng lương thành công (ghi chú chưa được lưu ở schema hiện tại)",
      MaBL,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo bảng lương", error: err.message });
  }
};

/**
 * PUT /api/admin/bang-luong/:id
 */
export const updateBangLuong = async (req, res) => {
  const { SoNgayLam, SoGioLam, LuongCoBan, PhuCap = 0, KhauTru = 0, TrangThai, GhiChu } = req.body;
  try {
    const bangLuongSchema = await getBangLuongSchema();
    const normalizedStatus = TrangThai === "da_thanh_toan" ? "da_thanh_toan" : "chua_thanh_toan";
    let tienThuong = 0;

    if (bangLuongSchema.rewardColumn) {
      const [rows] = await pool.query(
        `SELECT COALESCE(${bangLuongSchema.rewardColumn}, 0) AS TienThuong FROM BANG_LUONG WHERE ${bangLuongSchema.idColumn} = ?`,
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy bảng lương" });
      }
      tienThuong = Number(rows[0].TienThuong || 0);
    }

    const TongLuong = tinhTongLuong({
      soNgayLam: SoNgayLam,
      luongCoBan: LuongCoBan,
      phuCap: PhuCap,
      khauTru: KhauTru,
      tienThuong,
    });

    const updateSet = ["LuongCoBan=?", "PhuCap=?"];
    const updateValues = [LuongCoBan, PhuCap];

    if (bangLuongSchema.dayCountColumn) {
      updateSet.push(`${bangLuongSchema.dayCountColumn}=?`);
      updateValues.push(SoNgayLam);
    }
    if (bangLuongSchema.hourCountColumn) {
      updateSet.push(`${bangLuongSchema.hourCountColumn}=?`);
      updateValues.push(SoGioLam);
    }
    if (bangLuongSchema.deductionColumn) {
      updateSet.push(`${bangLuongSchema.deductionColumn}=?`);
      updateValues.push(KhauTru);
    }
    if (bangLuongSchema.totalColumn) {
      updateSet.push(`${bangLuongSchema.totalColumn}=?`);
      updateValues.push(TongLuong);
    }
    if (bangLuongSchema.statusColumn) {
      updateSet.push(`${bangLuongSchema.statusColumn}=?`);
      updateValues.push(normalizedStatus);
    } else if (bangLuongSchema.paidDateColumn) {
      updateSet.push(`${bangLuongSchema.paidDateColumn}=${normalizedStatus === "da_thanh_toan" ? "CURRENT_DATE()" : "NULL"}`);
    }
    if (bangLuongSchema.noteColumn) {
      updateSet.push(`${bangLuongSchema.noteColumn}=?`);
      updateValues.push(GhiChu || null);
    }

    const [result] = await pool.query(
      `UPDATE BANG_LUONG SET ${updateSet.join(", ")} WHERE ${bangLuongSchema.idColumn}=?`,
      [...updateValues, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy bảng lương" });
    }
    res.json({
      message: bangLuongSchema.noteColumn || !GhiChu ? "Cập nhật bảng lương thành công" : "Cập nhật bảng lương thành công (ghi chú chưa được lưu ở schema hiện tại)",
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật bảng lương", error: err.message });
  }
};

/**
 * PATCH /api/admin/bang-luong/:id/thanh-toan
 */
export const thanhToanLuong = async (req, res) => {
  try {
    const bangLuongSchema = await getBangLuongSchema();
    const [result] = await pool.query(
      bangLuongSchema.statusColumn
        ? `UPDATE BANG_LUONG SET ${bangLuongSchema.statusColumn}='da_thanh_toan' WHERE ${bangLuongSchema.idColumn} = ?`
        : `UPDATE BANG_LUONG SET ${bangLuongSchema.paidDateColumn}=CURRENT_DATE() WHERE ${bangLuongSchema.idColumn} = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy bảng lương" });
    }
    res.json({ message: "Đã xác nhận thanh toán lương" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xác nhận thanh toán", error: err.message });
  }
};

/**
 * DELETE /api/admin/bang-luong/:id
 */
export const deleteBangLuong = async (req, res) => {
  try {
    const bangLuongSchema = await getBangLuongSchema();
    const [result] = await pool.query(`DELETE FROM BANG_LUONG WHERE ${bangLuongSchema.idColumn} = ?`, [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy bảng lương" });
    }
    res.json({ message: "Đã xóa bảng lương" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa bảng lương", error: err.message });
  }
};
