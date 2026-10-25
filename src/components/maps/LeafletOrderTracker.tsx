import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { Order } from '../../types';
import { 
  CARTO_DARK_TILE_LAYER, 
  DAJJAH_BRANCHES, 
  createCustomMarkerIcon 
} from '../../services/leafletMapService';
import { Truck, MapPin, Store, Navigation, Clock } from 'lucide-react';

interface LeafletOrderTrackerProps {
  order: Order;
  className?: string;
}

export const LeafletOrderTracker: React.FC<LeafletOrderTrackerProps> = ({
  order,
  className = 'h-[280px] sm:h-[320px]',
}) => {
  // Destination Coordinates from order shipping address or fallback to Sana'a
  const destLat = order.shippingAddress.lat || 15.3324;
  const destLng = order.shippingAddress.lng || 44.1852;

  // Origin Hub: Pick closest Dajjah hub (Sana'a or Aden or default)
  const isSouth = order.shippingAddress.region === 'south' || order.shippingAddress.city === 'عدن';
  const hub = isSouth ? DAJJAH_BRANCHES[2] : DAJJAH_BRANCHES[0];
  const originLat = hub.lat;
  const originLng = hub.lng;

  // Calculate Courier Position based on order status
  const courierInfo = useMemo(() => {
    switch (order.status) {
      case 'received':
      case 'processing':
        return { 
          lat: originLat, 
          lng: originLng, 
          progress: 0.05, 
          label: 'في مركز التجهيز والتوزيع' 
        };
      case 'out_for_delivery':
        // Interpolate ~68% towards destination along route
        return {
          lat: originLat + (destLat - originLat) * 0.68 + 0.0015,
          lng: originLng + (destLng - originLng) * 0.68 - 0.0012,
          progress: 0.70,
          label: 'في الطريق إليك مع مندوب التوصيل السريع',
        };
      case 'delivered':
        return { 
          lat: destLat, 
          lng: destLng, 
          progress: 1.0, 
          label: 'تم التسليم بنجاح في الموقع' 
        };
      case 'cancelled':
      default:
        return { 
          lat: originLat, 
          lng: originLng, 
          progress: 0, 
          label: 'الطلب متوقف' 
        };
    }
  }, [order.status, originLat, originLng, destLat, destLng]);

  // Center map midway
  const mapCenter: [number, number] = useMemo(() => {
    return [
      (originLat + destLat) / 2,
      (originLng + destLng) / 2,
    ];
  }, [originLat, originLng, destLat, destLng]);

  // Route Polyline Points (Origin -> Courier -> Dest)
  const routePositions: [number, number][] = useMemo(() => {
    if (order.status === 'out_for_delivery') {
      return [
        [originLat, originLng],
        [courierInfo.lat, courierInfo.lng],
        [destLat, destLng],
      ];
    }
    return [
      [originLat, originLng],
      [destLat, destLng],
    ];
  }, [originLat, originLng, courierInfo.lat, courierInfo.lng, destLat, destLng, order.status]);

  // Icons
  const hubIcon = useMemo(() => createCustomMarkerIcon('hub', 'مركز التجهيز'), []);
  const courierIcon = useMemo(() => createCustomMarkerIcon('courier'), []);
  const destIcon = useMemo(() => createCustomMarkerIcon('pickup'), []);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl flex flex-col ${className}`}>
      {/* Live Map Top Floating Status Banner */}
      <div className="absolute top-3 inset-x-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1.5 rounded-2xl bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 shadow-xl flex items-center gap-2">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-ping absolute inset-0 opacity-75"></span>
          </div>
          <div className="text-xs">
            <span className="font-bold text-white">تتبع المسار المباشر</span>
            <span className="text-neutral-400 mr-1.5 hidden sm:inline">• {courierInfo.label}</span>
          </div>
        </div>

        {order.status === 'out_for_delivery' && (
          <div className="px-3 py-1.5 rounded-2xl bg-amber-500/90 backdrop-blur-md text-neutral-950 font-black text-xs shadow-xl flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>متوقع: 15-25 دقيقة</span>
          </div>
        )}
      </div>

      {/* Main Leaflet Map Container */}
      <div className="w-full flex-1 relative min-h-[220px]">
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', minHeight: '220px' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            attribution={CARTO_DARK_TILE_LAYER.attribution}
            url={CARTO_DARK_TILE_LAYER.url}
            maxZoom={CARTO_DARK_TILE_LAYER.maxZoom}
          />

          {/* Simulated Route Polyline */}
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#f59e0b',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8',
            }}
          />

          {/* 1. Hub / Origin Marker */}
          <Marker position={[originLat, originLng]} icon={hubIcon} />

          {/* 2. Live Courier Vehicle Marker (if active delivery) */}
          {order.status !== 'delivered' && (
            <Marker position={[courierInfo.lat, courierInfo.lng]} icon={courierIcon} />
          )}

          {/* 3. Destination Delivery Marker */}
          <Marker position={[destLat, destLng]} icon={destIcon} />
        </MapContainer>
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 z-10">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-white font-medium">
            من <strong className="text-amber-400">{hub.district}</strong> إلى{' '}
            <strong className="text-emerald-400">
              {order.shippingAddress.district || order.shippingAddress.city}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
          <span>Leaflet / OpenStreetMap</span>
        </div>
      </div>
    </div>
  );
};
