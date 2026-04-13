-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 12, 2026 at 09:52 AM
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
CREATE DATABASE IF NOT EXISTS `quanlycuahang` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `quanlycuahang`;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
('DON1765863952WQY', 'SPDEPVHY', 1, 15000.00, 0.00, 0.00, 15000.00, NULL, 0.00),
('DON1765863952WQY', 'SPENTW3F', 1, 15000.00, 0.00, 0.00, 15000.00, NULL, 0.00),
('DON1765863952WQY', 'SPRFP0VZ', 1, 15000.00, 0.00, 0.00, 15000.00, NULL, 0.00),
('DON17658641402M0', 'SPENTW3F', 1, 15000.00, 0.00, 0.00, 15000.00, NULL, 0.00),
('DON17658641402M0', 'SPRFP0VZ', 3, 15000.00, 0.00, 0.00, 45000.00, NULL, 0.00),
('DON1765864704SD5', 'SPENTW3F', 4, 15000.00, 0.00, 0.00, 60000.00, NULL, 0.00),
('DON1765964867HCN', 'SPDEPVHY', 1, 15000.00, 0.00, 0.00, 15000.00, NULL, 0.00),
('DON1765964867HCN', 'SPENTW3F', 1, 15000.00, 0.00, 0.00, 15000.00, NULL, 0.00),
('DON1765964867HCN', 'SPRFP0VZ', 1, 15000.00, 0.00, 0.00, 15000.00, NULL, 0.00),
('DON1766459064XHD', 'SPRFP0VZ', 2, 15000.00, 0.00, 0.00, 30000.00, NULL, 0.00),
('DON17664661494NS', 'SPDEPVHY', 2, 15000.00, 0.00, 0.00, 30000.00, NULL, 0.00),
('DON17664661494NS', 'SPENTW3F', 1, 15000.00, 0.00, 0.00, 15000.00, NULL, 0.00),
('DON17664661494NS', 'SPRFP0VZ', 1, 15000.00, 0.00, 0.00, 15000.00, NULL, 0.00),
('ĐHR9BCLDJG', 'SPDEPVHY', 5, 15000.00, 7500.00, 0.00, 82500.00, NULL, 0.00);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
('DON1765095734izOr', '2025-12-07 08:22:14', 60000.00, 0.00, 0.00, 60000.00, 'COD', 'đã_giao', 'BanLe', 0, 'KH1765094524mbP', 'CUSTOMER', NULL, NULL),
('DON1765863952WQY', '2025-12-16 05:45:52', 45000.00, 0.00, 0.00, 45000.00, 'COD', 'đã_giao', 'BanLe', 0, 'KH1765094524mbP', 'ONLINE', NULL, NULL),
('DON17658641402M0', '2025-12-16 05:49:00', 60000.00, 0.00, 0.00, 60000.00, 'COD', 'đã_giao', 'BanLe', 0, 'KH1765094524mbP', 'ONLINE', NULL, NULL),
('DON1765864704SD5', '2025-12-16 05:58:24', 60000.00, 0.00, 0.00, 60000.00, 'COD', 'đã_giao', 'BanLe', 0, 'KH1765094524mbP', 'ONLINE', NULL, NULL),
('DON1765964867HCN', '2025-12-17 09:47:47', 45000.00, 0.00, 0.00, 45000.00, 'COD', 'ChoXuLy', 'BanLe', 0, 'KH1765094524mbP', 'ONLINE', NULL, NULL),
('DON1766417122DTC', '2025-12-22 15:25:22', 45000.00, 0.00, 0.00, 45000.00, 'COD', 'đã_giao', 'BanLe', 0, 'KH1766416439fhp', 'ONLINE', NULL, NULL),
('DON1766459064XHD', '2025-12-23 03:04:24', 30000.00, 0.00, 0.00, 30000.00, 'COD', 'ChoXuLy', 'BanLe', 0, 'KH1765094524mbP', 'ONLINE', NULL, NULL),
('DON17664661494NS', '2025-12-23 05:02:29', 60000.00, 0.00, 0.00, 60000.00, 'COD', 'đã_giao', 'BanLe', 0, 'KH1765094524mbP', 'ONLINE', NULL, NULL),
('ĐHR9BCLDJG', '2025-12-06 14:46:02', 75000.00, 7500.00, 0.00, 82500.00, 'Tiền mặt', 'đã_giao', NULL, 0, 'KH001', 'NV001', NULL, NULL);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `KHACH_HANG`
--

INSERT INTO `KHACH_HANG` (`MaKH`, `TenKH`, `SDT`, `DiaChi`, `Email`, `MatKhau`, `api_token`, `ApiToken`, `DiemTichLuy`, `LoaiKH`, `TongTieuDung`, `KhuyenMaiUuTien`) VALUES
('KH001', 'Nguyễn Văn A', '0912345678', '12 Lê Lợi, Quận 1, TP.HCM', 'a.nguyen@example.com', '$2y$12$3xR7EXz1P1a0x48vNnY0Xun7rr8OQmjdw2ee.jprnLzjR5AtcXxja', NULL, NULL, 120, NULL, 0.00, 0),
('KH002', 'Trần Thị B', '0934567890', '45 Nguyễn Trãi, Quận 5, TP.HCM', 'b.tran@example.com', '$2y$12$3xR7EXz1P1a0x48vNnY0Xun7rr8OQmjdw2ee.jprnLzjR5AtcXxja', NULL, NULL, 80, NULL, 0.00, 0),
('KH003', 'Phạm Hoàng C', '0909876543', '89 Hai Bà Trưng, Quận 3, TP.HCM', 'c.pham@example.com', '$2y$12$3xR7EXz1P1a0x48vNnY0Xun7rr8OQmjdw2ee.jprnLzjR5AtcXxja', NULL, NULL, 200, NULL, 0.00, 0),
('KH004', 'Lê Minh D', '0987654321', '101 Tô Hiến Thành, Quận 10, TP.HCM', 'd.le@example.com', '$2y$12$3xR7EXz1P1a0x48vNnY0Xun7rr8OQmjdw2ee.jprnLzjR5AtcXxja', NULL, NULL, 50, NULL, 0.00, 0),
('KH005', 'Võ Thanh E', '0978123456', '22 Phan Xích Long, Phú Nhuận, TP.HCM', 'e.vo@example.com', '$2y$12$3xR7EXz1P1a0x48vNnY0Xun7rr8OQmjdw2ee.jprnLzjR5AtcXxja', NULL, NULL, 10, NULL, 0.00, 0),
('KH1765094524mbP', 'aada akwbdk', '0812781824', '123 kabwkdađa', 'a@gmail.com', '$2y$12$tz2QKLlsJQVeogx29DIA8uYgaHeaEFwbDtk/BcwVWLBFnFeeIEWyC', 'MRowotfwXunZwZTMd1WdOepW1ssuKnWwBXCjvwTbhkldKOmru87sZ6F2kUBU', NULL, 0, NULL, 0.00, 0),
('KH1766416439fhp', 'b', '0812344144', '123 alo alo aloa lo', 'b@gmail.com', '$2y$12$eKZQLiaOA2v5u1ardI9Xnubb71nQrtx.orh8GXpJRRfW/ooTFJ8Tq', 'rA23a2Cw90VYK8Jv2p87WVu8ou97Jmlq2ZhrVn1A91dm35zaOQw733FvvSL0', NULL, 0, NULL, 0.00, 0);

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
('NVYOBH0D', 'Thang', '1233345', '15 alo alo alo', 'nv02', '$2y$12$AeN9Eu9RSKxuhPrd2Xs4quLRI2y9bNZHElOPAjmcZSGvqUc2VDP5W', 'Sale', 'TL002', 'active');

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
('PG335ELHS0', '2025-12-23', 'qwqrq', 'aada akwbdk', '0812781824', '123 kabwkdađa', NULL, 'đang_giao', NULL, 'DON17664661494NS', NULL),
('PGATYOSQAQ', '2025-12-06', '111', 'Nguyễn Văn A', '0912345678', '12 Lê Lợi, Quận 1, TP.HCM', 'Sang', 'giao_thất_bại', NULL, 'ĐHR9BCLDJG', 'NVYOBH0D'),
('PGSDW0BADK', '2025-12-07', 'alo', 'a', 'a', 'alo', 'alo', 'giao_thất_bại', NULL, 'DON1765095734izOr', 'NV001'),
('PGVVGFPHSR', '2025-12-16', NULL, 'a', 'a', '15 ngo gia kham', NULL, 'đã_giao', NULL, 'DON1765864704SD5', NULL),
('PGXQVHR9DE', '2025-12-22', NULL, 'b', '0812344144', '123 alo alo aloa lo', NULL, 'đã_giao', NULL, 'DON1766417122DTC', NULL);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `SAN_PHAM`
--

INSERT INTO `SAN_PHAM` (`MaSP`, `TenSP`, `QuyCach`, `DonViTinh`, `GiaVon`, `GiaBan`, `TonKho`, `HinhAnh`, `MaDanhMuc`, `MaNCC`) VALUES
('SPDEPVHY', 'Nước giải khát ngon lành', 'nan', 'Lon', 7000.00, 15000.00, 501, 'products/SPDEPVHY_1765097021.webp', 'DM001', 'NCC001'),
('SPENTW3F', 'cocacola', '1', 'lon', 8000.00, 15000.00, 93, 'products/SPENTW3F_1765096987.webp', 'DM001', 'NCC002'),
('SPRFP0VZ', 'test', '1', 'lon', 8000.00, 15000.00, 93, 'products/SPRFP0VZ_1765096977.webp', 'DM001', 'NCC001');

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
-- Indexes for table `CHAM_CONG`
--
ALTER TABLE `CHAM_CONG`
  ADD PRIMARY KEY (`MaChamCong`),
  ADD KEY `FK_ChamCong_CHT` (`MaCHT`),
  ADD KEY `FK_ChamCong_TL` (`MaTL`),
  ADD KEY `FK_ChamCong_NV` (`MaNV`);

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
-- Indexes for table `KHACH_HANG`
--
ALTER TABLE `KHACH_HANG`
  ADD PRIMARY KEY (`MaKH`),
  ADD UNIQUE KEY `khach_hang_apitoken_unique` (`ApiToken`);

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
-- Indexes for table `NHA_CUNG_CAP`
--
ALTER TABLE `NHA_CUNG_CAP`
  ADD PRIMARY KEY (`MaNCC`);

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
-- Indexes for table `SAN_PHAM`
--
ALTER TABLE `SAN_PHAM`
  ADD PRIMARY KEY (`MaSP`),
  ADD KEY `FK_SanPham_DanhMuc` (`MaDanhMuc`),
  ADD KEY `FK_SanPham_NCC` (`MaNCC`);

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
-- AUTO_INCREMENT for table `CHAM_CONG`
--
ALTER TABLE `CHAM_CONG`
  MODIFY `MaChamCong` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
-- Constraints for table `CHAM_CONG`
--
ALTER TABLE `CHAM_CONG`
  ADD CONSTRAINT `FK_ChamCong_CHT` FOREIGN KEY (`MaCHT`) REFERENCES `CUA_HANG_TRUONG` (`MaCHT`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_ChamCong_NV` FOREIGN KEY (`MaNV`) REFERENCES `NHAN_VIEN` (`MaNV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_ChamCong_TL` FOREIGN KEY (`MaTL`) REFERENCES `TRO_LY_CUA_HANG` (`MaTL`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Constraints for table `NHAN_VIEN`
--
ALTER TABLE `NHAN_VIEN`
  ADD CONSTRAINT `FK_NhanVien_TroLy` FOREIGN KEY (`MaTL`) REFERENCES `TRO_LY_CUA_HANG` (`MaTL`) ON UPDATE CASCADE;

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
-- Constraints for table `SAN_PHAM`
--
ALTER TABLE `SAN_PHAM`
  ADD CONSTRAINT `FK_SanPham_DanhMuc` FOREIGN KEY (`MaDanhMuc`) REFERENCES `DANH_MUC_SP` (`MaDanhMuc`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_SanPham_NCC` FOREIGN KEY (`MaNCC`) REFERENCES `NHA_CUNG_CAP` (`MaNCC`) ON UPDATE CASCADE;

--
-- Constraints for table `TRO_LY_CUA_HANG`
--
ALTER TABLE `TRO_LY_CUA_HANG`
  ADD CONSTRAINT `FK_TroLy_CHT` FOREIGN KEY (`MaCHT`) REFERENCES `CUA_HANG_TRUONG` (`MaCHT`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
