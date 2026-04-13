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
        <div className="bg-gray-200 rounded-2xl h-[500px] flex items-center justify-center text-gray-500 font-bold border-4 border-white shadow-xl overflow-hidden rounded-2xl relative group">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2946258079555!2d106.69741511526038!3d10.788730992313271!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3606f2122b%3A0x6b6d510dc8bd9d!2sFamilyMart%20L%C3%AA%20Du%E1%BA%A9n!5e0!3m2!1svi!2s!4v1683446059275!5m2!1svi!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="group-hover:scale-105 transition-transform duration-1000"
          ></iframe>
        </div>
      </div>
    </div>
  );
};
export default Stores;
