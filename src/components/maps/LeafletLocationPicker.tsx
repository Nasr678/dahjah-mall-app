import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Search, 
  Layers, 
  Compass, 
  Navigation
} from 'lucide-react';
import { 
  OSM_TILE_LAYER, 
  CARTO_DARK_TILE_LAYER, 
  createCustomMarkerIcon 
} from '../../services/leafletMapService';
import { 
  reverseGeocodeYemen, 
  YEMEN_CITY_COORDINATES, 
  getCurrentDeviceLocation 
} from '../../services/locationService';

interface LeafletLocationPickerProps {
  lat: number;
  lng: number;
  onCoordinatesChange: (lat: number, lng: number, geocodedInfo?: any) => void;
  className?: string;
  selectedCity?: string;
}

export const LeafletLocationPicker: React.FC<LeafletLocationPickerProps> = ({
  lat,
  lng,
  onCoordinatesChange,
  className = 'h-[320px] sm:h-[380px]',
  selectedCity = 'صنعاء',
}) => {
  const [mapZoom, setMapZoom] = useState(15);
  const [activeTileLayer, setActiveTileLayer] = useState<'osm' | 'voyager'>('voyager');
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Custom User Marker Icon
  const userMarkerIcon = useMemo(() => {
    return createCustomMarkerIcon('user_pin');
  }, []);

  const handleLocationPicked = useCallback((newLat: number, newLng: number) => {
    const geocoded = reverseGeocodeYemen(newLat, newLng);
    onCoordinatesChange(newLat, newLng, geocoded);
    setStatusMessage(`تم تحديد الموقع: ${geocoded.city} — ${geocoded.district}`);
    setTimeout(() => setStatusMessage(null), 3000);
  }, [onCoordinatesChange]);

  const currentTile = activeTileLayer === 'osm' ? OSM_TILE_LAYER : CARTO_DARK_TILE_LAYER;

  // Initialize pure Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: mapZoom,
        zoomControl: false,
        attributionControl: false,
      });

      const tile = L.tileLayer(currentTile.url, {
        maxZoom: currentTile.maxZoom,
      }).addTo(map);
      tileLayerRef.current = tile;

      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: userMarkerIcon,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handleLocationPicked(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        handleLocationPicked(e.latlng.lat, e.latlng.lng);
      });

      markerInstanceRef.current = marker;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // Update marker & view when lat/lng props change
  useEffect(() => {
    if (mapInstanceRef.current && markerInstanceRef.current) {
      const currentPos = markerInstanceRef.current.getLatLng();
      if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001) {
        markerInstanceRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], mapZoom, { animate: true });
      }
    }
  }, [lat, lng, mapZoom]);

  // Update Tile Layer if switched
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const newTile = L.tileLayer(currentTile.url, { maxZoom: currentTile.maxZoom }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [activeTileLayer, currentTile.url, currentTile.maxZoom]);

  // GPS Device location trigger
  const handleLocateMe = async () => {
    setIsLocating(true);
    try {
      const loc = await getCurrentDeviceLocation();
      handleLocationPicked(loc.lat, loc.lng);
      setMapZoom(16);
      if (mapInstanceRef.current && markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([loc.lat, loc.lng]);
        mapInstanceRef.current.setView([loc.lat, loc.lng], 16, { animate: true });
      }
      setStatusMessage(`تم تحديد موقعك بدقة عبر GPS: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch {
      setStatusMessage('تعذر الوصول لنظام GPS. يرجى تفعيل إذن الموقع أو النقر على الخريطة.');
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsLocating(false);
    }
  };

  // Quick City Pan
  const handleQuickCitySelect = (cityName: string) => {
    const coords = YEMEN_CITY_COORDINATES[cityName];
    if (coords) {
      handleLocationPicked(coords.lat, coords.lng);
      setMapZoom(14);
      if (mapInstanceRef.current && markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([coords.lat, coords.lng]);
        mapInstanceRef.current.setView([coords.lat, coords.lng], 14, { animate: true });
      }
      setStatusMessage(`تم الانتقال إلى مدينة ${cityName}`);
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-inner flex flex-col ${className}`}>
      {/* Search and Quick Cities Top Bar */}
      <div className="absolute top-2.5 inset-x-2.5 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مدينة، حي، أو شارع في اليمن..."
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-white text-xs placeholder:text-neutral-500 focus:border-amber-500 outline-none shadow-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const match = Object.keys(YEMEN_CITY_COORDINATES).find(
                    (c) => searchQuery.includes(c) || c.includes(searchQuery)
                  );
                  if (match) {
                    handleQuickCitySelect(match);
                  }
                }
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 flex-shrink-0 cursor-pointer"
            title="موقعي الحالي عبر GPS"
          >
            <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">موقعي الحالي</span>
          </button>
        </div>

        {/* Quick select pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {['صنعاء', 'عدن', 'تعز', 'حضرموت', 'الحديدة', 'إب', 'ذمار', 'مأرب'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleQuickCitySelect(c)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all shadow-md cursor-pointer ${
                selectedCity === c
                  ? 'bg-amber-400 text-neutral-950 font-black'
                  : 'bg-neutral-900/85 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Leaflet Map View */}
      <div className="w-full flex-1 relative min-h-[260px]">
        <div
          ref={mapContainerRef}
          className="w-full h-full min-h-[260px]"
          style={{ background: '#121212' }}
        />

        {/* Map Floating Tools */}
        <div className="absolute left-3 bottom-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
          {/* Layer switcher */}
          <button
            type="button"
            onClick={() => setActiveTileLayer((prev) => (prev === 'osm' ? 'voyager' : 'osm'))}
            className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-700/80 backdrop-blur-md shadow-lg transition-all cursor-pointer"
            title="تبديل نمط الخريطة"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Live Coordinates / Status Badge */}
        <div className="absolute right-3 bottom-3 z-[1000] pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 text-[11px] text-neutral-300 flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-mono text-amber-300">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Feedback notification toast */}
        {statusMessage && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] px-3.5 py-1.5 rounded-xl bg-neutral-900/95 border border-amber-500/50 text-amber-300 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="px-3.5 py-2 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 z-10">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-amber-400" />
          <span>انقر في أي مكان أو اسحب الدبوس لتحديد عنوان التوصيل بدقة</span>
        </div>
        <span className="font-mono text-neutral-500 text-[10px] hidden sm:inline">Leaflet & OpenStreetMap</span>
      </div>
    </div>
  );
};
