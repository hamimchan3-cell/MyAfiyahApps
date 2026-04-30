import { useEffect, useMemo, useRef } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Hospital, MapBoundingBox } from "../data/hospitals";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const hasDialablePhone = (phone: string) => /\d{3,}/.test(phone);

const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    className: "custom-location-marker",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const hospitalIcon = createCustomIcon("#dc2626");
const clinicIcon = createCustomIcon("#16a34a");
const emergencyIcon = createCustomIcon("#ea580c");

const userLocationIcon = L.divIcon({
  html: `
    <div style="
      background-color: #2563eb;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>
  `,
  className: "custom-user-marker",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

type MapViewProps = {
  userLocation: { lat: number; lng: number } | null;
  hospitals: Hospital[];
  onViewportChange?: (bounds: MapBoundingBox) => void;
};

const DEFAULT_CENTER = { lat: 4.2105, lng: 101.9758 };

function FitBounds({
  points,
  userLocation,
}: {
  points: Array<{ lat: number; lng: number }>;
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const lastUserLocationKeyRef = useRef<string>("");

  useEffect(() => {
    if (!userLocation) {
      lastUserLocationKeyRef.current = "";
      return;
    }

    const locationKey = `${userLocation.lat.toFixed(5)}:${userLocation.lng.toFixed(5)}`;
    if (lastUserLocationKeyRef.current === locationKey) {
      return;
    }

    lastUserLocationKeyRef.current = locationKey;
    map.flyTo(userLocation, 13, { animate: true, duration: 1.2 });
  }, [map, userLocation]);

  useEffect(() => {
    if (userLocation || !points.length) return;

    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng] as const));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, points, userLocation]);

  return null;
}

function MapViewportListener({ onViewportChange }: { onViewportChange?: (bounds: MapBoundingBox) => void }) {
  const lastBoundsKeyRef = useRef("");

  useMapEvents({
    moveend(mapEvent) {
      if (!onViewportChange) return;

      const bounds = mapEvent.target.getBounds();
      const nextBounds = {
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      };
      const boundsKey = `${nextBounds.south.toFixed(4)}:${nextBounds.west.toFixed(4)}:${nextBounds.north.toFixed(4)}:${nextBounds.east.toFixed(4)}`;

      if (lastBoundsKeyRef.current === boundsKey) {
        return;
      }

      lastBoundsKeyRef.current = boundsKey;
      onViewportChange(nextBounds);
    },
  });

  return null;
}

const getFacilityIcon = (type: string) => {
  switch (type) {
    case "Emergency":
      return emergencyIcon;
    case "Clinic":
      return clinicIcon;
    case "Hospital":
    default:
      return hospitalIcon;
  }
};

export function MapView({ userLocation, hospitals, onViewportChange }: MapViewProps) {
  const center = useMemo(() => {
    if (userLocation) return userLocation;
    if (hospitals.length > 0) return { lat: hospitals[0].lat, lng: hospitals[0].lng };
    return DEFAULT_CENTER;
  }, [userLocation, hospitals]);

  const points = useMemo(() => {
    const nearby: Array<{ lat: number; lng: number }> = hospitals
      .slice(0, 10)
      .map((hospital) => ({ lat: hospital.lat, lng: hospital.lng }));
    if (userLocation) nearby.push(userLocation);
    return nearby;
  }, [hospitals, userLocation]);

  return (
    <div className="h-full w-full">
      <MapContainer center={center} zoom={14} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={points} userLocation={userLocation} />
        <MapViewportListener onViewportChange={onViewportChange} />

        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={250}
              pathOptions={{ color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 0.2 }}
            />
            <Marker position={userLocation} icon={userLocationIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">Your location</p>
                  <p className="text-xs text-gray-600">
                    {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {hospitals.map((hospital, index) => {
          const canCall = hasDialablePhone(hospital.phone);

          return (
            <Marker
              key={hospital.id}
              position={{ lat: hospital.lat, lng: hospital.lng }}
              icon={getFacilityIcon(hospital.type)}
            >
              <Popup>
                <div className="text-sm min-w-44">
                  <p className="font-semibold">{hospital.name}</p>
                  <p className="text-xs text-gray-600">{hospital.address}</p>
                  <p className="text-xs text-gray-600">{hospital.distance}</p>
                  <p className="text-xs font-medium text-blue-600 mt-1">{hospital.type}</p>
                  <p className="text-xs text-gray-600 mt-1">{canCall ? hospital.phone : "Phone unavailable"}</p>
                  {hospital.available24h ? <p className="text-xs text-green-600">24/7 Available</p> : null}
                  {index === 0 ? <p className="text-xs font-medium text-orange-600 mt-1">Nearest facility</p> : null}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
