import { useState, useEffect } from 'react';
import API from '../services/api';
import { API_URL } from "../config";

const BASE_URL = API_URL;

const KM_TYPE_LABEL = {
  chiet_khau: '🏷️ Giảm giá',
  mua_tang: '🎁 Mua tặng',
};

const News = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/promotions')
      .then(r => setPromotions(r.data || []))
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false));
  }, []);

  const getImgSrc = (p) => {
    if (p.img) return `${BASE_URL}/uploads/${p.img}`;
    return `https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop&q=80`;
  };

  const isActive = (tu, den) => {
    const now = new Date();
    return new Date(tu) <= now && now <= new Date(den);
  };

  const fmt = (n) => Number(n).toLocaleString('vi-VN');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', padding: '60px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'4\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.5 }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🏷️</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: 12, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>Tin Tức & Khuyến Mãi</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto' }}>Những ưu đãi hấp dẫn nhất đang chờ bạn tại FamilyMart</p>
        </div>
      </div>

      <div className="container mx-auto px-4" style={{ maxWidth: 1100, marginTop: -32, paddingBottom: 60 }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #0891b2', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <p>Đang tải khuyến mãi...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>📭</div>
            <h2 style={{ fontSize: '1.4rem', color: '#64748b', fontWeight: 600 }}>Hiện chưa có chương trình khuyến mãi nào</h2>
            <p style={{ color: '#94a3b8', marginTop: 8 }}>Vui lòng quay lại sau nhé!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28 }}>
            {promotions.map((p) => {
              const active = isActive(p.TuNgay, p.DenNgay);
              return (
                <div key={p.MaKM} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
                >
                  {/* Ảnh */}
                  <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                    <img src={getImgSrc(p)} alt={p.TenCT} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
                      <span style={{ background: active ? '#059669' : '#94a3b8', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                        {active ? '🟢 Đang diễn ra' : '⚪ Sắp tới / Kết thúc'}
                      </span>
                      {p.kieuKM && (
                        <span style={{ background: p.kieuKM === 'mua_tang' ? '#7c3aed' : '#0891b2', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                          {KM_TYPE_LABEL[p.kieuKM] || p.kieuKM}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nội dung */}
                  <div style={{ padding: '20px 22px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#0891b2', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {new Date(p.TuNgay).toLocaleDateString('vi-VN')} — {new Date(p.DenNgay).toLocaleDateString('vi-VN')}
                    </div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: 8, lineHeight: 1.4 }}>{p.TenCT}</h2>

                    {/* Mô tả */}
                    {p.text && <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>{p.text}</p>}

                    {/* Loại KM Mua tặng */}
                    {p.kieuKM === 'mua_tang' && p.soLuongMua && p.soLuongTang && (
                      <div style={{ background: 'linear-gradient(135deg, #fdf4ff, #ede9fe)', border: '1px solid #e9d5ff', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed' }}>
                          🎁 Mua {p.soLuongMua} Tặng {p.soLuongTang}
                        </span>
                      </div>
                    )}

                    {/* Danh sách sản phẩm trong KM */}
                    {p.chiTiet && p.chiTiet.length > 0 && (
                      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sản phẩm áp dụng</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {p.chiTiet.slice(0, 3).map((ct, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                              <span style={{ color: '#334155', fontWeight: 500, flex: 1 }}>{ct.TenSP || ct.MaSP}</span>
                              <span style={{ color: '#dc2626', fontWeight: 700, marginLeft: 8, whiteSpace: 'nowrap' }}>
                                {parseFloat(ct.GiamGiaPhanTram) > 0 ? `-${ct.GiamGiaPhanTram}%` : parseFloat(ct.GiamGiaTien) > 0 ? `-${fmt(ct.GiamGiaTien)}đ` : ''}
                              </span>
                            </div>
                          ))}
                          {p.chiTiet.length > 3 && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>+{p.chiTiet.length - 3} sản phẩm khác...</div>}
                        </div>
                      </div>
                    )}

                    {/* Điều kiện mua tối thiểu */}
                    {p.chiTiet && p.chiTiet.some(ct => parseInt(ct.MuaToiThieu) > 1) && (
                      <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
                        ⚡ Áp dụng khi mua tối thiểu {Math.max(...p.chiTiet.map(ct => parseInt(ct.MuaToiThieu) || 1))} sản phẩm
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
export default News;
