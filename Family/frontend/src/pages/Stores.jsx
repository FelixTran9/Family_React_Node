import { MapPin } from 'lucide-react';

const Stores = () => {
  const dummyStores = [
    { title: 'FamilyMart Lê Duẩn', address: 'Số 1 Lê Duẩn, Quận 1, TPHCM' },
    { title: 'FamilyMart Phạm Ngọc Thạch', address: '63 Phạm Ngọc Thạch, Quận 3, TPHCM' },
    { title: 'FamilyMart Nguyễn Văn Cừ', address: '227 Nguyễn Văn Cừ, Quận 5, TPHCM' }
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <h1 className="text-4xl font-extrabold text-cyan-700 mb-8 text-center">Hệ Thống Cửa Hàng</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {dummyStores.map((store, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start">
              <MapPin className="w-8 h-8 text-red-500 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg text-gray-800">{store.title}</h3>
                <p className="text-gray-600">{store.address}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center text-gray-500 font-bold border-4 border-white shadow-xl">
          [Bản đồ tích hợp Google Maps API tại đây]
        </div>
      </div>
    </div>
  );
};
export default Stores;
