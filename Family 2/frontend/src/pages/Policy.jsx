const Policy = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-extrabold text-cyan-700 mb-8 text-center">Chính Sách & Quy Định</h1>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">1. Chính sách bảo mật thông tin</h2>
          <p>Thu thập và sử dụng thông tin cá nhân khách hàng chỉ nhằm mục đích cung cấp dịch vụ và chăm sóc khách hàng. Cam kết bảo mật mọi thông tin.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">2. Quy định đổi trả hàng</h2>
          <p>Hỗ trợ đổi trả sản phẩm lỗi do nhà cung cấp trong vòng 24h kể từ khi mua hàng. Yêu cầu có hóa đơn đi kèm.</p>
        </section>
      </div>
    </div>
  );
};
export default Policy;
