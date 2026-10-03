-- ===================================================
-- BẢNG PHIẾU NHẬP HÀNG
-- ===================================================
CREATE TABLE IF NOT EXISTS PHIEU_NHAP_HANG (
    MaNH        VARCHAR(20)    PRIMARY KEY,
    MaNCC       VARCHAR(20)    NOT NULL,
    MaNV        VARCHAR(20)    NOT NULL,
    NgayNhap    DATETIME       DEFAULT NOW(),
    TongTien    DECIMAL(15,2)  DEFAULT 0,
    GhiChu      TEXT,
    FOREIGN KEY (MaNCC) REFERENCES NHA_CUNG_CAP(MaNCC),
    FOREIGN KEY (MaNV)  REFERENCES NHAN_VIEN(MaNV)
);

-- ===================================================
-- BẢNG CHI TIẾT NHẬP HÀNG
-- ===================================================
CREATE TABLE IF NOT EXISTS CT_NHAP_HANG (
    MaCTNH      VARCHAR(20)    PRIMARY KEY,
    MaNH        VARCHAR(20)    NOT NULL,
    MaSP        VARCHAR(20)    NOT NULL,
    SoLuong     INT            NOT NULL DEFAULT 0,
    DonGiaNhap  DECIMAL(15,2)  NOT NULL DEFAULT 0,
    FOREIGN KEY (MaNH) REFERENCES PHIEU_NHAP_HANG(MaNH) ON DELETE CASCADE,
    FOREIGN KEY (MaSP) REFERENCES SAN_PHAM(MaSP)
);

-- ===================================================
-- BẢNG CHẤM CÔNG
-- ===================================================
CREATE TABLE IF NOT EXISTS CHAM_CONG (
    MaCC        VARCHAR(20)    PRIMARY KEY,
    MaNV        VARCHAR(20)    NOT NULL,
    NgayLam     DATE           NOT NULL,
    GioVao      TIME,
    GioRa       TIME,
    SoGioLam    DECIMAL(5,2)   DEFAULT 0,
    TrangThai   ENUM('di_lam', 'nghi_phep', 'vang_mat', 'lam_them') DEFAULT 'di_lam',
    GhiChu      TEXT,
    UNIQUE KEY uk_nv_ngay (MaNV, NgayLam),
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV)
);

-- ===================================================
-- BẢNG LƯƠNG
-- ===================================================
CREATE TABLE IF NOT EXISTS BANG_LUONG (
    MaBL        VARCHAR(20)    PRIMARY KEY,
    MaNV        VARCHAR(20)    NOT NULL,
    Thang       TINYINT        NOT NULL,
    Nam         YEAR           NOT NULL,
    SoNgayLam   INT            DEFAULT 0,
    SoGioLam    DECIMAL(7,2)   DEFAULT 0,
    LuongCoBan  DECIMAL(15,2)  NOT NULL DEFAULT 0,
    PhuCap      DECIMAL(15,2)  DEFAULT 0,
    KhauTru     DECIMAL(15,2)  DEFAULT 0,
    TongLuong   DECIMAL(15,2)  DEFAULT 0,
    TrangThai   ENUM('chua_thanh_toan', 'da_thanh_toan') DEFAULT 'chua_thanh_toan',
    GhiChu      TEXT,
    UNIQUE KEY uk_nv_thang_nam (MaNV, Thang, Nam),
    FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV)
);
