import React, { useState } from 'react';
import { 
  Star, 
  Trash2, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  MessageSquare, 
  ShieldCheck, 
  User, 
  Filter,
  AlertCircle
} from 'lucide-react';
import { ReviewItem } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';

export const AdminReviewsManager: React.FC = () => {
  const { products } = useMarketplace();

  // Aggregate all reviews across products + standalone reviews
  const initialReviews: ReviewItem[] = products.flatMap((p) =>
    (p.reviews || []).map((r) => ({
      id: r.id,
      productId: p.id,
      productName: p.name,
      productImage: p.images?.[0],
      userId: r.userId,
      userName: r.userName,
      userAvatar: r.userAvatar,
      rating: r.rating,
      date: r.date,
      comment: r.comment,
      verifiedPurchase: r.verifiedPurchase,
      isHidden: false,
      isApproved: true,
    }))
  );

  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(initialReviews);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'visible' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  React.useEffect(() => {
    setReviewsList(initialReviews);
  }, [products]);

  const handleToggleHide = (reviewId: string) => {
    setReviewsList((prev) =>
      prev.map((rev) => {
        if (rev.id === reviewId) {
          const nextHidden = !rev.isHidden;
          return { ...rev, isHidden: nextHidden };
        }
        return rev;
      })
    );
    setActionNotice('تم تحديث حالة ظهور المراجعة بنجاح');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleDelete = (reviewId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المراجعة نهائياً؟')) {
      setReviewsList((prev) => prev.filter((r) => r.id !== reviewId));
      setActionNotice('تم حذف المراجعة بنجاح');
      setTimeout(() => setActionNotice(null), 2500);
    }
  };

  const filtered = reviewsList.filter((r) => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (filterStatus === 'visible' && r.isHidden) return false;
    if (filterStatus === 'hidden' && !r.isHidden) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.userName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (r.productName && r.productName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">إدارة مراجعات وتقييمات المنتجات</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                مراجعة تعليقات وتقييمات المشترين، فلترة الآراء، إخفاء التعليقات المسيئة أو الحذف.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
            إجمالي التقييمات: {reviewsList.length}
          </span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {actionNotice}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم العميل، نص التقييم، أو المنتج..."
          className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
        />

        <div className="flex items-center gap-2">
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
          >
            <option value="all">كل النجوم ⭐</option>
            <option value={5}>5 نجوم ⭐⭐⭐⭐⭐</option>
            <option value={4}>4 نجوم ⭐⭐⭐⭐</option>
            <option value={3}>3 نجوم ⭐⭐⭐</option>
            <option value={2}>نجمتان ⭐⭐</option>
            <option value={1}>نجمة واحدة ⭐</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
          >
            <option value="all">كل الحالات</option>
            <option value="visible">الظاهرة فقط</option>
            <option value="hidden">المخفية</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            لا توجد مراجعات مطابقة للبحث أو الفلتر المختار.
          </div>
        ) : (
          filtered.map((rev) => (
            <div
              key={rev.id}
              className={`p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                rev.isHidden ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50/40'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  {rev.productImage ? (
                    <img src={rev.productImage} alt="Product" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Star className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900">{rev.userName}</h4>
                    {rev.verifiedPurchase && (
                      <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        مشتري موثق
                      </span>
                    )}
                    <span className="text-xs text-slate-400">• {rev.date}</span>
                  </div>

                  <div className="flex items-center gap-1 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed max-w-2xl mt-1 font-medium">
                    "{rev.comment}"
                  </p>

                  {rev.productName && (
                    <div className="text-[11px] text-slate-400 mt-2">
                      المنتج: <strong className="text-slate-600">{rev.productName}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => handleToggleHide(rev.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    !rev.isHidden
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {!rev.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {!rev.isHidden ? 'ظاهر للعامة' : 'مخفي'}
                </button>

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="حذف المراجعة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReviewsManager;
