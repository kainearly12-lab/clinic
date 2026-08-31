import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  ExternalLink,
  Save,
  Check,
} from 'lucide-react';
import { BranchRecord } from '@/types/schedule';

interface BranchEditorProps {
  branches: BranchRecord[];
  onUpdateBranch: (branchId: string, updates: Partial<BranchRecord>) => Promise<void>;
  isLoading?: boolean;
}

export function BranchEditor({
  branches,
  onUpdateBranch,
}: BranchEditorProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || 'nasr-city');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State
  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const [nameAr, setNameAr] = useState<string>(currentBranch?.name_ar || currentBranch?.nameAr || '');
  const [cityAr, setCityAr] = useState<string>(currentBranch?.city_ar || currentBranch?.cityAr || '');
  const [addressAr, setAddressAr] = useState<string>(currentBranch?.address_ar || currentBranch?.addressAr || '');
  const [phone, setPhone] = useState<string>(currentBranch?.phone || '');
  const [mapsUrl, setMapsUrl] = useState<string>(currentBranch?.maps_url || currentBranch?.mapsUrl || '');
  const [mapSrc, setMapSrc] = useState<string>(currentBranch?.map_src || currentBranch?.mapSrc || '');

  const handleSelectBranch = (branch: BranchRecord) => {
    setSelectedBranchId(branch.id);
    setNameAr(branch.name_ar || branch.nameAr || '');
    setCityAr(branch.city_ar || branch.cityAr || '');
    setAddressAr(branch.address_ar || branch.addressAr || '');
    setPhone(branch.phone || (branch.phones && branch.phones[0]?.number) || '');
    setMapsUrl(branch.maps_url || branch.mapsUrl || '');
    setMapSrc(branch.map_src || branch.mapSrc || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBranch) return;

    setIsSaving(true);
    try {
      await onUpdateBranch(currentBranch.id, {
        name_ar: nameAr.trim(),
        nameAr: nameAr.trim(),
        city_ar: cityAr.trim(),
        cityAr: cityAr.trim(),
        address_ar: addressAr.trim(),
        addressAr: addressAr.trim(),
        phone: phone.trim(),
        maps_url: mapsUrl.trim(),
        mapsUrl: mapsUrl.trim(),
        map_src: mapSrc.trim(),
        mapSrc: mapSrc.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-[#00B8A9]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">محرر بيانات الفروع والمواقع</h2>
            <p className="text-xs text-slate-400">تحديث الأسماء والعناوين التفصيلية وروابط خرائط جوجل للفروع</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Branches Tab List (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          {branches.map((b) => {
            const isSelected = b.id === selectedBranchId;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelectBranch(b)}
                className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'border-[#00B8A9] bg-slate-900/80 shadow-[0_0_20px_rgba(0,184,169,0.2)] ring-1 ring-[#00B8A9]'
                    : 'border-white/5 bg-slate-900/30 hover:border-white/20 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-[#00B8A9]/20 border-[#00B8A9] text-[#00B8A9]'
                        : 'bg-white/5 border-white/10 text-slate-400 group-hover:text-white'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{b.name_ar || b.nameAr}</h3>
                    <p className="text-xs text-slate-400">{b.city_ar || b.cityAr}</p>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-[#00B8A9]" />}
              </button>
            );
          })}
        </div>

        {/* Branch Edit Form (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00B8A9]" />
                <h3 className="text-sm font-black text-white">
                  تعديل بيانات: {currentBranch?.name_ar || currentBranch?.nameAr}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                ID: {currentBranch?.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الفرع (بالعربية)</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المدينة / المنطقة</label>
                <input
                  type="text"
                  value={cityAr}
                  onChange={(e) => setCityAr(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">العنوان التفصيلي</label>
              <textarea
                value={addressAr}
                onChange={(e) => setAddressAr(e.target.value)}
                rows={2}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الهاتف / الواتساب</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01154021247"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9] dir-ltr text-right"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رابط خرائط جوجل (Google Maps URL)</label>
                <div className="relative">
                  <input
                    type="url"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9] pl-9"
                  />
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-[#00B8A9] transition-colors"
                      title="فتح الرابط لمعاينته"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">كود تضمين الخريطة (iFrame Embed Src)</label>
              <input
                type="text"
                value={mapSrc}
                onChange={(e) => setMapSrc(e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00B8A9] font-mono text-[11px]"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`btn-primary py-3 px-6 rounded-xl font-black text-xs transition-all flex items-center gap-2 bg-[#00B8A9] hover:bg-teal-400 text-slate-950 shadow-[0_0_20px_rgba(0,184,169,0.3)] ${
                  isSaving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? (
                  'جاري حفظ التعديلات...'
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ بيانات الفرع في قاعدة البيانات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
