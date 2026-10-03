-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 03, 2026 at 09:06 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quanlycuahang`
--

-- --------------------------------------------------------

--
-- Table structure for table `BANG_LUONG`
--

CREATE TABLE `BANG_LUONG` (
  `MaLuong` varchar(20) NOT NULL,
  `Thang` int(11) NOT NULL,
  `Nam` int(11) NOT NULL,
  `LuongCoBan` decimal(15,2) DEFAULT 0.00,
  `PhuCap` decimal(15,2) DEFAULT 0.00,
  `TienThuong` decimal(15,2) DEFAULT 0.00,
  `TienPhat` decimal(15,2) DEFAULT 0.00,
  `LuongThucLanh` decimal(15,2) DEFAULT 0.00,
  `NgayNhan` date DEFAULT NULL,
  `MaCHT` varchar(20) DEFAULT NULL,
  `MaTL` varchar(20) DEFAULT NULL,
  `MaNV` varchar(20) DEFAULT NULL
) ;

--
-- Dumping data for table `BANG_LUONG`
--

INSERT INTO `BANG_LUONG` (`MaLuong`, `Thang`, `Nam`, `LuongCoBan`, `PhuCap`, `TienThuong`, `TienPhat`, `LuongThucLanh`, `NgayNhan`, `MaCHT`, `MaTL`, `MaNV`) VALUES
('BL2CCE75', 4, 2026, 5000000.00, 300000.00, 0.00, 300000.00, 192308.00, '2026-04-27', NULL, NULL, 'NVFFFF86'),
('BL6B9308', 8, 2026, 5000000.00, 300000.00, 0.00, 0.00, 492308.00, NULL, NULL, NULL, 'NVYOBH0D'),
('BL9BDB9C', 7, 2026, 5000000.00, 300000.00, 0.00, 0.00, 684615.00, NULL, NULL, NULL, 'NVEB6F30'),
('BLA89D5B', 7, 2026, 5000000.00, 300000.00, 0.00, 0.00, 300000.00, NULL, NULL, NULL, 'NVYOBH0D');

-- --------------------------------------------------------

--
-- Table structure for table `CANH_BAO_TON_KHO`
--

CREATE TABLE `CANH_BAO_TON_KHO` (
  `MaCanhBao` int(11) NOT NULL,
  `LoaiCanhBao` varchar(50) NOT NULL COMMENT 'ton_kho_lau | sap_het_han | da_het_han | ton_kho_thap',
  `MaSP` varchar(20) NOT NULL COMMENT 'FK → SAN_PHAM',
  `MaLo` varchar(20) DEFAULT NULL COMMENT 'FK → LO_HANG (nếu liên quan lô cụ thể)',
  `NgayCanhBao` datetime NOT NULL DEFAULT current_timestamp(),
  `NoiDung` text NOT NULL COMMENT 'Mô tả chi tiết cảnh báo',
  `SoNgayTonKho` int(11) DEFAULT NULL COMMENT 'Số ngày hàng chưa bán (cho loại ton_kho_lau)',
  `SoNgayConLai` int(11) DEFAULT NULL COMMENT 'Số ngày đến hạn (cho loại sap_het_han)',
  `MucDoUuTien` tinyint(1) NOT NULL DEFAULT 2 COMMENT '1=Thấp, 2=Trung bình, 3=Cao, 4=Khẩn cấp',
  `TrangThai` varchar(30) NOT NULL DEFAULT 'chua_xu_ly' COMMENT 'chua_xu_ly | dang_xu_ly | da_xu_ly | bo_qua',
  `NguoiXuLy` varchar(20) DEFAULT NULL COMMENT 'FK → NHAN_VIEN hoặc TRO_LY_CUA_HANG',
  `NgayXuLy` datetime DEFAULT NULL,
  `GhiChuXuLy` text DEFAULT NULL
) ;

--
-- Dumping data for table `CANH_BAO_TON_KHO`
--

INSERT INTO `CANH_BAO_TON_KHO` (`MaCanhBao`, `LoaiCanhBao`, `MaSP`, `MaLo`, `NgayCanhBao`, `NoiDung`, `SoNgayTonKho`, `SoNgayConLai`, `MucDoUuTien`, `TrangThai`, `NguoiXuLy`, `NgayXuLy`, `GhiChuXuLy`) VALUES
(1, 'ton_kho_thap', 'SP3774B6', NULL, '2026-07-16 16:27:39', 'Sản phẩm alo sắp hết hàng (còn 4, ngưỡng: 10)', NULL, NULL, 3, 'dang_xu_ly', NULL, '2026-07-16 16:39:56', NULL),
(2, 'ton_kho_thap', 'SP67ECD4', NULL, '2026-07-16 16:27:39', 'Sản phẩm pepsi sắp hết hàng (còn 1, ngưỡng: 10)', NULL, NULL, 3, 'da_xu_ly', NULL, '2026-07-16 16:28:13', NULL),
(3, 'ton_kho_thap', 'SP3774B6', NULL, '2026-07-22 08:34:39', 'Sản phẩm alo sắp hết hàng (còn 8, ngưỡng: 10)', NULL, NULL, 2, 'da_xu_ly', NULL, '2026-08-10 09:42:55', NULL),
(4, 'ton_kho_thap', 'SP67ECD4', NULL, '2026-07-22 08:34:39', 'Sản phẩm pepsi sắp hết hàng (còn 3, ngưỡng: 10)', NULL, NULL, 3, 'da_xu_ly', NULL, '2026-08-10 09:42:53', NULL),
(5, 'ton_kho_thap', 'SP3774B6', NULL, '2026-08-10 09:42:56', 'Sản phẩm alo sắp hết hàng (còn 8, ngưỡng: 10)', NULL, NULL, 2, 'chua_xu_ly', NULL, NULL, NULL),
(6, 'ton_kho_thap', 'SP67ECD4', NULL, '2026-08-10 09:42:56', 'Sản phẩm pepsi sắp hết hàng (còn 3, ngưỡng: 10)', NULL, NULL, 3, 'chua_xu_ly', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `CAU_HINH_CANH_BAO`
--

CREATE TABLE `CAU_HINH_CANH_BAO` (
  `MaCauHinh` int(11) NOT NULL,
  `MaDanhMuc` varchar(20) DEFAULT NULL COMMENT 'NULL = áp dụng cho tất cả danh mục',
  `NguongTonKhoLau` int(11) NOT NULL DEFAULT 90 COMMENT 'Số ngày không bán → cảnh báo tồn lâu',
  `NguongSapHetHan` int(11) NOT NULL DEFAULT 30 COMMENT 'Số ngày trước HSD → cảnh báo sắp hết hạn',
  `NguongTonKhoThap` int(11) NOT NULL DEFAULT 10 COMMENT 'Số lượng tồn kho tối thiểu',
  `KichHoat` tinyint(1) NOT NULL DEFAULT 1,
  `NgayCapNhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Ngưỡng cảnh báo tồn kho, có thể tùy chỉnh theo danh mục sản phẩm';

--
-- Dumping data for table `CAU_HINH_CANH_BAO`
--

INSERT INTO `CAU_HINH_CANH_BAO` (`MaCauHinh`, `MaDanhMuc`, `NguongTonKhoLau`, `NguongSapHetHan`, `NguongTonKhoThap`, `KichHoat`, `NgayCapNhat`) VALUES
(1, NULL, 90, 30, 10, 1, '2026-06-05 14:36:24');

-- --------------------------------------------------------

--
-- Table structure for table `CHAM_CONG`
--

CREATE TABLE `CHAM_CONG` (
  `MaChamCong` int(11) NOT NULL,
  `Ngay` date NOT NULL,
  `GioVao` time DEFAULT NULL,
  `GioRa` time DEFAULT NULL,
  `SoGioLam` decimal(4,2) DEFAULT NULL,
  `TangCa` decimal(4,2) DEFAULT 0.00,
  `TrangThai` varchar(50) DEFAULT NULL,
  `MaCHT` varchar(20) DEFAULT NULL,
  `MaTL` varchar(20) DEFAULT NULL,
  `MaNV` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `CHAM_CONG`
--

INSERT INTO `CHAM_CONG` (`MaChamCong`, `Ngay`, `GioVao`, `GioRa`, `SoGioLam`, `TangCa`, `TrangThai`, `MaCHT`, `MaTL`, `MaNV`) VALUES
(3, '2026-04-27', NULL, NULL, 8.00, 0.00, 'di_lam', NULL, NULL, 'NVFFFF86'),
(5, '2026-07-08', '08:00:00', '12:00:00', 4.00, 0.00, 'di_lam', NULL, NULL, 'NVEB6F30'),
(6, '2026-07-22', '12:00:00', '16:00:00', 4.00, 0.00, 'di_lam', NULL, NULL, 'NVEB6F30'),
(7, '2026-07-30', '10:43:00', '12:43:00', 2.00, 0.00, 'vang_mat', NULL, NULL, 'NVYOBH0D'),
(8, '2026-08-19', '11:34:00', '15:34:00', 4.00, 0.00, 'di_lam', NULL, NULL, 'NVYOBH0D');

-- --------------------------------------------------------

--
-- Table structure for table `CHAM_SOC_KHACH_HANG`
--

CREATE TABLE `CHAM_SOC_KHACH_HANG` (
  `MaCSKH` int(11) NOT NULL,
  `MaKH` varchar(20) NOT NULL COMMENT 'FK → KHACH_HANG',
  `LoaiTuongTac` varchar(50) NOT NULL COMMENT 'goi_dien | email | tang_qua | uu_dai_rieng | chuc_mung',
  `NguoiThucHien` varchar(20) DEFAULT NULL COMMENT 'FK → NHAN_VIEN',
  `NgayThucHien` datetime NOT NULL DEFAULT current_timestamp(),
  `NoiDung` text DEFAULT NULL,
  `KetQua` varchar(100) DEFAULT NULL COMMENT 'thanh_cong | khong_lien_lac | tu_choi',
  `MaDon_LienQuan` varchar(64) DEFAULT NULL COMMENT 'FK → DON_BAN_HANG (nếu phát sinh đơn)',
  `GhiChu` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Nhật ký chăm sóc khách hàng VIP / tiềm năng';

--
-- Dumping data for table `CHAM_SOC_KHACH_HANG`
--

INSERT INTO `CHAM_SOC_KHACH_HANG` (`MaCSKH`, `MaKH`, `LoaiTuongTac`, `NguoiThucHien`, `NgayThucHien`, `NoiDung`, `KetQua`, `MaDon_LienQuan`, `GhiChu`) VALUES
(1, 'KH8074AAC7', 'email', NULL, '2026-07-16 15:37:02', NULL, 'thanh_cong', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `CT_DE_NGHI_NHAP`
--

CREATE TABLE `CT_DE_NGHI_NHAP` (
  `MaPhieuDeNghi` varchar(20) NOT NULL,
  `MaSP` varchar(20) NOT NULL,
  `TonKhoHienTai` int(11) DEFAULT 0,
  `SoLuongDeNghi` int(11) NOT NULL,
  `GhiChu` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `CT_DON_BAN`
--

CREATE TABLE `CT_DON_BAN` (
  `MaDon` varchar(64) NOT NULL,
  `MaSP` varchar(20) NOT NULL,
  `SoLuong` int(11) NOT NULL CHECK (`SoLuong` > 0),
  `DonGia` decimal(15,2) NOT NULL,
  `ThueVAT` decimal(15,2) DEFAULT 0.00,
  `ChietKhau` decimal(15,2) DEFAULT 0.00,
  `ThanhTien` decimal(15,2) NOT NULL,
  `MaKM_ApDung` varchar(64) DEFAULT NULL,
  `SoTienGiam` decimal(15,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `CT_DON_BAN`
--

INSERT INTO `CT_DON_BAN` (`MaDon`, `MaSP`, `SoLuong`, `DonGia`, `ThueVAT`, `ChietKhau`, `ThanhTien`, `MaKM_ApDung`, `SoTienGiam`) VALUES
('ĐH00755297', 'SPF783DA', 1, 231.00, 23.10, 0.00, 254.10, NULL, 0.00),
('ĐH01F1F3B1', 'SPENTW3F', 1, 25000.00, 2500.00, 0.00, 27500.00, NULL, 0.00),
('ĐH0409D6B8', 'SP3774B6', 1, 15000.00, 1500.00, 0.00, 16500.00, NULL, 0.00),
('ĐH0409D6B8', 'SPDEPVHY', 1, 15000.00, 1500.00, 0.00, 16500.00, NULL, 0.00),
('ĐH0409D6B8', 'SPENTW3F', 1, 15000.00, 1500.00, 0.00, 16500.00, NULL, 0.00),
('ĐH083C2C53', 'SPDEPVHY', 3, 15000.00, 4500.00, 0.00, 49500.00, NULL, 0.00),
('ĐH326E3BD8', 'SP3774B6', 1, 15000.00, 1500.00, 0.00, 16500.00, NULL, 0.00),
('ĐH5B3370D0', 'SPRFP0VZ', 1, 15000.00, 1500.00, 0.00, 16500.00, NULL, 0.00),
('ĐH856F6F0F', 'SPENTW3F', 6, 25000.00, 15000.00, 0.00, 165000.00, NULL, 0.00),
('ĐH879F3C5D', 'SPENTW3F', 3, 25000.00, 7500.00, 0.00, 82500.00, NULL, 0.00),
('ĐH8970CBF5', 'SPDEPVHY', 1, 15000.00, 1500.00, 0.00, 16500.00, NULL, 0.00),
('ĐH8970CBF5', 'SPENTW3F', 1, 25000.00, 2500.00, 0.00, 27500.00, NULL, 0.00),
('ĐH8970CBF5', 'SPRFP0VZ', 1, 15000.00, 1500.00, 0.00, 16500.00, NULL, 0.00),
('ĐHA35CD97C', 'SPENTW3F', 1, 25000.00, 2500.00, 0.00, 27500.00, NULL, 0.00),
('ĐHA35CD97C', 'SPRFP0VZ', 100, 15000.00, 150000.00, 0.00, 1650000.00, NULL, 0.00),
('ĐHA565ACEE', 'SP67ECD4', 1, 12000.00, 1200.00, 0.00, 13200.00, NULL, 0.00),
('ĐHA565ACEE', 'SPDEPVHY', 1, 15000.00, 1500.00, 0.00, 16500.00, NULL, 0.00),
('ĐHA565ACEE', 'SPENTW3F', 1, 25000.00, 2500.00, 0.00, 27500.00, NULL, 0.00),
('ĐHAC2BA04B', 'SPF783DA', 1, 231.00, 23.10, 0.00, 254.10, NULL, 0.00),
('ĐHAC93E99D', 'SPENTW3F', 4, 25000.00, 10000.00, 0.00, 110000.00, NULL, 0.00),
('ĐHB7EBA70E', 'SPENTW3F', 3, 25000.00, 7500.00, 0.00, 82500.00, NULL, 0.00),
('ĐHC4285D59', 'SPDEPVHY', 1, 15000.00, 1500.00, 0.00, 16500.00, NULL, 0.00),
('ĐHC4285D59', 'SPENTW3F', 1, 25000.00, 2500.00, 0.00, 27500.00, NULL, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `CT_KHUYEN_MAI`
--

CREATE TABLE `CT_KHUYEN_MAI` (
  `MaKM` varchar(20) NOT NULL,
  `MaSP` varchar(20) NOT NULL,
  `GiamGiaPhanTram` decimal(5,2) DEFAULT 0.00,
  `GiamGiaTien` decimal(15,2) DEFAULT 0.00,
  `MuaToiThieu` int(11) DEFAULT 1
) ;

--
-- Dumping data for table `CT_KHUYEN_MAI`
--

INSERT INTO `CT_KHUYEN_MAI` (`MaKM`, `MaSP`, `GiamGiaPhanTram`, `GiamGiaTien`, `MuaToiThieu`) VALUES
('KM7D5D1B', 'SPENTW3F', 0.00, 0.00, 1),
('KMA9BFDF', 'SP67ECD4', 50.00, 0.00, 2),
('KMC9F50F', 'SPDEPVHY', 0.00, 0.00, 2),
('KMDCC11F', 'SP48A7A6', 0.00, 0.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `CT_NHAP_HANG`
--

CREATE TABLE `CT_NHAP_HANG` (
  `MaCTNH` varchar(20) NOT NULL,
  `MaNH` varchar(20) NOT NULL,
  `MaSP` varchar(20) NOT NULL,
  `SoLuong` int(11) NOT NULL DEFAULT 0,
  `DonGiaNhap` decimal(15,2) NOT NULL DEFAULT 0.00
) ;

--
-- Dumping data for table `CT_NHAP_HANG`
--

INSERT INTO `CT_NHAP_HANG` (`MaCTNH`, `MaNH`, `MaSP`, `SoLuong`, `DonGiaNhap`) VALUES
('CTNH69453C', 'NH778025', 'SP67ECD4', 2, 8000.00),
('CTNH7A1F4D', 'NH0538BF', 'SPDEPVHY', 13, 7000.00),
('CTNHDA0250', 'NH4FA746', 'SPRFP0VZ', 50, 8000.00);

-- --------------------------------------------------------

--
-- Table structure for table `CUA_HANG_TRUONG`
--

CREATE TABLE `CUA_HANG_TRUONG` (
  `MaCHT` varchar(20) NOT NULL,
  `TenCHT` varchar(100) NOT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `NgayNhanChuc` date DEFAULT NULL,
  `SoTrachNhiem` varchar(50) DEFAULT NULL,
  `TaiKhoan` varchar(50) NOT NULL,
  `MatKhau` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `CUA_HANG_TRUONG`
--

INSERT INTO `CUA_HANG_TRUONG` (`MaCHT`, `TenCHT`, `SDT`, `DiaChi`, `NgayNhanChuc`, `SoTrachNhiem`, `TaiKhoan`, `MatKhau`) VALUES
('CHT001', 'Nguyễn Văn A - Trưởng cửa hàng', '0987654321', 'Tầng 8, Toà nhà An Khánh, 63 Phạm Ngọc Thạch, Q.3, TP.HCM', NULL, NULL, 'truong001', '123456789'),
('CHT002', 'Trần Thị B - Trưởng cửa hàng', '0912345678', '123 Đường B, Q.1, TP.HCM', NULL, NULL, 'truong002', '123456789');

-- --------------------------------------------------------

--
-- Table structure for table `DANH_MUC_SP`
--

CREATE TABLE `DANH_MUC_SP` (
  `MaDanhMuc` varchar(20) NOT NULL,
  `TenDanhMuc` varchar(100) NOT NULL,
  `MoTa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `DANH_MUC_SP`
--

INSERT INTO `DANH_MUC_SP` (`MaDanhMuc`, `TenDanhMuc`, `MoTa`) VALUES
('DM001', 'Đồ uống', 'Nước ngọt, nước suối, trà sữa, nước tăng lực'),
('DM002', 'Bánh kẹo & Snack', 'Bánh quy, kẹo, snack, bim bim'),
('DM003', 'Đồ gia dụng nhỏ', 'Khăn giấy, bật lửa, túi rác, đồ gia dụng cơ bản'),
('DM004', 'Thực phẩm đóng gói nhanh', 'Mì gói, xúc xích, cháo ăn liền, đồ hộp'),
('DM005', 'Mỹ phẩm & chăm sóc cá nhân', 'Dầu gội, sữa tắm, lăn khử mùi, bàn chải');

-- --------------------------------------------------------

--
-- Table structure for table `DE_NGHI_DAT_HANG_DU_BAO`
--

CREATE TABLE `DE_NGHI_DAT_HANG_DU_BAO` (
  `MaDeNghi` int(11) NOT NULL,
  `MaSP` varchar(20) NOT NULL COMMENT 'FK → SAN_PHAM',
  `MaDuBao` int(11) NOT NULL COMMENT 'FK → DU_BAO_XU_HUONG',
  `SoLuongDeNghi` int(11) NOT NULL DEFAULT 0,
  `LyDoDeNghi` text DEFAULT NULL,
  `TrangThai` varchar(30) NOT NULL DEFAULT 'cho_duyet' COMMENT 'cho_duyet | da_duyet | da_dat_hang | huy',
  `NguoiDuyet` varchar(20) DEFAULT NULL COMMENT 'FK → TRO_LY_CUA_HANG hoặc CUA_HANG_TRUONG',
  `NgayDeNghi` datetime NOT NULL DEFAULT current_timestamp(),
  `NgayDuyet` datetime DEFAULT NULL,
  `MaPhieuDeNghi_TaoRa` varchar(20) DEFAULT NULL COMMENT 'FK → PHIEU_DE_NGHI_NHAP (sau khi duyệt)'
) ;

--
-- Dumping data for table `DE_NGHI_DAT_HANG_DU_BAO`
--

INSERT INTO `DE_NGHI_DAT_HANG_DU_BAO` (`MaDeNghi`, `MaSP`, `MaDuBao`, `SoLuongDeNghi`, `LyDoDeNghi`, `TrangThai`, `NguoiDuyet`, `NgayDeNghi`, `NgayDuyet`, `MaPhieuDeNghi_TaoRa`) VALUES
(1, 'SP67ECD4', 5, 2, 'pepsi tăng 100.0% trong tháng vừa qua. Cần nhập thêm 2 đơn vị để đáp ứng nhu cầu dự báo.', 'da_dat_hang', NULL, '2026-07-16 16:40:06', '2026-07-16 16:40:47', NULL),
(2, 'SP67ECD4', 5, 2, 'pepsi tăng 100.0% trong tháng vừa qua. Cần nhập thêm 2 đơn vị để đáp ứng nhu cầu dự báo.', 'da_dat_hang', NULL, '2026-07-16 16:40:35', '2026-07-16 16:53:39', NULL),
(3, 'SP67ECD4', 5, 2, 'pepsi tăng 100.0% trong tháng vừa qua. Cần nhập thêm 2 đơn vị để đáp ứng nhu cầu dự báo.', 'da_dat_hang', NULL, '2026-07-16 16:53:54', '2026-07-16 16:53:56', NULL),
(4, 'SP67ECD4', 5, 2, 'pepsi tăng 100.0% trong tháng vừa qua. Cần nhập thêm 2 đơn vị để đáp ứng nhu cầu dự báo.', 'da_dat_hang', NULL, '2026-07-16 16:54:20', '2026-07-16 16:54:28', NULL),
(5, 'SP67ECD4', 5, 2, 'pepsi tăng 100.0% trong tháng vừa qua. Cần nhập thêm 2 đơn vị để đáp ứng nhu cầu dự báo.', 'da_dat_hang', NULL, '2026-07-16 16:55:53', '2026-07-16 16:56:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `DON_BAN_HANG`
--

CREATE TABLE `DON_BAN_HANG` (
  `MaDon` varchar(64) NOT NULL,
  `NgayDat` datetime DEFAULT current_timestamp(),
  `TongTienHang` decimal(15,2) DEFAULT 0.00,
  `TongThueVAT` decimal(15,2) DEFAULT 0.00,
  `TongChietKhau` decimal(15,2) DEFAULT 0.00,
  `TongThanhToan` decimal(15,2) DEFAULT 0.00,
  `HinhThucTT` varchar(50) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT NULL,
  `LoaiDon` varchar(50) DEFAULT NULL,
  `SoLuong` int(11) NOT NULL DEFAULT 0,
  `MaKH` varchar(20) NOT NULL,
  `NguoiBan` varchar(20) DEFAULT NULL,
  `MaKM_ApDung` varchar(20) DEFAULT NULL,
  `MaSP_ApDung` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `DON_BAN_HANG`
--

INSERT INTO `DON_BAN_HANG` (`MaDon`, `NgayDat`, `TongTienHang`, `TongThueVAT`, `TongChietKhau`, `TongThanhToan`, `HinhThucTT`, `TrangThai`, `LoaiDon`, `SoLuong`, `MaKH`, `NguoiBan`, `MaKM_ApDung`, `MaSP_ApDung`) VALUES
('ĐH00755297', '2026-04-13 15:49:24', 231.00, 23.10, 0.00, 254.10, 'Tiền mặt', 'chờ_xác_nhận', NULL, 0, 'KH8074AAC7', NULL, NULL, NULL),
('ĐH01F1F3B1', '2026-08-19 10:27:20', 25000.00, 2500.00, 0.00, 27500.00, 'Tiền mặt', 'đã_giao', NULL, 0, 'KHC203B2F4', NULL, NULL, NULL),
('ĐH0409D6B8', '2026-04-29 08:24:09', 45000.00, 4500.00, 0.00, 49500.00, 'MoMo', 'đã_giao', NULL, 0, 'KH8074AAC7', NULL, NULL, NULL),
('ĐH083C2C53', '2026-07-16 16:17:39', 45000.00, 4500.00, 15000.00, 34500.00, 'Tiền mặt', 'đã_giao', NULL, 0, 'KH8074AAC7', NULL, 'KMC9F50F', 'SPDEPVHY'),
('ĐH326E3BD8', '2026-04-13 14:37:19', 15000.00, 1500.00, 0.00, 16500.00, 'Tiền mặt', 'đã_giao', NULL, 0, 'KH001', 'NVEB6F30', NULL, NULL),
('ĐH5B3370D0', '2026-04-13 15:49:46', 15000.00, 1500.00, 0.00, 16500.00, 'Tiền mặt', 'đã_hủy', NULL, 0, 'KH8074AAC7', NULL, NULL, NULL),
('ĐH856F6F0F', '2026-08-19 10:37:46', 150000.00, 15000.00, 50000.00, 115000.00, 'Tiền mặt', 'chờ_xác_nhận', NULL, 0, 'KHC203B2F4', NULL, 'KM7D5D1B', 'SPENTW3F'),
('ĐH879F3C5D', '2026-08-19 10:40:07', 75000.00, 7500.00, 25000.00, 57500.00, 'Tiền mặt', 'đã_xác_nhận', NULL, 0, 'KHC203B2F4', NULL, 'KM7D5D1B', 'SPENTW3F'),
('ĐH8970CBF5', '2026-08-11 10:17:26', 55000.00, 5500.00, 0.00, 60500.00, 'MoMo', 'đã_xác_nhận', NULL, 0, 'KHC203B2F4', NULL, NULL, NULL),
('ĐHA35CD97C', '2026-08-11 10:11:51', 1525000.00, 152500.00, 0.00, 1677500.00, 'Tiền mặt', 'đã_hủy', NULL, 0, 'KHC203B2F4', NULL, NULL, NULL),
('ĐHA565ACEE', '2026-08-11 05:48:02', 52000.00, 5200.00, 0.00, 57200.00, 'MoMo', 'đã_hủy', NULL, 0, 'KHC203B2F4', NULL, NULL, NULL),
('ĐHAC2BA04B', '2026-04-13 15:49:36', 231.00, 23.10, 0.00, 254.10, 'Tiền mặt', 'đang_giao', NULL, 0, 'KH8074AAC7', NULL, NULL, NULL),
('ĐHAC93E99D', '2026-08-19 10:26:05', 100000.00, 10000.00, 5000.00, 105000.00, 'MoMo', 'đã_hủy', NULL, 0, 'KHC203B2F4', NULL, NULL, NULL),
('ĐHB7EBA70E', '2026-08-19 10:30:10', 75000.00, 7500.00, 25000.00, 57500.00, 'Tiền mặt', 'chờ_xác_nhận', NULL, 0, 'KHC203B2F4', NULL, 'KM7D5D1B', 'SPENTW3F'),
('ĐHC4285D59', '2026-08-10 09:40:16', 40000.00, 4000.00, 0.00, 44000.00, 'Tiền mặt', 'đã_hủy', NULL, 0, 'KH8074AAC7', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `DON_DAT_HANG_NCC`
--

CREATE TABLE `DON_DAT_HANG_NCC` (
  `MaDonDat` varchar(20) NOT NULL,
  `NgayDat` date NOT NULL,
  `PO_Number` varchar(50) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT NULL,
  `TongTienDuKien` decimal(15,2) DEFAULT NULL,
  `MaNCC` varchar(20) NOT NULL,
  `MaPhieuDeNghi` varchar(20) NOT NULL,
  `MaSP_DatMua` varchar(20) NOT NULL COMMENT 'Quan hệ NEW 1 từ Diagram'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DOT_KHUYEN_MAI`
--

CREATE TABLE `DOT_KHUYEN_MAI` (
  `MaKM` varchar(20) NOT NULL,
  `TenCT` varchar(150) NOT NULL,
  `TuNgay` date NOT NULL,
  `DenNgay` date NOT NULL,
  `MoTa` text DEFAULT NULL
) ;

--
-- Dumping data for table `DOT_KHUYEN_MAI`
--

INSERT INTO `DOT_KHUYEN_MAI` (`MaKM`, `TenCT`, `TuNgay`, `DenNgay`, `MoTa`) VALUES
('KM7D5D1B', 'mua 2 tặng 1', '2026-08-19', '2026-08-21', '{\"text\":\"\",\"img\":\"promotions/1787110179685-663461429.jpg\",\"kieuKM\":\"mua_tang\",\"soLuongMua\":\"2\",\"soLuongTang\":\"1\"}'),
('KMA9BFDF', 'siêu sale mùa hè', '2026-07-16', '2026-07-22', 'mua 1 tặng 1 '),
('KMC9F50F', 'mua 2 tặng 1 sản phẩm mới', '2026-07-16', '2026-07-21', '{\"text\":\"ngon ơi là nong\",\"img\":\"promotions/1784193217433-738104347.jpg\",\"kieuKM\":\"mua_tang\",\"soLuongMua\":\"2\",\"soLuongTang\":\"1\"}'),
('KMDCC11F', 'Mua 2 tặng 1 ', '2026-10-02', '2026-10-20', '{\"text\":\"cocaclo thang 7\",\"img\":\"promotions/1784683908234-660410171.jpg\",\"kieuKM\":\"mua_tang\",\"soLuongMua\":\"2\",\"soLuongTang\":\"1\"}');

-- --------------------------------------------------------

--
-- Table structure for table `DU_BAO_XU_HUONG`
--

CREATE TABLE `DU_BAO_XU_HUONG` (
  `MaDuBao` int(11) NOT NULL,
  `MaSP` varchar(20) NOT NULL COMMENT 'FK → SAN_PHAM',
  `KyDuBao` varchar(20) NOT NULL COMMENT 'VD: 2026-07, 2026-Q3',
  `LoaiKyDuBao` varchar(10) NOT NULL DEFAULT 'thang' COMMENT 'thang | quy | tuan',
  `SoLuongDuBao` int(11) NOT NULL DEFAULT 0 COMMENT 'Dự báo số lượng bán được',
  `DoTinCay` decimal(5,2) DEFAULT NULL COMMENT 'Độ tin cậy dự báo (%)',
  `XuHuong` varchar(20) DEFAULT NULL COMMENT 'tang_manh | tang | on_dinh | giam | giam_manh',
  `LyDo` text DEFAULT NULL COMMENT 'AI giải thích lý do xu hướng',
  `DeNghiNhapThem` int(11) DEFAULT 0 COMMENT 'Số lượng đề nghị nhập thêm dự trữ',
  `NgayDuBao` datetime NOT NULL DEFAULT current_timestamp(),
  `NguonDuLieu` varchar(100) DEFAULT NULL COMMENT 'Mô tả nguồn dữ liệu dùng để dự báo'
) ;

--
-- Dumping data for table `DU_BAO_XU_HUONG`
--

INSERT INTO `DU_BAO_XU_HUONG` (`MaDuBao`, `MaSP`, `KyDuBao`, `LoaiKyDuBao`, `SoLuongDuBao`, `DoTinCay`, `XuHuong`, `LyDo`, `DeNghiNhapThem`, `NgayDuBao`, `NguonDuLieu`) VALUES
(1, 'SP3774B6', '2026-08', 'thang', 0, 60.00, 'on_dinh', 'Tháng trước: 0, tháng này: 0 (0.0%). Tồn kho hiện tại: 4', 0, '2026-07-16 16:55:53', 'DON_BAN_HANG 2026-05 đến 2026-07'),
(2, 'SPDEPVHY', '2026-08', 'thang', 4, 75.00, 'tang_manh', 'Tháng trước: 0, tháng này: 8 (+100.0%). Tồn kho hiện tại: 92', 0, '2026-07-16 16:55:53', 'DON_BAN_HANG 2026-05 đến 2026-07'),
(3, 'SPENTW3F', '2026-08', 'thang', 3, 75.00, 'tang_manh', 'Tháng trước: 0, tháng này: 6 (+100.0%). Tồn kho hiện tại: 94', 0, '2026-07-16 16:55:53', 'DON_BAN_HANG 2026-05 đến 2026-07'),
(4, 'SPF783DA', '2026-08', 'thang', 0, 60.00, 'on_dinh', 'Tháng trước: 0, tháng này: 0 (0.0%). Tồn kho hiện tại: 121', 0, '2026-07-06 11:17:26', 'DON_BAN_HANG 2026-05 đến 2026-07'),
(5, 'SP67ECD4', '2026-08', 'thang', 1, 75.00, 'tang_manh', 'Tháng trước: 0, tháng này: 1 (+100.0%). Tồn kho hiện tại: 0', 2, '2026-07-16 16:55:53', 'DON_BAN_HANG 2026-05 đến 2026-07'),
(6, 'SPDEPVHY', '2026-09', 'thang', 1, 75.00, 'giam_manh', 'Tháng trước: 3, tháng này: 1 (-66.7%). Tồn kho hiện tại: 109', 0, '2026-08-19 08:51:20', 'DON_BAN_HANG 2026-06 đến 2026-08'),
(7, 'SPENTW3F', '2026-09', 'thang', 1, 75.00, 'tang_manh', 'Tháng trước: 0, tháng này: 1 (+100.0%). Tồn kho hiện tại: 2', 0, '2026-08-19 08:51:20', 'DON_BAN_HANG 2026-06 đến 2026-08'),
(8, 'SPRFP0VZ', '2026-09', 'thang', 1, 75.00, 'tang_manh', 'Tháng trước: 0, tháng này: 1 (+100.0%). Tồn kho hiện tại: 20', 0, '2026-08-19 08:51:20', 'DON_BAN_HANG 2026-06 đến 2026-08');

-- --------------------------------------------------------

--
-- Table structure for table `KHACH_HANG`
--

CREATE TABLE `KHACH_HANG` (
  `MaKH` varchar(20) NOT NULL,
  `TenKH` varchar(100) NOT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `MatKhau` varchar(255) DEFAULT NULL,
  `api_token` varchar(100) DEFAULT NULL,
  `ApiToken` varchar(80) DEFAULT NULL,
  `DiemTichLuy` int(11) DEFAULT 0,
  `LoaiKH` varchar(50) DEFAULT NULL,
  `TongTieuDung` decimal(15,2) NOT NULL DEFAULT 0.00,
  `KhuyenMaiUuTien` tinyint(1) NOT NULL DEFAULT 0
) ;

--
-- Dumping data for table `KHACH_HANG`
--

INSERT INTO `KHACH_HANG` (`MaKH`, `TenKH`, `SDT`, `DiaChi`, `Email`, `MatKhau`, `api_token`, `ApiToken`, `DiemTichLuy`, `LoaiKH`, `TongTieuDung`, `KhuyenMaiUuTien`) VALUES
('KH001', 'Nguyễn Văn A', '0912345678', '12 Lê Lợi, Quận 1, TP.HCM', 'a.nguyen@example.com', '$2y$12$3xR7EXz1P1a0x48vNnY0Xun7rr8OQmjdw2ee.jprnLzjR5AtcXxja', NULL, NULL, 120, NULL, 0.00, 0),
('KH002', 'Trần Thị B', '0934567890', '45 Nguyễn Trãi, Quận 5, TP.HCM', 'b.tran@example.com', '$2y$12$3xR7EXz1P1a0x48vNnY0Xun7rr8OQmjdw2ee.jprnLzjR5AtcXxja', NULL, NULL, 80, NULL, 0.00, 0),
('KH003', 'Phạm Hoàng C', '0909876543', '89 Hai Bà Trưng, Quận 3, TP.HCM', 'c.pham@example.com', '$2y$12$3xR7EXz1P1a0x48vNnY0Xun7rr8OQmjdw2ee.jprnLzjR5AtcXxja', NULL, NULL, 200, NULL, 0.00, 0),
('KH004', 'Lê Minh D', '0987654321', '101 Tô Hiến Thành, Quận 10, TP.HCM', 'd.le@example.com', '$2y$12$3xR7EXz1P1a0x48vNnY0Xun7rr8OQmjdw2ee.jprnLzjR5AtcXxja', NULL, NULL, 50, NULL, 0.00, 0),
('KH005', 'Võ Thanh E', '0978123456', '22 Phan Xích Long, Phú Nhuận, TP.HCM', 'e.vo@example.com', '$2y$12$3xR7EXz1P1a0x48vNnY0Xun7rr8OQmjdw2ee.jprnLzjR5AtcXxja', NULL, NULL, 10, NULL, 0.00, 0),
('KH0B1B048A', 'aaaaaaaa', '12312313', '123123', 'a@gmail.com', NULL, NULL, NULL, 0, NULL, 0.00, 0),
('KH1765094524mbP', 'aada akwbdk', '0812781824', '123 kabwkdađa', 'a@gmail.com', '$2y$12$tz2QKLlsJQVeogx29DIA8uYgaHeaEFwbDtk/BcwVWLBFnFeeIEWyC', 'MRowotfwXunZwZTMd1WdOepW1ssuKnWwBXCjvwTbhkldKOmru87sZ6F2kUBU', NULL, 0, NULL, 0.00, 0),
('KH1766416439fhp', 'b', '0812344144', '123 alo alo aloa lo', 'b@gmail.com', '$2y$12$eKZQLiaOA2v5u1ardI9Xnubb71nQrtx.orh8GXpJRRfW/ooTFJ8Tq', 'rA23a2Cw90VYK8Jv2p87WVu8ou97Jmlq2ZhrVn1A91dm35zaOQw733FvvSL0', NULL, 0, NULL, 0.00, 0),
('KH3E660448', 'ad', '123123123123', '123', 'felixtran99999@gmail.com', NULL, NULL, NULL, 0, NULL, 0.00, 0),
('KH56DDD791', 'aa', '123', '123', 'a@gmail.com', NULL, NULL, NULL, 0, NULL, 0.00, 0),
('KH8074AAC7', 'thang đẹp trai', '082 2344234234', 'ad', 'a@gmail.com', NULL, NULL, NULL, 0, NULL, 273400.00, 0),
('KHC203B2F4', 'thang đẹp trai', '082356882444', '123 akjbwdjawd', 'a@gmail.com', NULL, NULL, NULL, 0, NULL, 318000.00, 0);

-- --------------------------------------------------------

--
-- Table structure for table `LO_HANG`
--

CREATE TABLE `LO_HANG` (
  `MaLo` varchar(20) NOT NULL,
  `MaSP` varchar(20) NOT NULL COMMENT 'FK → SAN_PHAM',
  `MaNH` varchar(20) NOT NULL COMMENT 'FK → PHIEU_NHAP_HANG',
  `SoLuongNhap` int(11) NOT NULL DEFAULT 0,
  `SoLuongConLai` int(11) NOT NULL DEFAULT 0,
  `NgayNhapKho` date NOT NULL,
  `HanSuDung` date DEFAULT NULL COMMENT 'NULL = hàng không có HSD',
  `ViTriKho` varchar(100) DEFAULT NULL,
  `GhiChu` text DEFAULT NULL
) ;

--
-- Dumping data for table `LO_HANG`
--

INSERT INTO `LO_HANG` (`MaLo`, `MaSP`, `MaNH`, `SoLuongNhap`, `SoLuongConLai`, `NgayNhapKho`, `HanSuDung`, `ViTriKho`, `GhiChu`) VALUES
('LO825734CB', 'SPDEPVHY', 'NH0538BF', 13, 13, '2026-08-10', NULL, NULL, NULL),
('LO8CC0E51C', 'SP67ECD4', 'NH778025', 2, 2, '2026-07-16', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2025_12_06_153000_add_trangthai_to_nhan_vien', 1),
(2, '2025_12_07_000000_add_api_token_to_khach_hang', 1),
(3, '2025_12_07_000002_make_nguoiban_nullable', 1),
(4, '2025_12_07_000003_drop_nguoiban_fk', 2),
(5, '2025_12_12_141049_add_soluong_to_don_ban_hang_table', 2),
(6, '2025_12_12_150500_expand_madon_length', 3),
(7, '2025_12_12_153000_expand_ctdon_madon', 4),
(8, '2025_12_17_100001_add_promo_cols_to_khach_hang', 5),
(9, '2025_12_17_100101_add_promo_cols_to_ct_don_ban', 5),
(10, '2025_12_17_100201_add_makm_to_don_ban_hang', 5),
(11, '2025_12_23_034518_add_timestamps_to_nha_cung_cap_table', 6),
(12, '2025_12_23_034519_add_timestamps_to_nha_cung_cap_table', 6);

-- --------------------------------------------------------

--
-- Table structure for table `NHAN_VIEN`
--

CREATE TABLE `NHAN_VIEN` (
  `MaNV` varchar(20) NOT NULL,
  `TenNV` varchar(100) NOT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `TaiKhoan` varchar(50) NOT NULL,
  `MatKhau` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'Sale',
  `MaTL` varchar(20) NOT NULL,
  `TrangThai` varchar(50) NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `NHAN_VIEN`
--

INSERT INTO `NHAN_VIEN` (`MaNV`, `TenNV`, `SDT`, `DiaChi`, `TaiKhoan`, `MatKhau`, `role`, `MaTL`, `TrangThai`) VALUES
('NV001', 'Nhân Viên Test', '0901234567', '789 Đại lộ Võ Văn Kiệt, TP.HCM', 'nv001', '$2y$12$aKLcicnr/geIw1qkFbcUnuJxdWnulUC4P2qRi7Y2PyhGUctVf9ftO', 'Sale', 'TL001', 'active'),
('NVEB6F30', 'a', '012345678', '123', 'a', '$2b$12$VbfKbAns6V92noqPVu5VeucoizRpo0c3juN/lLsce5HkuKrbR9NKu', 'Sale', 'TL001', 'active'),
('NVFFFF86', 'test', '123123123123', '123', 'aaa', '$2b$12$PnNSsrgftcapGBQiGLyWFeK2S/AH6CJz9LGfFpjdeDJW0QE8r7AIK', 'Sale', 'TL002', 'active'),
('NVYOBH0D', 'Thang', '1233345', '15 alo alo alo', 'nv02', '$2y$12$AeN9Eu9RSKxuhPrd2Xs4quLRI2y9bNZHElOPAjmcZSGvqUc2VDP5W', 'Sale', 'TL002', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `NHAT_KY_AI`
--

CREATE TABLE `NHAT_KY_AI` (
  `MaNhatKy` int(11) NOT NULL,
  `ChucNang` varchar(50) NOT NULL COMMENT 'canh_bao_ton_kho | phan_loai_khach | du_bao_xu_huong',
  `ThoiGianChay` datetime NOT NULL DEFAULT current_timestamp(),
  `ThamSo` text DEFAULT NULL COMMENT 'JSON tham số đầu vào',
  `KetQua_Tom_Tat` text DEFAULT NULL COMMENT 'Tóm tắt kết quả (JSON hoặc text)',
  `SoLuongXuLy` int(11) DEFAULT 0 COMMENT 'Số bản ghi được xử lý',
  `SoLuongCanhBao` int(11) DEFAULT 0 COMMENT 'Số cảnh báo/đề xuất tạo ra',
  `TrangThai` varchar(20) NOT NULL DEFAULT 'thanh_cong' COMMENT 'thanh_cong | loi | dang_chay',
  `ThongBaoLoi` text DEFAULT NULL,
  `ThoiGianChay_ms` int(11) DEFAULT NULL COMMENT 'Thời gian thực thi (milliseconds)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Audit log mỗi lần module AI chạy phân tích';

--
-- Dumping data for table `NHAT_KY_AI`
--

INSERT INTO `NHAT_KY_AI` (`MaNhatKy`, `ChucNang`, `ThoiGianChay`, `ThamSo`, `KetQua_Tom_Tat`, `SoLuongXuLy`, `SoLuongCanhBao`, `TrangThai`, `ThongBaoLoi`, `ThoiGianChay_ms`) VALUES
(1, 'phan_loai_khach', '2026-07-06 11:17:06', '{\"kyPhanTich\":\"2026-07\"}', '{\"soKhachPhanLoai\":2,\"kyPhanTich\":\"2026-07\"}', 2, 2, 'thanh_cong', NULL, 19),
(2, 'du_bao_xu_huong', '2026-07-06 11:17:26', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":4,\"soDuBaoTao\":4,\"soDeNghiTao\":0}', 4, 0, 'thanh_cong', NULL, 14),
(3, 'canh_bao_ton_kho', '2026-07-06 11:18:03', '{\"thoiDiemQuet\":\"2026-07-06T04:18:03.713Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(4, 'canh_bao_ton_kho', '2026-07-06 11:18:23', '{\"thoiDiemQuet\":\"2026-07-06T04:18:23.390Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 2),
(5, 'canh_bao_ton_kho', '2026-07-16 15:21:51', '{\"thoiDiemQuet\":\"2026-07-16T08:21:51.625Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 4),
(6, 'canh_bao_ton_kho', '2026-07-16 15:22:49', '{\"thoiDiemQuet\":\"2026-07-16T08:22:49.223Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(7, 'canh_bao_ton_kho', '2026-07-16 15:22:49', '{\"thoiDiemQuet\":\"2026-07-16T08:22:49.871Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(8, 'canh_bao_ton_kho', '2026-07-16 15:22:50', '{\"thoiDiemQuet\":\"2026-07-16T08:22:50.021Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(9, 'canh_bao_ton_kho', '2026-07-16 15:22:50', '{\"thoiDiemQuet\":\"2026-07-16T08:22:50.170Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(10, 'canh_bao_ton_kho', '2026-07-16 15:22:56', '{\"thoiDiemQuet\":\"2026-07-16T08:22:56.154Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 2),
(11, 'canh_bao_ton_kho', '2026-07-16 15:22:56', '{\"thoiDiemQuet\":\"2026-07-16T08:22:56.720Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(12, 'canh_bao_ton_kho', '2026-07-16 15:22:56', '{\"thoiDiemQuet\":\"2026-07-16T08:22:56.869Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 2),
(13, 'canh_bao_ton_kho', '2026-07-16 15:22:57', '{\"thoiDiemQuet\":\"2026-07-16T08:22:57.003Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 2),
(14, 'canh_bao_ton_kho', '2026-07-16 15:23:02', '{\"thoiDiemQuet\":\"2026-07-16T08:23:02.238Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(15, 'canh_bao_ton_kho', '2026-07-16 15:23:02', '{\"thoiDiemQuet\":\"2026-07-16T08:23:02.503Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(16, 'canh_bao_ton_kho', '2026-07-16 15:23:02', '{\"thoiDiemQuet\":\"2026-07-16T08:23:02.636Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(17, 'canh_bao_ton_kho', '2026-07-16 15:23:02', '{\"thoiDiemQuet\":\"2026-07-16T08:23:02.772Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(18, 'canh_bao_ton_kho', '2026-07-16 15:23:02', '{\"thoiDiemQuet\":\"2026-07-16T08:23:02.903Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(19, 'canh_bao_ton_kho', '2026-07-16 15:23:17', '{\"thoiDiemQuet\":\"2026-07-16T08:23:17.720Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(20, 'canh_bao_ton_kho', '2026-07-16 15:23:17', '{\"thoiDiemQuet\":\"2026-07-16T08:23:17.888Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 2),
(21, 'canh_bao_ton_kho', '2026-07-16 15:23:18', '{\"thoiDiemQuet\":\"2026-07-16T08:23:18.070Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 2),
(22, 'canh_bao_ton_kho', '2026-07-16 15:23:18', '{\"thoiDiemQuet\":\"2026-07-16T08:23:18.219Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(23, 'canh_bao_ton_kho', '2026-07-16 15:23:22', '{\"thoiDiemQuet\":\"2026-07-16T08:23:22.822Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(24, 'canh_bao_ton_kho', '2026-07-16 15:23:22', '{\"thoiDiemQuet\":\"2026-07-16T08:23:22.986Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 2),
(25, 'canh_bao_ton_kho', '2026-07-16 15:23:23', '{\"thoiDiemQuet\":\"2026-07-16T08:23:23.119Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(26, 'canh_bao_ton_kho', '2026-07-16 15:23:30', '{\"thoiDiemQuet\":\"2026-07-16T08:23:30.239Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 2),
(27, 'canh_bao_ton_kho', '2026-07-16 15:23:30', '{\"thoiDiemQuet\":\"2026-07-16T08:23:30.603Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 2),
(28, 'canh_bao_ton_kho', '2026-07-16 15:23:31', '{\"thoiDiemQuet\":\"2026-07-16T08:23:31.571Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(29, 'canh_bao_ton_kho', '2026-07-16 15:23:31', '{\"thoiDiemQuet\":\"2026-07-16T08:23:31.736Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 2),
(30, 'phan_loai_khach', '2026-07-16 15:36:28', '{\"kyPhanTich\":\"2026-07\"}', '{\"soKhachPhanLoai\":2,\"kyPhanTich\":\"2026-07\"}', 2, 2, 'thanh_cong', NULL, 10),
(31, 'du_bao_xu_huong', '2026-07-16 15:37:12', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 10),
(32, 'du_bao_xu_huong', '2026-07-16 15:37:28', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 10),
(33, 'canh_bao_ton_kho', '2026-07-16 16:18:29', '{\"thoiDiemQuet\":\"2026-07-16T09:18:29.600Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 11),
(34, 'canh_bao_ton_kho', '2026-07-16 16:18:30', '{\"thoiDiemQuet\":\"2026-07-16T09:18:30.428Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 3),
(35, 'du_bao_xu_huong', '2026-07-16 16:19:33', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 12),
(36, 'du_bao_xu_huong', '2026-07-16 16:19:34', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 11),
(37, 'canh_bao_ton_kho', '2026-07-16 16:27:39', '{\"thoiDiemQuet\":\"2026-07-16T09:27:39.186Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":2}', 0, 2, 'thanh_cong', NULL, 16),
(38, 'canh_bao_ton_kho', '2026-07-16 16:28:03', '{\"thoiDiemQuet\":\"2026-07-16T09:28:03.641Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 5),
(39, 'canh_bao_ton_kho', '2026-07-16 16:28:14', '{\"thoiDiemQuet\":\"2026-07-16T09:28:14.908Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 5),
(40, 'canh_bao_ton_kho', '2026-07-16 16:28:15', '{\"thoiDiemQuet\":\"2026-07-16T09:28:15.427Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 4),
(41, 'canh_bao_ton_kho', '2026-07-16 16:28:25', '{\"thoiDiemQuet\":\"2026-07-16T09:28:25.101Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 5),
(42, 'canh_bao_ton_kho', '2026-07-16 16:28:32', '{\"thoiDiemQuet\":\"2026-07-16T09:28:32.375Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 4),
(43, 'du_bao_xu_huong', '2026-07-16 16:28:54', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 9),
(44, 'du_bao_xu_huong', '2026-07-16 16:29:01', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 7),
(45, 'du_bao_xu_huong', '2026-07-16 16:29:02', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 8),
(46, 'phan_loai_khach', '2026-07-16 16:32:17', '{\"kyPhanTich\":\"2026-07\"}', '{\"soKhachPhanLoai\":2,\"kyPhanTich\":\"2026-07\"}', 2, 2, 'thanh_cong', NULL, 8),
(47, 'canh_bao_ton_kho', '2026-07-16 16:32:35', '{\"thoiDiemQuet\":\"2026-07-16T09:32:35.997Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 5),
(48, 'canh_bao_ton_kho', '2026-07-16 16:39:50', '{\"thoiDiemQuet\":\"2026-07-16T09:39:50.747Z\"}', '{\"soLoQuet\":0,\"soCanhBaoTao\":0}', 0, 0, 'thanh_cong', NULL, 4),
(49, 'du_bao_xu_huong', '2026-07-16 16:40:06', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":4,\"soDuBaoTao\":1,\"soDeNghiTao\":1}', 4, 1, 'thanh_cong', NULL, 13),
(50, 'du_bao_xu_huong', '2026-07-16 16:40:35', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":4,\"soDuBaoTao\":0,\"soDeNghiTao\":1}', 4, 1, 'thanh_cong', NULL, 12),
(51, 'du_bao_xu_huong', '2026-07-16 16:41:19', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":4,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 4, 0, 'thanh_cong', NULL, 10),
(52, 'du_bao_xu_huong', '2026-07-16 16:53:54', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":4,\"soDuBaoTao\":0,\"soDeNghiTao\":1}', 4, 1, 'thanh_cong', NULL, 13),
(53, 'du_bao_xu_huong', '2026-07-16 16:54:20', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":4,\"soDuBaoTao\":0,\"soDeNghiTao\":1}', 4, 1, 'thanh_cong', NULL, 13),
(54, 'du_bao_xu_huong', '2026-07-16 16:54:23', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":4,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 4, 0, 'thanh_cong', NULL, 12),
(55, 'du_bao_xu_huong', '2026-07-16 16:55:53', '{\"kyDuBao\":\"2026-08\"}', '{\"soSanPhamPhanTich\":4,\"soDuBaoTao\":0,\"soDeNghiTao\":1}', 4, 1, 'thanh_cong', NULL, 11),
(56, 'canh_bao_ton_kho', '2026-07-22 08:34:39', '{\"thoiDiemQuet\":\"2026-07-22T01:34:39.729Z\"}', '{\"soLoQuet\":1,\"soCanhBaoTao\":2}', 1, 2, 'thanh_cong', NULL, 15),
(57, 'phan_loai_khach', '2026-07-22 08:37:42', '{\"kyPhanTich\":\"2026-07\"}', '{\"soKhachPhanLoai\":2,\"kyPhanTich\":\"2026-07\"}', 2, 2, 'thanh_cong', NULL, 11),
(58, 'canh_bao_ton_kho', '2026-08-10 09:42:56', '{\"thoiDiemQuet\":\"2026-08-10T02:42:56.885Z\"}', '{\"soLoQuet\":2,\"soCanhBaoTao\":2}', 2, 2, 'thanh_cong', NULL, 13),
(59, 'phan_loai_khach', '2026-08-10 09:44:21', '{\"kyPhanTich\":\"2026-08\"}', '{\"soKhachPhanLoai\":2,\"kyPhanTich\":\"2026-08\"}', 2, 2, 'thanh_cong', NULL, 12),
(60, 'du_bao_xu_huong', '2026-08-10 09:44:25', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":2,\"soDuBaoTao\":2,\"soDeNghiTao\":0}', 2, 0, 'thanh_cong', NULL, 8),
(61, 'phan_loai_khach', '2026-08-19 08:33:53', '{\"kyPhanTich\":\"2026-08\"}', '{\"soKhachPhanLoai\":3,\"kyPhanTich\":\"2026-08\"}', 3, 3, 'thanh_cong', NULL, 17),
(62, 'du_bao_xu_huong', '2026-08-19 08:34:04', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":1,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 11),
(63, 'du_bao_xu_huong', '2026-08-19 08:34:59', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 8),
(64, 'du_bao_xu_huong', '2026-08-19 08:35:18', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 9),
(65, 'du_bao_xu_huong', '2026-08-19 08:35:26', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 9),
(66, 'du_bao_xu_huong', '2026-08-19 08:49:42', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 12),
(67, 'du_bao_xu_huong', '2026-08-19 08:50:10', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 8),
(68, 'du_bao_xu_huong', '2026-08-19 08:50:12', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 9),
(69, 'du_bao_xu_huong', '2026-08-19 08:50:22', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 7),
(70, 'du_bao_xu_huong', '2026-08-19 08:50:35', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 9),
(71, 'du_bao_xu_huong', '2026-08-19 08:50:44', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 8),
(72, 'du_bao_xu_huong', '2026-08-19 08:50:45', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 10),
(73, 'du_bao_xu_huong', '2026-08-19 08:50:45', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 6),
(74, 'du_bao_xu_huong', '2026-08-19 08:50:45', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 9),
(75, 'du_bao_xu_huong', '2026-08-19 08:50:45', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 7),
(76, 'du_bao_xu_huong', '2026-08-19 08:51:19', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 8),
(77, 'du_bao_xu_huong', '2026-08-19 08:51:20', '{\"kyDuBao\":\"2026-09\"}', '{\"soSanPhamPhanTich\":3,\"soDuBaoTao\":0,\"soDeNghiTao\":0}', 3, 0, 'thanh_cong', NULL, 11);

-- --------------------------------------------------------

--
-- Table structure for table `NHA_CUNG_CAP`
--

CREATE TABLE `NHA_CUNG_CAP` (
  `MaNCC` varchar(20) NOT NULL,
  `TenNCC` varchar(100) NOT NULL,
  `MaSoThue` varchar(30) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `NHA_CUNG_CAP`
--

INSERT INTO `NHA_CUNG_CAP` (`MaNCC`, `TenNCC`, `MaSoThue`, `DiaChi`, `SDT`, `Email`, `created_at`, `updated_at`) VALUES
('NCC001', 'Công ty Nước Giải Khát Coca-Cola Việt Nam', '0301234567', 'Xa Lộ Hà Nội, TP. Thủ Đức, TP.HCM', '0281234567', 'contact@cocacola.com', NULL, NULL),
('NCC002', 'Công ty Pepsico Việt Nam', '0312345678', 'Lô 14 VSIP 1, Thuận An, Bình Dương', '0274123456', 'info@pepsico.vn', NULL, NULL),
('NCC003', 'Công ty Kinh Đô Mondelez', '0309876543', 'Số 2 Tân Trụ, Tân Bình, TP.HCM', '0289876543', 'support@mondelez.vn', NULL, NULL),
('NCC004', 'Công ty Acecook Việt Nam', '0311223344', 'KCN Tân Bình, Tân Phú, TP.HCM', '02838123456', 'hotline@acecookvietnam.vn', NULL, NULL),
('NCC005', 'Công ty Unilever Việt Nam', '0305566778', '156 Nguyễn Lương Bằng, Quận 7, TP.HCM', '02835123456', 'contact@unilever.com', NULL, NULL),
('NCC63BAF1', 'test', 'test', '123jkbkbajkbwkd', '0981927398123', 'akakbba@gmail.com', '2025-12-22 20:46:44', '2025-12-22 20:46:44');

-- --------------------------------------------------------

--
-- Table structure for table `PHAN_LOAI_KHACH_HANG`
--

CREATE TABLE `PHAN_LOAI_KHACH_HANG` (
  `MaPhanLoai` int(11) NOT NULL,
  `MaKH` varchar(20) NOT NULL COMMENT 'FK → KHACH_HANG',
  `KyPhanTich` varchar(20) NOT NULL COMMENT 'VD: 2026-Q2, 2026-05',
  `HangKH` varchar(30) NOT NULL COMMENT 'Dong | Bac | Vang | KimCuong',
  `DiemRFM` decimal(5,2) DEFAULT NULL COMMENT 'Điểm tổng hợp RFM (0-100)',
  `DiemRecency` decimal(5,2) DEFAULT NULL COMMENT 'Điểm tần suất mua gần đây',
  `DiemFrequency` decimal(5,2) DEFAULT NULL COMMENT 'Điểm số lần mua',
  `DiemMonetary` decimal(5,2) DEFAULT NULL COMMENT 'Điểm giá trị chi tiêu',
  `TongChiTieu` decimal(15,2) DEFAULT 0.00,
  `SoLanMua` int(11) DEFAULT 0,
  `NgayMuaGanNhat` date DEFAULT NULL,
  `GiaTri_LTV` decimal(15,2) DEFAULT NULL COMMENT 'Dự báo giá trị vòng đời khách hàng',
  `DeNghiUuDai` text DEFAULT NULL COMMENT 'Gợi ý ưu đãi từ AI',
  `NgayPhanLoai` datetime NOT NULL DEFAULT current_timestamp()
) ;

--
-- Dumping data for table `PHAN_LOAI_KHACH_HANG`
--

INSERT INTO `PHAN_LOAI_KHACH_HANG` (`MaPhanLoai`, `MaKH`, `KyPhanTich`, `HangKH`, `DiemRFM`, `DiemRecency`, `DiemFrequency`, `DiemMonetary`, `TongChiTieu`, `SoLanMua`, `NgayMuaGanNhat`, `GiaTri_LTV`, `DeNghiUuDai`, `NgayPhanLoai`) VALUES
(1, 'KH001', '2026-07', 'Dong', 0.00, 0.00, 0.00, 0.00, 16500.00, 1, '2026-04-13', 19800.00, 'Gửi thông báo chương trình khuyến mãi, tặng voucher nhỏ để khuyến khích quay lại', '2026-07-22 08:37:42'),
(2, 'KH8074AAC7', '2026-07', 'KimCuong', 100.00, 100.00, 100.00, 100.00, 84508.20, 4, '2026-07-16', 101409.84, 'Ưu tiên giải quyết khiếu nại, tặng quà sinh nhật, mời tham gia chương trình thành viên VIP đặc biệt, giảm giá 15-20%', '2026-07-22 08:37:42'),
(3, 'KH001', '2026-08', 'Dong', 0.00, 0.00, 0.00, 0.00, 16500.00, 1, '2026-04-13', 19800.00, 'Gửi thông báo chương trình khuyến mãi, tặng voucher nhỏ để khuyến khích quay lại', '2026-08-19 08:33:53'),
(4, 'KH8074AAC7', '2026-08', 'KimCuong', 93.50, 78.33, 100.00, 100.00, 84508.20, 4, '2026-07-16', 101409.84, 'Ưu tiên giải quyết khiếu nại, tặng quà sinh nhật, mời tham gia chương trình thành viên VIP đặc biệt, giảm giá 15-20%', '2026-08-19 08:33:53'),
(5, 'KHC203B2F4', '2026-08', 'Bac', 55.88, 100.00, 0.00, 64.70, 60500.00, 1, '2026-08-11', 72600.00, 'Gửi email khuyến mãi định kỳ, voucher giảm giá 5%, nhắc nhở mua hàng', '2026-08-19 08:33:53');

-- --------------------------------------------------------

--
-- Table structure for table `PHIEU_DE_NGHI_NHAP`
--

CREATE TABLE `PHIEU_DE_NGHI_NHAP` (
  `MaPhieuDeNghi` varchar(20) NOT NULL,
  `NgayLap` date NOT NULL,
  `TrangThai` varchar(50) DEFAULT 'ChoDuyet',
  `GhiChu` text DEFAULT NULL,
  `NguoiLap` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `PHIEU_GIAO_HANG`
--

CREATE TABLE `PHIEU_GIAO_HANG` (
  `MaPhieuGiao` varchar(20) NOT NULL,
  `NgayGiao` date DEFAULT NULL,
  `MaVanDon` varchar(50) DEFAULT NULL,
  `TenNguoiNhan` varchar(100) DEFAULT NULL,
  `SDTNguoiNhan` varchar(15) DEFAULT NULL,
  `DiaChiGiao` varchar(255) DEFAULT NULL,
  `TenShipper` varchar(100) DEFAULT NULL,
  `TrangThaiGiao` varchar(50) DEFAULT NULL,
  `GhiChu` text DEFAULT NULL,
  `MaDon` varchar(20) NOT NULL,
  `NguoiGiao` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `PHIEU_GIAO_HANG`
--

INSERT INTO `PHIEU_GIAO_HANG` (`MaPhieuGiao`, `NgayGiao`, `MaVanDon`, `TenNguoiNhan`, `SDTNguoiNhan`, `DiaChiGiao`, `TenShipper`, `TrangThaiGiao`, `GhiChu`, `MaDon`, `NguoiGiao`) VALUES
('PG0D2926F9', NULL, NULL, 'thang đẹp trai', '082 2344234234', 'ad', NULL, 'đang_giao', NULL, 'ĐHAC2BA04B', NULL),
('PG3B61EBD1', NULL, NULL, 'thang đẹp trai', '2344234234', '123', NULL, 'giao_thất_bại', NULL, 'ĐH5B3370D0', NULL),
('PG9019D16F', NULL, NULL, 'thang đẹp trai', '082356882444', '123 akjbwdjawd', NULL, 'đang_giao', NULL, 'ĐH01F1F3B1', NULL),
('PGB5899E8D', NULL, NULL, 'thang đẹp trai', '082 2344234234', 'ad', NULL, 'giao_thất_bại', NULL, 'ĐHC4285D59', NULL),
('PGFBC74905', NULL, NULL, 'thang đẹp trai', '2344234234', '14', NULL, 'đã_giao', NULL, 'ĐH0409D6B8', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `PHIEU_NHAP_HANG`
--

CREATE TABLE `PHIEU_NHAP_HANG` (
  `MaNH` varchar(20) NOT NULL,
  `MaNCC` varchar(20) NOT NULL,
  `MaNV` varchar(20) NOT NULL,
  `NgayNhap` datetime DEFAULT current_timestamp(),
  `TongTien` decimal(15,2) DEFAULT 0.00,
  `GhiChu` text DEFAULT NULL
) ;

--
-- Dumping data for table `PHIEU_NHAP_HANG`
--

INSERT INTO `PHIEU_NHAP_HANG` (`MaNH`, `MaNCC`, `MaNV`, `NgayNhap`, `TongTien`, `GhiChu`) VALUES
('NH0538BF', 'NCC005', 'NVYOBH0D', '2026-08-10 09:42:38', 91000.00, NULL),
('NH4FA746', 'NCC005', 'NVFFFF86', '2026-04-27 20:19:11', 400000.00, NULL),
('NH778025', 'NCC005', 'NV001', '2026-07-16 16:56:35', 16000.00, 'Nhập hàng theo đề nghị 5');

-- --------------------------------------------------------

--
-- Table structure for table `SAN_PHAM`
--

CREATE TABLE `SAN_PHAM` (
  `MaSP` varchar(20) NOT NULL,
  `TenSP` varchar(150) NOT NULL,
  `QuyCach` varchar(100) DEFAULT NULL,
  `DonViTinh` varchar(50) DEFAULT NULL,
  `GiaVon` decimal(15,2) NOT NULL DEFAULT 0.00,
  `GiaBan` decimal(15,2) NOT NULL DEFAULT 0.00,
  `TonKho` int(11) NOT NULL DEFAULT 0,
  `HinhAnh` varchar(255) DEFAULT NULL,
  `MaDanhMuc` varchar(20) NOT NULL,
  `MaNCC` varchar(20) NOT NULL
) ;

--
-- Dumping data for table `SAN_PHAM`
--

INSERT INTO `SAN_PHAM` (`MaSP`, `TenSP`, `QuyCach`, `DonViTinh`, `GiaVon`, `GiaBan`, `TonKho`, `HinhAnh`, `MaDanhMuc`, `MaNCC`) VALUES
('SP3774B6', 'alo', '500', 'lon', 8000.00, 15000.00, 8, 'products/1786415113949-230985266.jpg', 'DM001', 'NCC63BAF1'),
('SP48A7A6', 'cocacola', '455ml', 'lon', 12000.00, 20000.00, 150, 'products/1784683831717-393926276.jpg', 'DM001', 'NCC001'),
('SP67ECD4', 'pepsi', 'lon', 'lon', 8000.00, 12000.00, 3, 'products/1787088162375-525566324.jpeg', 'DM001', 'NCC63BAF1'),
('SPDEPVHY', 'Nước giải khát ngon lành', 'nan', 'Lon', 7000.00, 15000.00, 109, 'products/1786415097302-141454878.jpg', 'DM001', 'NCC001'),
('SPENTW3F', 'Kẹo ngon', '1', 'bì', 12000.00, 25000.00, 137, 'products/1784683769057-778093541.jpg', 'DM002', 'NCC004'),
('SPF783DA', 'đồ thư giản', '123', '123', 123.00, 231.00, 121, 'products/1776065185243-947646962.jpg', 'DM005', 'NCC004'),
('SPRFP0VZ', 'Nước cocacola', '1ad', 'bia', 8000.00, 15000.00, 20, 'products/1786415078802-809855625.jpg', 'DM001', 'NCC001');

-- --------------------------------------------------------

--
-- Table structure for table `THONG_KE_BAN_HANG`
--

CREATE TABLE `THONG_KE_BAN_HANG` (
  `MaThongKe` int(11) NOT NULL,
  `MaSP` varchar(20) NOT NULL COMMENT 'FK → SAN_PHAM',
  `MaDanhMuc` varchar(20) DEFAULT NULL COMMENT 'FK → DANH_MUC_SP',
  `KyThongKe` varchar(20) NOT NULL COMMENT 'VD: 2026-05, 2026-W22',
  `LoaiKy` varchar(10) NOT NULL DEFAULT 'thang' COMMENT 'thang | tuan | quy',
  `SoLuongBan` int(11) NOT NULL DEFAULT 0,
  `DoanhThu` decimal(15,2) NOT NULL DEFAULT 0.00,
  `SoLuongTra` int(11) NOT NULL DEFAULT 0 COMMENT 'Số lượng bị trả lại (nếu có)',
  `SoDonHang` int(11) NOT NULL DEFAULT 0 COMMENT 'Số đơn hàng có sản phẩm này',
  `NgayCapNhat` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `TRO_LY_CUA_HANG`
--

CREATE TABLE `TRO_LY_CUA_HANG` (
  `MaTL` varchar(20) NOT NULL,
  `TenTL` varchar(100) NOT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `TaiKhoan` varchar(50) NOT NULL,
  `MatKhau` varchar(255) NOT NULL,
  `MaCHT` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `TRO_LY_CUA_HANG`
--

INSERT INTO `TRO_LY_CUA_HANG` (`MaTL`, `TenTL`, `SDT`, `DiaChi`, `TaiKhoan`, `MatKhau`, `MaCHT`) VALUES
('TL001', 'Lê Văn C - Trợ lý', '0901234567', 'Tầng 8, Toà nhà An Khánh, 63 Phạm Ngọc Thạch, Q.3, TP.HCM', 'troly001', '123456789', 'CHT001'),
('TL002', 'Phạm Thị D - Trợ lý', '0923456789', '456 Đường C, Q.2, TP.HCM', 'troly002', '123456789', 'CHT001');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `BANG_LUONG`
--
ALTER TABLE `BANG_LUONG`
  ADD PRIMARY KEY (`MaLuong`),
  ADD KEY `FK_BangLuong_CHT` (`MaCHT`),
  ADD KEY `FK_BangLuong_TL` (`MaTL`),
  ADD KEY `FK_BangLuong_NV` (`MaNV`);

--
-- Indexes for table `CANH_BAO_TON_KHO`
--
ALTER TABLE `CANH_BAO_TON_KHO`
  ADD PRIMARY KEY (`MaCanhBao`),
  ADD KEY `FK_CanhBao_SanPham` (`MaSP`),
  ADD KEY `FK_CanhBao_LoHang` (`MaLo`),
  ADD KEY `IDX_CanhBao_TrangThai` (`TrangThai`),
  ADD KEY `IDX_CanhBao_Loai` (`LoaiCanhBao`);

--
-- Indexes for table `CAU_HINH_CANH_BAO`
--
ALTER TABLE `CAU_HINH_CANH_BAO`
  ADD PRIMARY KEY (`MaCauHinh`),
  ADD KEY `FK_CauHinh_DanhMuc` (`MaDanhMuc`);

--
-- Indexes for table `CHAM_CONG`
--
ALTER TABLE `CHAM_CONG`
  ADD PRIMARY KEY (`MaChamCong`),
  ADD KEY `FK_ChamCong_CHT` (`MaCHT`),
  ADD KEY `FK_ChamCong_TL` (`MaTL`),
  ADD KEY `FK_ChamCong_NV` (`MaNV`);

--
-- Indexes for table `CHAM_SOC_KHACH_HANG`
--
ALTER TABLE `CHAM_SOC_KHACH_HANG`
  ADD PRIMARY KEY (`MaCSKH`),
  ADD KEY `FK_CSKH_KhachHang` (`MaKH`),
  ADD KEY `FK_CSKH_NhanVien` (`NguoiThucHien`),
  ADD KEY `FK_CSKH_DonBan` (`MaDon_LienQuan`);

--
-- Indexes for table `CT_DE_NGHI_NHAP`
--
ALTER TABLE `CT_DE_NGHI_NHAP`
  ADD PRIMARY KEY (`MaPhieuDeNghi`,`MaSP`),
  ADD KEY `FK_CTDeNghi_SanPham` (`MaSP`);

--
-- Indexes for table `CT_DON_BAN`
--
ALTER TABLE `CT_DON_BAN`
  ADD PRIMARY KEY (`MaDon`,`MaSP`),
  ADD KEY `FK_CTDonBan_SanPham` (`MaSP`);

--
-- Indexes for table `CT_KHUYEN_MAI`
--
ALTER TABLE `CT_KHUYEN_MAI`
  ADD PRIMARY KEY (`MaKM`,`MaSP`),
  ADD KEY `FK_CTKM_SanPham` (`MaSP`);

--
-- Indexes for table `CT_NHAP_HANG`
--
ALTER TABLE `CT_NHAP_HANG`
  ADD PRIMARY KEY (`MaCTNH`),
  ADD KEY `MaNH` (`MaNH`),
  ADD KEY `MaSP` (`MaSP`);

--
-- Indexes for table `CUA_HANG_TRUONG`
--
ALTER TABLE `CUA_HANG_TRUONG`
  ADD PRIMARY KEY (`MaCHT`),
  ADD UNIQUE KEY `TaiKhoan` (`TaiKhoan`);

--
-- Indexes for table `DANH_MUC_SP`
--
ALTER TABLE `DANH_MUC_SP`
  ADD PRIMARY KEY (`MaDanhMuc`);

--
-- Indexes for table `DE_NGHI_DAT_HANG_DU_BAO`
--
ALTER TABLE `DE_NGHI_DAT_HANG_DU_BAO`
  ADD PRIMARY KEY (`MaDeNghi`),
  ADD KEY `FK_DNDHDB_SanPham` (`MaSP`),
  ADD KEY `FK_DNDHDB_DuBao` (`MaDuBao`),
  ADD KEY `FK_DNDHDB_PhieuDN` (`MaPhieuDeNghi_TaoRa`);

--
-- Indexes for table `DON_BAN_HANG`
--
ALTER TABLE `DON_BAN_HANG`
  ADD PRIMARY KEY (`MaDon`),
  ADD KEY `FK_DonBan_KhachHang` (`MaKH`),
  ADD KEY `FK_DonBan_NhanVien` (`NguoiBan`),
  ADD KEY `FK_DonBan_CTKhuyenMai` (`MaKM_ApDung`,`MaSP_ApDung`);

--
-- Indexes for table `DON_DAT_HANG_NCC`
--
ALTER TABLE `DON_DAT_HANG_NCC`
  ADD PRIMARY KEY (`MaDonDat`),
  ADD KEY `FK_DonDat_NCC` (`MaNCC`),
  ADD KEY `FK_DonDat_Phieu` (`MaPhieuDeNghi`),
  ADD KEY `FK_DonDat_SanPham` (`MaSP_DatMua`);

--
-- Indexes for table `DOT_KHUYEN_MAI`
--
ALTER TABLE `DOT_KHUYEN_MAI`
  ADD PRIMARY KEY (`MaKM`);

--
-- Indexes for table `DU_BAO_XU_HUONG`
--
ALTER TABLE `DU_BAO_XU_HUONG`
  ADD PRIMARY KEY (`MaDuBao`),
  ADD UNIQUE KEY `UNQ_DuBao_SP_Ky` (`MaSP`,`KyDuBao`),
  ADD KEY `IDX_DuBao_XuHuong` (`XuHuong`);

--
-- Indexes for table `KHACH_HANG`
--
ALTER TABLE `KHACH_HANG`
  ADD PRIMARY KEY (`MaKH`),
  ADD UNIQUE KEY `khach_hang_apitoken_unique` (`ApiToken`);

--
-- Indexes for table `LO_HANG`
--
ALTER TABLE `LO_HANG`
  ADD PRIMARY KEY (`MaLo`),
  ADD KEY `FK_LoHang_SanPham` (`MaSP`),
  ADD KEY `FK_LoHang_PhieuNhap` (`MaNH`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `NHAN_VIEN`
--
ALTER TABLE `NHAN_VIEN`
  ADD PRIMARY KEY (`MaNV`),
  ADD UNIQUE KEY `TaiKhoan` (`TaiKhoan`),
  ADD KEY `FK_NhanVien_TroLy` (`MaTL`);

--
-- Indexes for table `NHAT_KY_AI`
--
ALTER TABLE `NHAT_KY_AI`
  ADD PRIMARY KEY (`MaNhatKy`),
  ADD KEY `IDX_NhatKyAI_ChucNang` (`ChucNang`),
  ADD KEY `IDX_NhatKyAI_ThoiGian` (`ThoiGianChay`);

--
-- Indexes for table `NHA_CUNG_CAP`
--
ALTER TABLE `NHA_CUNG_CAP`
  ADD PRIMARY KEY (`MaNCC`);

--
-- Indexes for table `PHAN_LOAI_KHACH_HANG`
--
ALTER TABLE `PHAN_LOAI_KHACH_HANG`
  ADD PRIMARY KEY (`MaPhanLoai`),
  ADD UNIQUE KEY `UNQ_KH_Ky` (`MaKH`,`KyPhanTich`),
  ADD KEY `IDX_PLKH_Hang` (`HangKH`);

--
-- Indexes for table `PHIEU_DE_NGHI_NHAP`
--
ALTER TABLE `PHIEU_DE_NGHI_NHAP`
  ADD PRIMARY KEY (`MaPhieuDeNghi`),
  ADD KEY `FK_PhieuDeNghi_NhanVien` (`NguoiLap`);

--
-- Indexes for table `PHIEU_GIAO_HANG`
--
ALTER TABLE `PHIEU_GIAO_HANG`
  ADD PRIMARY KEY (`MaPhieuGiao`),
  ADD KEY `FK_PhieuGiao_DonBan` (`MaDon`),
  ADD KEY `FK_PhieuGiao_NhanVien` (`NguoiGiao`);

--
-- Indexes for table `PHIEU_NHAP_HANG`
--
ALTER TABLE `PHIEU_NHAP_HANG`
  ADD PRIMARY KEY (`MaNH`),
  ADD KEY `MaNCC` (`MaNCC`),
  ADD KEY `MaNV` (`MaNV`);

--
-- Indexes for table `SAN_PHAM`
--
ALTER TABLE `SAN_PHAM`
  ADD PRIMARY KEY (`MaSP`),
  ADD KEY `FK_SanPham_DanhMuc` (`MaDanhMuc`),
  ADD KEY `FK_SanPham_NCC` (`MaNCC`);

--
-- Indexes for table `THONG_KE_BAN_HANG`
--
ALTER TABLE `THONG_KE_BAN_HANG`
  ADD PRIMARY KEY (`MaThongKe`),
  ADD UNIQUE KEY `UNQ_ThongKe_SP_Ky` (`MaSP`,`KyThongKe`),
  ADD KEY `FK_ThongKe_DanhMuc` (`MaDanhMuc`);

--
-- Indexes for table `TRO_LY_CUA_HANG`
--
ALTER TABLE `TRO_LY_CUA_HANG`
  ADD PRIMARY KEY (`MaTL`),
  ADD UNIQUE KEY `TaiKhoan` (`TaiKhoan`),
  ADD KEY `FK_TroLy_CHT` (`MaCHT`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `CANH_BAO_TON_KHO`
--
ALTER TABLE `CANH_BAO_TON_KHO`
  MODIFY `MaCanhBao` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `CAU_HINH_CANH_BAO`
--
ALTER TABLE `CAU_HINH_CANH_BAO`
  MODIFY `MaCauHinh` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `CHAM_CONG`
--
ALTER TABLE `CHAM_CONG`
  MODIFY `MaChamCong` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `CHAM_SOC_KHACH_HANG`
--
ALTER TABLE `CHAM_SOC_KHACH_HANG`
  MODIFY `MaCSKH` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `DE_NGHI_DAT_HANG_DU_BAO`
--
ALTER TABLE `DE_NGHI_DAT_HANG_DU_BAO`
  MODIFY `MaDeNghi` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DU_BAO_XU_HUONG`
--
ALTER TABLE `DU_BAO_XU_HUONG`
  MODIFY `MaDuBao` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `NHAT_KY_AI`
--
ALTER TABLE `NHAT_KY_AI`
  MODIFY `MaNhatKy` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `PHAN_LOAI_KHACH_HANG`
--
ALTER TABLE `PHAN_LOAI_KHACH_HANG`
  MODIFY `MaPhanLoai` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `THONG_KE_BAN_HANG`
--
ALTER TABLE `THONG_KE_BAN_HANG`
  MODIFY `MaThongKe` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `BANG_LUONG`
--
ALTER TABLE `BANG_LUONG`
  ADD CONSTRAINT `FK_BangLuong_CHT` FOREIGN KEY (`MaCHT`) REFERENCES `CUA_HANG_TRUONG` (`MaCHT`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_BangLuong_NV` FOREIGN KEY (`MaNV`) REFERENCES `NHAN_VIEN` (`MaNV`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_BangLuong_TL` FOREIGN KEY (`MaTL`) REFERENCES `TRO_LY_CUA_HANG` (`MaTL`) ON UPDATE CASCADE;

--
-- Constraints for table `CANH_BAO_TON_KHO`
--
ALTER TABLE `CANH_BAO_TON_KHO`
  ADD CONSTRAINT `FK_CanhBao_LoHang` FOREIGN KEY (`MaLo`) REFERENCES `LO_HANG` (`MaLo`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_CanhBao_SanPham` FOREIGN KEY (`MaSP`) REFERENCES `SAN_PHAM` (`MaSP`) ON UPDATE CASCADE;

--
-- Constraints for table `CAU_HINH_CANH_BAO`
--
ALTER TABLE `CAU_HINH_CANH_BAO`
  ADD CONSTRAINT `FK_CauHinh_DanhMuc` FOREIGN KEY (`MaDanhMuc`) REFERENCES `DANH_MUC_SP` (`MaDanhMuc`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `CHAM_CONG`
--
ALTER TABLE `CHAM_CONG`
  ADD CONSTRAINT `FK_ChamCong_CHT` FOREIGN KEY (`MaCHT`) REFERENCES `CUA_HANG_TRUONG` (`MaCHT`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_ChamCong_NV` FOREIGN KEY (`MaNV`) REFERENCES `NHAN_VIEN` (`MaNV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_ChamCong_TL` FOREIGN KEY (`MaTL`) REFERENCES `TRO_LY_CUA_HANG` (`MaTL`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `CHAM_SOC_KHACH_HANG`
--
ALTER TABLE `CHAM_SOC_KHACH_HANG`
  ADD CONSTRAINT `FK_CSKH_DonBan` FOREIGN KEY (`MaDon_LienQuan`) REFERENCES `DON_BAN_HANG` (`MaDon`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_CSKH_KhachHang` FOREIGN KEY (`MaKH`) REFERENCES `KHACH_HANG` (`MaKH`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_CSKH_NhanVien` FOREIGN KEY (`NguoiThucHien`) REFERENCES `NHAN_VIEN` (`MaNV`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `CT_DE_NGHI_NHAP`
--
ALTER TABLE `CT_DE_NGHI_NHAP`
  ADD CONSTRAINT `FK_CTDeNghi_Phieu` FOREIGN KEY (`MaPhieuDeNghi`) REFERENCES `PHIEU_DE_NGHI_NHAP` (`MaPhieuDeNghi`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_CTDeNghi_SanPham` FOREIGN KEY (`MaSP`) REFERENCES `SAN_PHAM` (`MaSP`) ON UPDATE CASCADE;

--
-- Constraints for table `CT_DON_BAN`
--
ALTER TABLE `CT_DON_BAN`
  ADD CONSTRAINT `FK_CTDonBan_Don` FOREIGN KEY (`MaDon`) REFERENCES `DON_BAN_HANG` (`MaDon`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_CTDonBan_SanPham` FOREIGN KEY (`MaSP`) REFERENCES `SAN_PHAM` (`MaSP`) ON UPDATE CASCADE;

--
-- Constraints for table `CT_KHUYEN_MAI`
--
ALTER TABLE `CT_KHUYEN_MAI`
  ADD CONSTRAINT `FK_CTKM_DotKM` FOREIGN KEY (`MaKM`) REFERENCES `DOT_KHUYEN_MAI` (`MaKM`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_CTKM_SanPham` FOREIGN KEY (`MaSP`) REFERENCES `SAN_PHAM` (`MaSP`) ON UPDATE CASCADE;

--
-- Constraints for table `CT_NHAP_HANG`
--
ALTER TABLE `CT_NHAP_HANG`
  ADD CONSTRAINT `ct_nhap_hang_ibfk_1` FOREIGN KEY (`MaNH`) REFERENCES `PHIEU_NHAP_HANG` (`MaNH`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_nhap_hang_ibfk_2` FOREIGN KEY (`MaSP`) REFERENCES `SAN_PHAM` (`MaSP`);

--
-- Constraints for table `DE_NGHI_DAT_HANG_DU_BAO`
--
ALTER TABLE `DE_NGHI_DAT_HANG_DU_BAO`
  ADD CONSTRAINT `FK_DNDHDB_DuBao` FOREIGN KEY (`MaDuBao`) REFERENCES `DU_BAO_XU_HUONG` (`MaDuBao`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_DNDHDB_PhieuDN` FOREIGN KEY (`MaPhieuDeNghi_TaoRa`) REFERENCES `PHIEU_DE_NGHI_NHAP` (`MaPhieuDeNghi`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_DNDHDB_SanPham` FOREIGN KEY (`MaSP`) REFERENCES `SAN_PHAM` (`MaSP`) ON UPDATE CASCADE;

--
-- Constraints for table `DON_BAN_HANG`
--
ALTER TABLE `DON_BAN_HANG`
  ADD CONSTRAINT `FK_DonBan_CTKhuyenMai` FOREIGN KEY (`MaKM_ApDung`,`MaSP_ApDung`) REFERENCES `CT_KHUYEN_MAI` (`MaKM`, `MaSP`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_DonBan_KhachHang` FOREIGN KEY (`MaKH`) REFERENCES `KHACH_HANG` (`MaKH`) ON UPDATE CASCADE;

--
-- Constraints for table `DON_DAT_HANG_NCC`
--
ALTER TABLE `DON_DAT_HANG_NCC`
  ADD CONSTRAINT `FK_DonDat_NCC` FOREIGN KEY (`MaNCC`) REFERENCES `NHA_CUNG_CAP` (`MaNCC`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_DonDat_Phieu` FOREIGN KEY (`MaPhieuDeNghi`) REFERENCES `PHIEU_DE_NGHI_NHAP` (`MaPhieuDeNghi`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_DonDat_SanPham` FOREIGN KEY (`MaSP_DatMua`) REFERENCES `SAN_PHAM` (`MaSP`) ON UPDATE CASCADE;

--
-- Constraints for table `DU_BAO_XU_HUONG`
--
ALTER TABLE `DU_BAO_XU_HUONG`
  ADD CONSTRAINT `FK_DuBao_SanPham` FOREIGN KEY (`MaSP`) REFERENCES `SAN_PHAM` (`MaSP`) ON UPDATE CASCADE;

--
-- Constraints for table `LO_HANG`
--
ALTER TABLE `LO_HANG`
  ADD CONSTRAINT `FK_LoHang_PhieuNhap` FOREIGN KEY (`MaNH`) REFERENCES `PHIEU_NHAP_HANG` (`MaNH`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_LoHang_SanPham` FOREIGN KEY (`MaSP`) REFERENCES `SAN_PHAM` (`MaSP`) ON UPDATE CASCADE;

--
-- Constraints for table `NHAN_VIEN`
--
ALTER TABLE `NHAN_VIEN`
  ADD CONSTRAINT `FK_NhanVien_TroLy` FOREIGN KEY (`MaTL`) REFERENCES `TRO_LY_CUA_HANG` (`MaTL`) ON UPDATE CASCADE;

--
-- Constraints for table `PHAN_LOAI_KHACH_HANG`
--
ALTER TABLE `PHAN_LOAI_KHACH_HANG`
  ADD CONSTRAINT `FK_PhanLoai_KhachHang` FOREIGN KEY (`MaKH`) REFERENCES `KHACH_HANG` (`MaKH`) ON UPDATE CASCADE;

--
-- Constraints for table `PHIEU_DE_NGHI_NHAP`
--
ALTER TABLE `PHIEU_DE_NGHI_NHAP`
  ADD CONSTRAINT `FK_PhieuDeNghi_NhanVien` FOREIGN KEY (`NguoiLap`) REFERENCES `NHAN_VIEN` (`MaNV`) ON UPDATE CASCADE;

--
-- Constraints for table `PHIEU_GIAO_HANG`
--
ALTER TABLE `PHIEU_GIAO_HANG`
  ADD CONSTRAINT `FK_PhieuGiao_DonBan` FOREIGN KEY (`MaDon`) REFERENCES `DON_BAN_HANG` (`MaDon`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_PhieuGiao_NhanVien` FOREIGN KEY (`NguoiGiao`) REFERENCES `NHAN_VIEN` (`MaNV`) ON UPDATE CASCADE;

--
-- Constraints for table `PHIEU_NHAP_HANG`
--
ALTER TABLE `PHIEU_NHAP_HANG`
  ADD CONSTRAINT `phieu_nhap_hang_ibfk_1` FOREIGN KEY (`MaNCC`) REFERENCES `NHA_CUNG_CAP` (`MaNCC`),
  ADD CONSTRAINT `phieu_nhap_hang_ibfk_2` FOREIGN KEY (`MaNV`) REFERENCES `NHAN_VIEN` (`MaNV`);

--
-- Constraints for table `SAN_PHAM`
--
ALTER TABLE `SAN_PHAM`
  ADD CONSTRAINT `FK_SanPham_DanhMuc` FOREIGN KEY (`MaDanhMuc`) REFERENCES `DANH_MUC_SP` (`MaDanhMuc`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_SanPham_NCC` FOREIGN KEY (`MaNCC`) REFERENCES `NHA_CUNG_CAP` (`MaNCC`) ON UPDATE CASCADE;

--
-- Constraints for table `THONG_KE_BAN_HANG`
--
ALTER TABLE `THONG_KE_BAN_HANG`
  ADD CONSTRAINT `FK_ThongKe_DanhMuc` FOREIGN KEY (`MaDanhMuc`) REFERENCES `DANH_MUC_SP` (`MaDanhMuc`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_ThongKe_SanPham` FOREIGN KEY (`MaSP`) REFERENCES `SAN_PHAM` (`MaSP`) ON UPDATE CASCADE;

--
-- Constraints for table `TRO_LY_CUA_HANG`
--
ALTER TABLE `TRO_LY_CUA_HANG`
  ADD CONSTRAINT `FK_TroLy_CHT` FOREIGN KEY (`MaCHT`) REFERENCES `CUA_HANG_TRUONG` (`MaCHT`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
