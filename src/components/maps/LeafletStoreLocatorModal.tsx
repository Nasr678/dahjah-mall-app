import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Store, 
  Phone, 
  Clock, 
  Navigation, 
  Star, 
  X, 
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

export const LeafletStoreLocatorModal: React.FC<LeafletStoreLocatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [activeBranch, setActiveBranch] = useState<DajjahBranchLocation>(DAJJAH_BRANCHES[0]);
  const [activeTile, setActiveTile] = useState<'voyager' | 'osm'>('voyager');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const filteredBranches = selectedCity === 'all'
    ? DAJJAH_BRANCHES
    : DAJJAH_BRANCHES.filter((b) => b.city.includes(selectedCity) || selectedCity.includes(b.city));

  const tileConfig = activeTile === 'voyager' ? CARTO_DARK_TILE_LAYER : OSM_TILE_LAYER;

  // Initialize pure Leaflet map instance on modal mount
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [activeBranch.lat, activeBranch.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(tileConfig.url, {
        maxZoom: tileConfig.maxZoom,
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, [isOpen]);

  // Update tile layer if changed
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const newTile = L.tileLayer(tileConfig.url, { maxZoom: tileConfig.maxZoom }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [activeTile, tileConfig.url, tileConfig.maxZoom]);

  // Render markers and pan when filtered branches or active branch change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    filteredBranches.forEach((b) => {
      const isSelected = activeBranch.id === b.id;
      const branchIcon = createCustomMarkerIcon(
        isSelected ? 'hub' : 'store',
        isSelected ? b.district : undefined
      );

      const marker = L.marker([b.lat, b.lng], { icon: branchIcon });
      marker.on('click', () => {
        setActiveBranch(b);
      });
      marker.addTo(markersGroupRef.current!);
    });

    mapInstanceRef.current.setView([activeBranch.lat, activeBranch.lng], 15, { animate: true });
  }, [filteredBranches, activeBranch]);

  if (!isOpen) return null;

  const openDirections = (branch: DajjahBranchLocation) => {
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${branch.lat}%2C${branch.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-neutral-200 rounded-3xl shadow-2xl text-neutral-900 my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-neutral-950">فروع ومراكز ضَجّة مول</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  خريطة تفاعلية
                </span>
              </div>
              <p className="text-xs text-neutral-500">مواقع الفروع الرسمية ومراكز الاستلام الفوري في المحافظات اليمنية</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F6F7F9] hover:bg-neutral-200/70 border border-neutral-200 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City Filter Pills */}
        <div className="px-4 py-2.5 bg-[#F6F7F9] border-b border-neutral-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', name: 'جميع الفروع' },
            { id: 'صنعاء', name: 'صنعاء' },
            { id: 'عدن', name: 'عدن' },
            { id: 'تعز', name: 'تعز' },
            { id: 'حضرموت', name: 'حضرموت' },
            { id: 'إب', name: 'إب' },
            { id: 'الحديدة', name: 'الحديدة' },
          ].map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => setSelectedCity(city.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCity === city.id
                  ? 'bg-amber-400 text-neutral-950 shadow-sm font-black'
                  : 'bg-white text-neutral-600 hover:text-neutral-950 border border-neutral-200'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* Modal Body: Split 2 columns (Branch List 5 cols, Leaflet Map 7 cols) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[380px] sm:min-h-[460px]">
          {/* Branch List (5 cols on Desktop) */}
          <div className="md:col-span-5 p-3.5 sm:p-4 overflow-y-auto space-y-2.5 max-h-[260px] md:max-h-[500px] border-b md:border-b-0 md:border-l border-neutral-200 bg-[#F6F7F9]">
            {filteredBranches.map((branch) => {
              const isSelected = activeBranch.id === branch.id;
              return (
                <div
                  key={branch.id}
                  onClick={() => setActiveBranch(branch)}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400/40 shadow-sm'
                      : 'bg-white hover:border-neutral-300 border-neutral-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl ${
                        isSelected ? 'bg-amber-400 text-neutral-950' : 'bg-[#F6F7F9] text-neutral-600 border border-neutral-200'
                      }`}>
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-neutral-950">{branch.nameAr}</h4>
                        <span className="text-[11px] text-amber-700 font-medium">{branch.city} • {branch.district}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 tabular-nums">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{branch.rating}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-600 line-clamp-1 mb-2">
                    {branch.address}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-neutral-100">
                    <span className="text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>{branch.workingHours}</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirections(branch);
                      }}
                      className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>الاتجاهات</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Leaflet Map (7 cols on Desktop) */}
          <div className="md:col-span-7 relative w-full h-[280px] md:h-full bg-neutral-100">
            {/* Map Canvas */}
            <div
              ref={mapContainerRef}
              className="w-full h-full min-h-[280px]"
              style={{ background: '#121212' }}
            />

            {/* Bottom floating active branch detail card over map */}
            <div className="absolute bottom-3 inset-x-3 z-[1000] pointer-events-auto">
              <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200 text-neutral-950 shadow-xl flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-neutral-950">{activeBranch.nameAr}</div>
                  <div className="text-[11px] text-neutral-600 flex items-center gap-2 tabular-nums">
                    <span>{activeBranch.phone}</span>
                    <span>•</span>
                    <span className="text-amber-700 font-bold">{activeBranch.workingHours}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${activeBranch.phone}`}
                    className="p-2 rounded-xl bg-[#F6F7F9] hover:bg-neutral-200/70 text-neutral-700 hover:text-neutral-950 border border-neutral-200 transition-colors"
                    title="اتصال بالفرع"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => openDirections(activeBranch)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>خريطة</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Map Layer switcher tool */}
            <div className="absolute top-3 left-3 z-[1000]">
              <button
                type="button"
                onClick={() => setActiveTile((prev) => (prev === 'voyager' ? 'osm' : 'voyager'))}
                className="px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-neutral-800 border border-neutral-200 text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md shadow-md transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>{activeTile === 'voyager' ? 'خريطة داكنة' : 'خريطة الشارع'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
