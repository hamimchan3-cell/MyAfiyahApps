import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, LocateFixed, MapPin, Phone, Navigation, Clock, Map, List, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import {
  createBoundsFromCenter,
  fetchHealthcareFacilitiesInBounds,
  nearbyHospitals,
  type Hospital,
} from "../data/hospitals";
import { Geolocation } from '@capacitor/geolocation';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { MapView } from "./MapView";
import { useAppLanguage } from "../lib/language";

const SEARCH_RADIUS_KM = 30;
const FACILITIES_PAGE_SIZE = 15;

const hasDialablePhone = (phone: string) => /\d{3,}/.test(phone);
type NativeLocationPermission = Awaited<ReturnType<typeof Geolocation.checkPermissions>>;

type DebugLocationLabel = {
  title: string;
  detail: string;
};

const hasNativeLocationPermission = (permissionStatus: NativeLocationPermission) =>
  permissionStatus.location === "granted" || permissionStatus.coarseLocation === "granted";

export function NearbyHospitals() {
  const navigate = useNavigate();
  const [language] = useAppLanguage();
  const t = language === "ms"
    ? {
        detectingLocation: "Mengesan lokasi anda...",
        waitingForGps: "Menunggu koordinat GPS.",
        nearbyTitle: "Kemudahan Perubatan Berdekatan",
        nearbySubtitle: "Cari hospital atau klinik terdekat anda di Malaysia",
        mapView: "Paparan Peta",
        listView: "Paparan Senarai",
        gettingLocation: "Mendapatkan lokasi anda",
        searchingFacilities: "Mencari kemudahan perubatan berhampiran secara langsung",
        locationEnabled: "Lokasi diaktifkan - Menunjukkan hospital dan klinik yang beroperasi berhampiran, termasuk hasil peta langsung dalam lingkungan 30km",
        refresh: "Muat semula",
        clickGetLocation: 'Klik "Dapatkan Lokasi" untuk mencari kemudahan perubatan berhampiran.',
        getLocation: "Dapatkan Lokasi",
        currentPinnedLocation: "Lokasi semasa yang dipinkan",
        locateMe: "Cari Saya",
        refreshingLocation: "Memuat semula lokasi anda",
        showingNearby: "Menunjukkan hospital dan klinik yang beroperasi dalam lingkungan 30km. Tukar ke paparan senarai untuk butiran.",
        nearbyFacilities: "Kemudahan Perubatan Berdekatan",
        facilitiesFound: "Kemudahan Perubatan Ditemui",
        lookingAroundPinned: "Mencari klinik dan hospital berhampiran lokasi yang anda pin",
        noFacilities: "Tiada klinik atau hospital yang tersenarai dalam lingkungan 30km dari lokasi yang dipinkan. Tekan <strong>Cari Saya</strong> untuk memuat semula atau semak sama ada lokasi yang dipinkan adalah betul.",
        directions: "Arah",
        phoneUnavailable: "Telefon tidak tersedia",
        unnamedNote: "Kemudahan ini tidak bernama. Sila gunakan <strong>Arah</strong> untuk terus ke sana.",
        viewOnMap: "Lihat di Peta",
        locationServices: "📍 Perkhidmatan Lokasi",
        locationServicesText: "Aktifkan perkhidmatan lokasi untuk keputusan yang lebih tepat dan pengiraan jarak masa nyata ke kemudahan perubatan berhampiran.",
        onWeb: "Di web:",
        onWebText: "Pelayar anda akan meminta kebenaran lokasi. Pastikan anda membenarkannya untuk pengalaman terbaik.",
        accuracyNoteLabel: "Nota ketepatan:",
        accuracyNoteText: "Pada komputer riba atau pelayar desktop, lokasi boleh menjadi anggaran atau salah apabila menggunakan Ethernet, hotspot, atau sambungan berasaskan rangkaian sahaja. Wi‑Fi atau telefon dengan GPS biasanya memberi lokasi yang lebih tepat.",
        noListedFound: "Tiada klinik atau hospital tersenarai ditemui dalam lingkungan 30km dari lokasi yang dipinkan.",
        fetchAdditionalFailed: "Tidak dapat mendapatkan kemudahan perubatan tambahan yang berdekatan. Hanya keputusan berdaftar dipaparkan.",
        facilityPhoneMissing: "Fasiliti ini belum mempunyai nombor telefon yang diterbitkan.",
        addressUnavailable: "Alamat tidak tersedia",
        unnamedClinic: "Klinik Tanpa Nama",
        locationAccessDeniedTitle: "Akses lokasi ditolak",
        locationAccessDeniedDetail: "Benarkan kebenaran dalam tetapan peranti anda, kemudian tekan Cari Saya atau Cuba lagi.",
        permissionDenied: "Kebenaran lokasi ditolak. Sila benarkan akses lokasi untuk MyAfiyah dalam tetapan peranti anda.",
        positionUnavailable: "Maklumat lokasi tidak tersedia. Sila semak tetapan GPS anda.",
        locationTimeout: "Permintaan lokasi mengambil masa terlalu lama. Sila cuba lagi.",
        unableToGetLocation: "Tidak dapat mendapatkan lokasi anda. Sila cuba lagi.",
        unableToDetectLocation: "Tidak dapat mengesan lokasi anda",
        gpsOff: "Perkhidmatan lokasi dimatikan pada peranti anda. Sila hidupkan GPS/perkhidmatan lokasi dan cuba lagi.",
        gpsSlow: "GPS mengambil masa terlalu lama untuk memberi respons. Sila bergerak ke kawasan terbuka dan cuba lagi.",
        liveUpdatesUnavailable: "Lokasi berjaya dikesan sekali, tetapi kemas kini langsung tidak tersedia buat sementara waktu.",
        tryAgain: "Cuba lagi",
        callFacility: "Hubungi fasiliti",
        seeMore: "Lihat Lagi",
        openMapFailed: "Tidak dapat membuka aplikasi peta sekarang. Sila cuba lagi.",
      }
    : {
        detectingLocation: "Detecting your location...",
        waitingForGps: "Waiting for GPS coordinates.",
        nearbyTitle: "Nearby Medical Facilities",
        nearbySubtitle: "Find your closest hospital or clinic in Malaysia",
        mapView: "Map View",
        listView: "List View",
        gettingLocation: "Getting your location",
        searchingFacilities: "Searching live nearby medical facilities",
        locationEnabled: "Location enabled - Showing nearby operational hospitals and clinics, including live map results within 30km",
        refresh: "Refresh",
        clickGetLocation: 'Click "Get Location" to find nearby medical facilities.',
        getLocation: "Get Location",
        currentPinnedLocation: "Current pinned location",
        locateMe: "Locate Me",
        refreshingLocation: "Refreshing your location",
        showingNearby: "Showing nearby operational hospitals and clinics within 30km. Switch to list view for details.",
        nearbyFacilities: "Nearby Medical Facilities",
        facilitiesFound: "Medical Facilities Found",
        lookingAroundPinned: "Looking for nearby clinics and hospitals around your pinned location",
        noFacilities: "No clinics or hospitals are currently listed within 30km of the pinned location. Tap <strong>Locate Me</strong> to refresh or check that the pinned location is correct.",
        directions: "Directions",
        phoneUnavailable: "Phone unavailable",
        unnamedNote: "This facility is unnamed. Please use <strong>Directions</strong> to navigate there directly.",
        viewOnMap: "View on Map",
        locationServices: "📍 Location Services",
        locationServicesText: "Enable location services for more accurate results and real-time distance calculations to nearby medical facilities.",
        onWeb: "On web:",
        onWebText: "Your browser will ask for location permission. Make sure to allow it for the best experience.",
        accuracyNoteLabel: "Accuracy note:",
        accuracyNoteText: "On laptops or desktop browsers, location can be approximate or wrong when using Ethernet, hotspot, or other network-only connections. Wi-Fi or a phone with GPS usually gives a more accurate pinned location.",
        noListedFound: "No listed clinics or hospitals were found within 30km of your pinned location.",
        fetchAdditionalFailed: "Unable to fetch additional nearby medical facilities. Showing registered results only.",
        facilityPhoneMissing: "This facility does not have a published phone number yet.",
        addressUnavailable: "Address unavailable",
        unnamedClinic: "Unnamed Clinic",
        locationAccessDeniedTitle: "Location access denied",
        locationAccessDeniedDetail: "Allow permission in your device settings, then tap Locate Me or Try again.",
        permissionDenied: "Location permission denied. Please allow location access for MyAfiyah in your device settings.",
        positionUnavailable: "Location information is unavailable. Please check your GPS settings.",
        locationTimeout: "Location request timed out. Please try again.",
        unableToGetLocation: "Unable to get your location. Please try again.",
        unableToDetectLocation: "Unable to detect your location",
        gpsOff: "Location services are turned off on your device. Please switch on GPS/location services and try again.",
        gpsSlow: "GPS took too long to respond. Please move to an open area and try again.",
        liveUpdatesUnavailable: "Location was found once, but live updates are temporarily unavailable.",
        tryAgain: "Try again",
        callFacility: "Call facility",
        seeMore: "See More",
        openMapFailed: "Unable to open the map app right now. Please try again.",
      };
  const isNativePlatform = Capacitor.isNativePlatform();
  const [viewMode, setViewMode] = useState<"map" | "list">(isNativePlatform ? "list" : "map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [sortedFacilities, setSortedFacilities] = useState<Hospital[]>([]);
  const [visibleCount, setVisibleCount] = useState(FACILITIES_PAGE_SIZE);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [externalSearchError, setExternalSearchError] = useState<string>("");
  const [locationLabel, setLocationLabel] = useState<DebugLocationLabel>({
    title: t.detectingLocation,
    detail: t.waitingForGps,
  });

  const [loadingDots, setLoadingDots] = useState(".");

  type FacilityWithDistance = Hospital & { calculatedDistance: number };

  const getOsmFacilityType = (amenity: string | undefined) => {
    if (amenity === "hospital") return "Hospital" as const;
    if (amenity === "clinic" || amenity === "doctors" || amenity === "healthcare") return "Clinic" as const;
    return "Clinic" as const;
  };

  const buildOsmAddress = (tags: Record<string, string>) => {
    const parts: string[] = [];
    if (tags["addr:street"]) parts.push(tags["addr:street"]);
    if (tags["addr:city"]) parts.push(tags["addr:city"]);
    if (tags["addr:postcode"]) parts.push(tags["addr:postcode"]);
    if (tags["addr:state"]) parts.push(tags["addr:state"]);
    return parts.length > 0 ? parts.join(", ") : tags["addr:full"] || t.addressUnavailable;
  };

  const fetchNearbyOsmFacilities = async (latitude: number, longitude: number) => {
    setExternalSearchError("");
    setIsSearchingExternal(true);

    try {
      const bounds = createBoundsFromCenter(latitude, longitude, SEARCH_RADIUS_KM);
      const facilities = await fetchHealthcareFacilitiesInBounds(
        bounds,
        { lat: latitude, lng: longitude },
        SEARCH_RADIUS_KM,
      );

      setSortedFacilities(facilities);
      setExternalSearchError(facilities.length === 0 ? t.noListedFound : "");
    } catch (error: any) {
      console.error("Error fetching external facilities:", error);
      updateNearbyFacilities(latitude, longitude);
      setExternalSearchError(t.fetchAdditionalFailed);
    } finally {
      setIsSearchingExternal(false);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const updateNearbyFacilities = (latitude: number, longitude: number) => {
    const hospitalsWithDistance: FacilityWithDistance[] = nearbyHospitals.map((hospital) => {
      const distance = calculateDistance(latitude, longitude, hospital.lat, hospital.lng);
      return {
        ...hospital,
        distance: `${distance.toFixed(1)} km`,
        calculatedDistance: distance,
      };
    });

    const rankedFacilities = hospitalsWithDistance
      .filter((hospital) => hospital.isOperational !== false)
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance);

    const nearbyHospitalsFiltered = rankedFacilities.filter((hospital) => hospital.calculatedDistance <= SEARCH_RADIUS_KM);
    setSortedFacilities(nearbyHospitalsFiltered);
  };

  const formatCoordinate = (value: number, positiveLabel: string, negativeLabel: string) => {
    const direction = value >= 0 ? positiveLabel : negativeLabel;
    return `${Math.abs(value).toFixed(5)}° ${direction}`;
  };

  const describeApproximateArea = (latitude: number, longitude: number) => {
    const nearest = nearbyHospitals
      .filter((hospital) => hospital.isOperational !== false)
      .map((hospital) => ({
        name: hospital.name,
        distance: calculateDistance(latitude, longitude, hospital.lat, hospital.lng),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    const coordinateText = `${formatCoordinate(latitude, "N", "S")}, ${formatCoordinate(longitude, "E", "W")}`;

    if (!nearest || nearest.distance > SEARCH_RADIUS_KM) {
      return {
        title: language === "ms" ? "Kedudukan GPS semasa" : "Current GPS position",
        detail: language === "ms"
          ? `${coordinateText} • sedang mencari klinik dan hospital dalam lingkungan 30km`
          : `${coordinateText} • looking for clinics and hospitals within 30km`,
      };
    }

    return {
      title: language === "ms" ? `Berhampiran ${nearest.name}` : `Near ${nearest.name}`,
      detail: language === "ms"
        ? `${coordinateText} • kira-kira ${nearest.distance.toFixed(1)} km dari fasiliti tersenarai terdekat`
        : `${coordinateText} • about ${nearest.distance.toFixed(1)} km from the nearest listed facility`,
    };
  };

  const applyResolvedLocation = (latitude: number, longitude: number) => {
    setUserLocation({ lat: latitude, lng: longitude });
    setLocationLabel(describeApproximateArea(latitude, longitude));
    setLocationError("");
    updateNearbyFacilities(latitude, longitude);
  };

  const getNativePosition = async () => {
    try {
      return await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      });
    } catch (highAccuracyError) {
      console.warn("High accuracy location lookup failed, retrying with balanced accuracy.", highAccuracyError);
      return Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 25000,
        maximumAge: 600000,
      });
    }
  };

  const requestLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError("");

    try {
      if (isNativePlatform) {
        const permissionStatus = await Geolocation.checkPermissions();

        if (!hasNativeLocationPermission(permissionStatus)) {
          const requestResult = await Geolocation.requestPermissions();
          if (!hasNativeLocationPermission(requestResult)) {
            setLocationLabel({
              title: t.locationAccessDeniedTitle,
              detail: t.locationAccessDeniedDetail,
            });
            setLocationError(t.permissionDenied);
            return;
          }
        }

        const position = await getNativePosition();
        applyResolvedLocation(position.coords.latitude, position.coords.longitude);
      } else {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser"));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 0,
            },
          );
        });

        applyResolvedLocation(position.coords.latitude, position.coords.longitude);
      }
    } catch (error: any) {
      console.error('Error getting location:', error);
      let errorMessage = t.unableToGetLocation;

      if (isNativePlatform) {
        const rawMessage = String(error?.message ?? "").toLowerCase();
        if (rawMessage.includes("location services are not enabled") || rawMessage.includes("location disabled")) {
          errorMessage = t.gpsOff;
        } else if (rawMessage.includes("timeout")) {
          errorMessage = t.gpsSlow;
        } else {
          errorMessage = error?.message || errorMessage;
        }
      } else {
        switch (error?.code) {
          case error?.PERMISSION_DENIED:
            errorMessage = t.permissionDenied;
            break;
          case error?.POSITION_UNAVAILABLE:
            errorMessage = t.positionUnavailable;
            break;
          case error?.TIMEOUT:
            errorMessage = t.locationTimeout;
            break;
          default:
            errorMessage = error?.message || errorMessage;
            break;
        }
      }

      setLocationLabel({
        title: t.unableToDetectLocation,
        detail: errorMessage,
      });
      setLocationError(errorMessage);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    if (!userLocation) return;

    void fetchNearbyOsmFacilities(userLocation.lat, userLocation.lng);
  }, [userLocation]);

  useEffect(() => {
    if (!isLoadingLocation && !isSearchingExternal) {
      setLoadingDots(".");
      return;
    }

    const intervalId = window.setInterval(() => {
      setLoadingDots((prev) => (prev.length >= 3 ? "." : `${prev}.`));
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [isLoadingLocation, isSearchingExternal]);

  useEffect(() => {
    setVisibleCount(FACILITIES_PAGE_SIZE);
  }, [sortedFacilities]);

  useEffect(() => {
    if (userLocation) {
      setLocationLabel(describeApproximateArea(userLocation.lat, userLocation.lng));
      return;
    }

    if (!locationError) {
      setLocationLabel({
        title: t.detectingLocation,
        detail: t.waitingForGps,
      });
    }
  }, [language, userLocation, locationError]);

  useEffect(() => {
    if (!isNativePlatform) {
      void requestLocation();
    }
  }, [isNativePlatform]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !userLocation) {
        void requestLocation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userLocation]);

  const openExternalMap = async (url: string) => {
    try {
      setLocationError("");

      if (isNativePlatform) {
        await Browser.open({ url });
        return;
      }

      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (!newWindow) {
        window.location.assign(url);
      }
    } catch (error) {
      console.error("Error opening map link:", error);

      if (!isNativePlatform) {
        window.location.assign(url);
        return;
      }

      setLocationError(t.openMapFailed);
    }
  };

  const handleNavigate = (hospital: Hospital) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`;
    void openExternalMap(mapsUrl);
  };

  const handleViewOnMap = (hospital: Hospital) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`;
    void openExternalMap(mapsUrl);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Emergency":
        return "bg-red-100 text-red-700 border-red-200";
      case "Hospital":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Clinic":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const isUnnamedFacility = (name: string) => /^unnamed\b/i.test(name.trim());
  const visibleFacilities = sortedFacilities.slice(0, visibleCount);

  const handleRefreshLocation = () => {
    void requestLocation();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-600 text-white px-6 pt-12 pb-6 sticky top-0 z-10">
        <button
          onClick={() => navigate("/app")}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.nearbyTitle}</h1>
            <p className="text-sm text-orange-100">{t.nearbySubtitle}</p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("map")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              viewMode === "map"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Map className="w-4 h-4" />
            {t.mapView}
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              viewMode === "list"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <List className="w-4 h-4" />
            {t.listView}
          </button>
        </div>

        {/* Location Status */}
        <div className="mt-3">
          {isLoadingLocation && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-4 py-2.5 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin" />
              {`${t.gettingLocation}${loadingDots}`}
            </div>
          )}
          {locationError && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 px-4 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{locationError}</p>
                <button 
                  onClick={handleRefreshLocation}
                  className="text-red-800 underline font-medium mt-1"
                >
                  {t.tryAgain}
                </button>
              </div>
            </div>
          )}
          {isSearchingExternal && (
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin" />
              {`${t.searchingFacilities}${loadingDots}`}
            </div>
          )}
          {externalSearchError && (
            <div className="flex items-start gap-2 text-sm text-orange-700 bg-orange-50 px-4 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p>{externalSearchError}</p>
              </div>
            </div>
          )}
          {userLocation && !isLoadingLocation && !locationError && (
            <div className="flex items-center justify-between text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-xl">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t.locationEnabled}
              </div>
              <button 
                onClick={handleRefreshLocation}
                disabled={isLoadingLocation}
                className="text-green-800 underline font-medium hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.refresh}
              </button>
            </div>
          )}
          {!userLocation && !isLoadingLocation && !locationError && (
            <div className="flex flex-col gap-2 text-sm text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t.clickGetLocation}
              </div>
              <button
                onClick={handleRefreshLocation}
                className="self-start text-blue-700 underline font-medium hover:text-blue-900"
              >
                {isNativePlatform ? t.locateMe : t.getLocation}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map View */}
      {viewMode === "map" && (
        <div className="px-6 py-6">
          <div className="mb-3 bg-white border border-blue-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold mb-1">{t.currentPinnedLocation}</p>
                <p className="text-sm font-semibold text-gray-900">{locationLabel.title}</p>
                <p className="text-xs text-gray-600 mt-1 break-words">{locationLabel.detail}</p>
              </div>
              <button
                type="button"
                onClick={handleRefreshLocation}
                disabled={isLoadingLocation}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-3 py-2 text-sm font-semibold disabled:opacity-60"
              >
                <LocateFixed className="w-4 h-4" />
                {t.locateMe}
              </button>
            </div>
          </div>

          <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-md h-96 relative">
            {userLocation || sortedFacilities.length > 0 ? (
              <MapView userLocation={userLocation} hospitals={sortedFacilities} />
            ) : (
              <div className="h-full w-full bg-slate-100 text-slate-600 flex items-center justify-center px-6 text-center text-sm">
                {t.clickGetLocation}
              </div>
            )}
            {isLoadingLocation ? (
              <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px] flex items-center justify-center z-[500]">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 text-sm font-medium text-gray-700">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  {`${t.refreshingLocation}${loadingDots}`}
                </div>
              </div>
            ) : null}
          </div>
          {sortedFacilities.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {t.showingNearby}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hospitals List */}
      <div className="px-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {viewMode === "map" ? `${sortedFacilities.length} ${t.nearbyFacilities}` : `${sortedFacilities.length} ${t.facilitiesFound}`}
          </h2>
          <MapPin className="w-5 h-5 text-orange-600" />
        </div>
        
        {isLoadingLocation && sortedFacilities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-blue-100 p-5 text-sm text-gray-700 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            {`${t.lookingAroundPinned}${loadingDots}`}
          </div>
        ) : sortedFacilities.length === 0 ? (
          isSearchingExternal ? (
            <div className="bg-white rounded-2xl border border-blue-100 p-5 text-sm text-gray-700 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              {`${t.lookingAroundPinned}${loadingDots}`}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-5 text-sm text-gray-600 space-y-3">
              <p dangerouslySetInnerHTML={{ __html: t.noFacilities }} />
              <div>
                <button
                  type="button"
                  onClick={handleRefreshLocation}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-blue-700"
                >
                  <LocateFixed className="w-4 h-4" />
                  {t.locateMe}
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {isSearchingExternal ? (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                {`${t.searchingFacilities}${loadingDots}`}
              </div>
            ) : null}
            {visibleFacilities.map((hospital) => {
              const canCall = hasDialablePhone(hospital.phone);

              return (
                <div
                  key={hospital.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {hospital.name}
                      </h3>
                      <div className="flex gap-2 mb-2">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(hospital.type)}`}>
                          {hospital.type}
                        </span>
                        {hospital.available24h && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            <Clock className="w-3 h-3 inline mr-1" />
                            24/7
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-orange-50 px-3 py-1.5 rounded-full">
                        <p className="text-sm font-bold text-orange-700">{hospital.distance}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">{hospital.address}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className={`text-sm font-medium ${canCall ? "text-blue-600" : "text-gray-500"}`}>
                      {canCall ? hospital.phone : t.phoneUnavailable}
                    </span>
                  </div>

                  <div>
                    <button
                      onClick={() => handleNavigate(hospital)}
                      className="w-full bg-orange-600 text-white py-3 rounded-xl font-medium hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      {t.directions}
                    </button>
                  </div>

                  {isUnnamedFacility(hospital.name) ? (
                    <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
                      <span dangerouslySetInnerHTML={{ __html: t.unnamedNote }} />
                    </div>
                  ) : (
                    <div className="mt-2">
                      <button
                        onClick={() => handleViewOnMap(hospital)}
                        className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t.viewOnMap}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
            })}
            {visibleCount < sortedFacilities.length ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + FACILITIES_PAGE_SIZE, sortedFacilities.length))}
                  className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100"
                >
                  {t.seeMore}
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
          <div>
            <h3 className="font-bold text-blue-900 mb-2">{t.locationServices}</h3>
            <p className="text-sm text-blue-800 leading-relaxed mb-2">
              {t.locationServicesText}
            </p>
            {!Capacitor.isNativePlatform() && (
              <p className="text-sm text-blue-700 leading-relaxed">
                <strong>{t.onWeb}</strong> {t.onWebText}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>{t.accuracyNoteLabel}</strong> {t.accuracyNoteText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}