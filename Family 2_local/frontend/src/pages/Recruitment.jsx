const Recruitment = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-extrabold text-cyan-700 mb-8 text-center">Cơ Hội Nghề Nghiệp</h1>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tuyển dụng Nhân viên cửa hàng</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
          <li>Độ tuổi từ 18 - 30</li>
          <li>Nhanh nhẹn, vui vẻ, giao tiếp tốt</li>
          <li>Linh hoạt ca làm việc (Sáng/Chiều/Đêm)</li>
        </ul>
        <button className="bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-cyan-700 transition">
          Ứng tuyển ngay
        </button>
      </div>
    </div>
  );
};
export default Recruitment;
