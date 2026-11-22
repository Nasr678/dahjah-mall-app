import React, { useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Order } from '../../types';
import { 
  CARTO_DARK_TILE_LAYER, 
  DAJJAH_BRANCHES, 
  createCustomMarkerIcon 
} from '../../services/leafletMapService';
import { Truck, Clock } from 'lucide-react';

interface LeafletOrderTrackerProps {
  order: Order;
  className?: string;
}

export const LeafletOrderTracker: React.FC<LeafletOrderTrackerProps> = ({
  order,
  className = 'h-[280px] sm:h-[320px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

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

  // Initialize pure Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: mapCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(CARTO_DARK_TILE_LAYER.url, {
        maxZoom: CARTO_DARK_TILE_LAYER.maxZoom,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // Draw Route & Markers on order update
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    // 1. Draw Polyline
    L.polyline(routePositions, {
      color: '#f59e0b',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8',
    }).addTo(layerGroupRef.current);

    // 2. Origin Hub Marker
    L.marker([originLat, originLng], { icon: hubIcon }).addTo(layerGroupRef.current);

    // 3. Courier Marker
    if (order.status !== 'delivered') {
      L.marker([courierInfo.lat, courierInfo.lng], { icon: courierIcon }).addTo(layerGroupRef.current);
    }

    // 4. Destination Marker
    L.marker([destLat, destLng], { icon: destIcon }).addTo(layerGroupRef.current);

    // Adjust bounds
    try {
      mapInstanceRef.current.fitBounds(L.latLngBounds(routePositions), { padding: [40, 40] });
    } catch {
      mapInstanceRef.current.setView(mapCenter, 13);
    }
  }, [routePositions, originLat, originLng, destLat, destLng, courierInfo, hubIcon, courierIcon, destIcon, order.status, mapCenter]);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-neutral-200 bg-white shadow-sm flex flex-col ${className}`}>
      {/* Live Map Top Floating Status Banner */}
      <div className="absolute top-3 inset-x-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200 shadow-lg flex items-center gap-2">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-ping absolute inset-0 opacity-75"></span>
          </div>
          <div className="text-xs">
            <span className="font-bold text-neutral-950">تتبع المسار المباشر</span>
            <span className="text-neutral-500 mr-1.5 hidden sm:inline">• {courierInfo.label}</span>
          </div>
        </div>

        {order.status === 'out_for_delivery' && (
          <div className="px-3 py-1.5 rounded-2xl bg-amber-400 text-neutral-950 font-black text-xs shadow-lg flex items-center gap-1.5 tabular-nums">
            <Clock className="w-3.5 h-3.5" />
            <span>متوقع: 15-25 دقيقة</span>
          </div>
        )}
      </div>

      {/* Main Leaflet Map Container */}
      <div className="w-full flex-1 relative min-h-[220px]">
        <div
          ref={mapContainerRef}
          className="w-full h-full min-h-[220px]"
          style={{ background: '#121212' }}
        />
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2.5 bg-[#F6F7F9] border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-600 z-10">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-amber-600" />
          <span>تحديث لحظي لحركة مندوب التوصيل في أرجاء المدينة</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-500">
          <span>Leaflet / OpenStreetMap</span>
        </div>
      </div>
    </div>
  );
};
