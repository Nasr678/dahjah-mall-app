import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Search, 
  Layers, 
  Plus, 
  Minus, 
  Compass, 
  Check, 
  Building, 
  Sparkles,
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

// Controller for programmatic panning when city or coords change from outside
const MapCenterController: React.FC<{
  center: [number, number];
  zoom: number;
}> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center[0], center[1], zoom]);

  return null;
};

// Map click event listener component
const MapClickHandler: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

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

  const markerRef = useRef<L.Marker | null>(null);

  // Custom User Marker Icon
  const userMarkerIcon = useMemo(() => {
    return createCustomMarkerIcon('user_pin');
  }, []);

  const handleLocationPicked = (newLat: number, newLng: number) => {
    const geocoded = reverseGeocodeYemen(newLat, newLng);
    onCoordinatesChange(newLat, newLng, geocoded);
    setStatusMessage(`تم تحديد الموقع: ${geocoded.city} — ${geocoded.district}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Drag handler for marker
  const markerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          handleLocationPicked(newPos.lat, newPos.lng);
        }
      },
    }),
    [onCoordinatesChange]
  );

  // GPS Device location trigger
  const handleLocateMe = async () => {
    setIsLocating(true);
    try {
      const loc = await getCurrentDeviceLocation();
      handleLocationPicked(loc.lat, loc.lng);
      setMapZoom(16);
      setStatusMessage(`تم تحديد موقعك بدقة عبر GPS: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
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
      setStatusMessage(`تم الانتقال إلى مدينة ${cityName}`);
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const currentTile = activeTileLayer === 'osm' ? OSM_TILE_LAYER : CARTO_DARK_TILE_LAYER;

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
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all shadow-lg active:scale-95 flex items-center gap-1.5 text-xs flex-shrink-0"
            title="موقعي الحالي عبر GPS"
          >
            <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">موقعي الحالي</span>
          </button>
        </div>

        {/* Quick Yemen City Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-0.5">
          {['صنعاء', 'عدن', 'تعز', 'حضرموت (المكلا)', 'إب', 'الحديدة', 'مأرب'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleQuickCitySelect(c)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all backdrop-blur-md shadow-sm ${
                selectedCity === c
                  ? 'bg-amber-500 text-neutral-950 border border-amber-400 font-black'
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
        <MapContainer
          center={[lat, lng]}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', minHeight: '260px' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            attribution={currentTile.attribution}
            url={currentTile.url}
            maxZoom={currentTile.maxZoom}
          />

          <MapCenterController center={[lat, lng]} zoom={mapZoom} />
          <MapClickHandler onLocationSelect={handleLocationPicked} />

          {/* Draggable Amber Pin */}
          <Marker
            position={[lat, lng]}
            draggable={true}
            eventHandlers={markerEventHandlers}
            ref={markerRef}
            icon={userMarkerIcon}
          />
        </MapContainer>

        {/* Map Floating Tools */}
        <div className="absolute left-3 bottom-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
          {/* Layer switcher */}
          <button
            type="button"
            onClick={() => setActiveTileLayer((prev) => (prev === 'osm' ? 'voyager' : 'osm'))}
            className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-700/80 backdrop-blur-md shadow-lg transition-all"
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

        {/* Toast Status */}
        {statusMessage && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1001] px-4 py-2 rounded-2xl bg-neutral-950/95 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-2xl backdrop-blur-md text-center max-w-[90%] animate-in fade-in slide-in-from-top-2">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Bottom Information Footer */}
      <div className="px-3 py-2 bg-neutral-950 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 z-10">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>انقر في أي مكان على الخريطة أو اسحب الدبوس لتحديد عنوانك بدقة</span>
        </div>
        <span className="font-mono text-neutral-500 text-[10px] hidden sm:inline">Leaflet & OpenStreetMap</span>
      </div>
    </div>
  );
};
