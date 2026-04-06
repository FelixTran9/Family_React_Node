const News = () => {
  const dummyNews = [
    { title: 'Sản phẩm mới: Omusubi Cá Hồi Nướng', date: '05/04/2026', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop' },
    { title: 'Chương trình khuyến mãi tháng 4', date: '01/04/2026', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop' }
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <h1 className="text-4xl font-extrabold text-cyan-700 mb-8 text-center">Tin Tức & Khuyến Mãi</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {dummyNews.map((n, i) => (
          <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-xl transition">
            <img src={n.img} alt={n.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
            <div className="p-6">
              <span className="text-sm text-cyan-600 font-bold mb-2 block">{n.date}</span>
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-cyan-600 transition">{n.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default News;
