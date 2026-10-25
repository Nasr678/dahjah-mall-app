import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  Star, 
  X, 
  ExternalLink, 
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  DAJJAH_BRANCHES, 
  DajjahBranchLocation, 
  CARTO_DARK_TILE_LAYER,
  OSM_TILE_LAYER,
  createCustomMarkerIcon 
} from '../../services/leafletMapService';

interface LeafletStoreLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Controller to smoothly pan to selected branch
const BranchMapPanController: React.FC<{ branch: DajjahBranchLocation | null }> = ({ branch }) => {
  const map = useMap();

  useEffect(() => {
    if (map && branch) {
      map.setView([branch.lat, branch.lng], 15, { animate: true });
    }
  }, [map, branch]);

  return null;
};

export const LeafletStoreLocatorModal: React.FC<LeafletStoreLocatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [activeBranch, setActiveBranch] = useState<DajjahBranchLocation>(DAJJAH_BRANCHES[0]);
  const [activeTile, setActiveTile] = useState<'voyager' | 'osm'>('voyager');

  if (!isOpen) return null;

  const filteredBranches = selectedCity === 'all'
    ? DAJJAH_BRANCHES
    : DAJJAH_BRANCHES.filter((b) => b.city.includes(selectedCity) || selectedCity.includes(b.city));

  const openDirections = (branch: DajjahBranchLocation) => {
    // Open in OpenStreetMap / standard geo navigation
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${branch.lat}%2C${branch.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const tileConfig = activeTile === 'voyager' ? CARTO_DARK_TILE_LAYER : OSM_TILE_LAYER;

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl text-white my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">فروع ومراكز ضَجّة مول</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  OpenStreetMap
                </span>
              </div>
              <p className="text-xs text-neutral-400">مواقع الفروع الرسمية ومراكز الاستلام الفوري في المحافظات اليمنية</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City Filter Pills */}
        <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', name: 'جميع الفروع' },
            { id: 'صنعاء', name: 'صنعاء' },
            { id: 'عدن', name: 'عدن' },
            { id: 'تعز', name: 'تعز' },
            { id: 'حضرموت', name: 'حضرموت' },
            { id: 'إب', name: 'إب' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedCity(c.id);
                const first = c.id === 'all'
                  ? DAJJAH_BRANCHES[0]
                  : DAJJAH_BRANCHES.find((b) => b.city.includes(c.id) || c.id.includes(b.city)) || DAJJAH_BRANCHES[0];
                setActiveBranch(first);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCity === c.id
                  ? 'bg-amber-500 text-neutral-950 shadow-md font-black'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Modal Main Body: Grid of Branch List + Map */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[420px] max-h-[60vh]">
          {/* Branch List (5 cols on Desktop) */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-l border-neutral-800 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-neutral-950/50">
            {filteredBranches.map((branch) => {
              const isSelected = activeBranch.id === branch.id;
              return (
                <div
                  key={branch.id}
                  onClick={() => setActiveBranch(branch)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-lg'
                      : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                        <span>{branch.nameAr}</span>
                      </div>
                      <div className="text-[11px] text-amber-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{branch.city} — {branch.district}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-amber-500/30">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{branch.rating}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {branch.address}
                  </p>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      <span>{branch.workingHours}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirections(branch);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>الاتجاهات</span>
                      <Navigation className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Leaflet Map (7 cols on Desktop) */}
          <div className="md:col-span-7 relative w-full h-[280px] md:h-full bg-neutral-950">
            <MapContainer
              center={[activeBranch.lat, activeBranch.lng]}
              zoom={14}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                attribution={tileConfig.attribution}
                url={tileConfig.url}
                maxZoom={tileConfig.maxZoom}
              />

              <BranchMapPanController branch={activeBranch} />

              {filteredBranches.map((b) => {
                const isSelected = activeBranch.id === b.id;
                const branchIcon = createCustomMarkerIcon(
                  isSelected ? 'hub' : 'store',
                  isSelected ? b.district : undefined
                );
                return (
                  <Marker
                    key={b.id}
                    position={[b.lat, b.lng]}
                    icon={branchIcon}
                    eventHandlers={{
                      click: () => setActiveBranch(b),
                    }}
                  />
                );
              })}
            </MapContainer>

            {/* Bottom floating active branch detail card over map */}
            <div className="absolute bottom-3 inset-x-3 z-[1000]">
              <div className="p-3 rounded-2xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 text-white shadow-2xl flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-white">{activeBranch.nameAr}</div>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                    <span>{activeBranch.phone}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">{activeBranch.workingHours}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a
                    href={`tel:${activeBranch.phone.replace(/\s+/g, '')}`}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-all"
                    title="اتصال بالفرع"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => openDirections(activeBranch)}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-all flex items-center gap-1 shadow-lg"
                  >
                    <span>فتح المسار</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>توصيل سريع من أقرب فرع ومستودع لمدينتك خلال ساعات معدودة وبدون أي تكلفة إضافية</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-all text-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
