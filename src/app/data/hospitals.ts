export interface Hospital {
  id: string;
  name: string;
  address: string;
  distance: string;
  type: "Emergency" | "Clinic" | "Hospital";
  phone: string;
  available24h: boolean;
  lat: number;
  lng: number;
  isOperational: boolean;
}

export type MapBoundingBox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

const OSM_API_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
];

const buildOsmAddress = (tags: Record<string, string>) => {
  const parts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"], tags["addr:postcode"], tags["addr:state"]]
    .filter(Boolean)
    .join(", ");

  return parts || tags["addr:full"] || "Address unavailable";
};

const getFacilityType = (tags: Record<string, string>): Hospital["type"] => {
  if (tags["emergency"] === "yes") {
    return "Emergency";
  }

  const category = `${tags["amenity"] ?? ""} ${tags["healthcare"] ?? ""}`.toLowerCase();
  return category.includes("hospital") ? "Hospital" : "Clinic";
};

const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const createBoundsFromCenter = (latitude: number, longitude: number, radiusKm = 30): MapBoundingBox => {
  const latOffset = radiusKm / 111;
  const lngOffset = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180) || 1);

  return {
    south: latitude - latOffset,
    west: longitude - lngOffset,
    north: latitude + latOffset,
    east: longitude + lngOffset,
  };
};

export async function fetchHealthcareFacilitiesInBounds(
  bounds: MapBoundingBox,
  origin: { lat: number; lng: number },
  radiusKm = 30,
): Promise<Hospital[]> {
  const query = `
    [out:json][timeout:12];
    (
      node["amenity"~"hospital|clinic"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      way["amenity"~"hospital|clinic"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      relation["amenity"~"hospital|clinic"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      node["healthcare"~"hospital|clinic"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      way["healthcare"~"hospital|clinic"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      relation["healthcare"~"hospital|clinic"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
    );
    out center tags;
  `;

  let data: any = null;
  let lastError: unknown = null;

  for (const endpoint of OSM_API_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
        body: query,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Overpass request failed with status ${response.status}`);
      }

      data = await response.json();
      break;
    } catch (error) {
      console.warn(`Overpass lookup failed on ${endpoint}`, error);
      lastError = error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (!data?.elements) {
    throw lastError ?? new Error("Unable to fetch nearby healthcare facilities.");
  }

  const seen = new Set<string>();

  const facilities = data.elements
    .map((element: any) => {
      const lat = element.type === "node" ? element.lat : element.center?.lat;
      const lng = element.type === "node" ? element.lon : element.center?.lon;

      if (typeof lat !== "number" || typeof lng !== "number") {
        return null;
      }

      const tags = element.tags ?? {};
      const name = tags["name"] || tags["name:en"] || "Unnamed facility";
      const address = buildOsmAddress(tags);
      const phone = tags["phone"] || tags["contact:phone"] || "Unknown";
      const available24h = tags["opening_hours"] === "24/7" || /24\/?7/.test(tags["opening_hours"] ?? "");
      const distanceKm = calculateDistanceKm(origin.lat, origin.lng, lat, lng);
      const type = getFacilityType(tags);
      const id = `osm-${element.type}-${element.id}`;
      const dedupeKey = `${name}-${lat}-${lng}`;

      if (distanceKm > radiusKm || seen.has(dedupeKey)) {
        return null;
      }

      seen.add(dedupeKey);

      return {
        id,
        name,
        address,
        distance: `${distanceKm.toFixed(1)} km`,
        type,
        phone,
        available24h,
        lat,
        lng,
        isOperational: true,
      } as Hospital;
    })
    .filter((facility: Hospital | null): facility is Hospital => facility !== null);

  return facilities.sort((a: Hospital, b: Hospital) => parseFloat(a.distance) - parseFloat(b.distance));
}

export const nearbyHospitals: Hospital[] = [
  // Kuala Lumpur
  {
    id: "1",
    name: "Hospital Kuala Lumpur",
    address: "Jalan Pahang, Kuala Lumpur",
    distance: "2.1 km",
    type: "Hospital",
    phone: "+603 2615 5555",
    available24h: true,
    lat: 3.1714,
    lng: 101.7026,
    isOperational: true,
  },
  {
    id: "2",
    name: "Gleneagles Kuala Lumpur",
    address: "282 & 286 Jalan Ampang, Kuala Lumpur",
    distance: "3.5 km",
    type: "Hospital",
    phone: "+603 4141 3000",
    available24h: true,
    lat: 3.1588,
    lng: 101.7123,
    isOperational: true,
  },
  {
    id: "3",
    name: "Sunway Medical Centre",
    address: "5 Jalan Lagoon Selatan, Kuala Lumpur",
    distance: "8.2 km",
    type: "Hospital",
    phone: "+603 7491 9191",
    available24h: true,
    lat: 3.0727,
    lng: 101.6067,
    isOperational: true,
  },
  {
    id: "4",
    name: "KPJ Ampang Puteri",
    address: "1 Jalan Mamanda 9, Ampang, Kuala Lumpur",
    distance: "5.7 km",
    type: "Hospital",
    phone: "+603 4270 2500",
    available24h: true,
    lat: 3.1492,
    lng: 101.7611,
    isOperational: true,
  },
  {
    id: "5",
    name: "Columbia Asia Cheras",
    address: "560 Cheras Jaya Selatan, Kuala Lumpur",
    distance: "12.3 km",
    type: "Hospital",
    phone: "+603 9075 2222",
    available24h: false,
    lat: 3.0924,
    lng: 101.7594,
    isOperational: false, // Example: temporarily closed for renovation
  },
  // Penang
  {
    id: "6",
    name: "Penang General Hospital",
    address: "Jalan Residensi, Georgetown, Penang",
    distance: "15.8 km",
    type: "Hospital",
    phone: "+604 222 5333",
    available24h: true,
    lat: 5.4141,
    lng: 100.3288,
    isOperational: true,
  },
  {
    id: "7",
    name: "Gleneagles Penang",
    address: "1 Jalan Pangkor, Georgetown, Penang",
    distance: "18.2 km",
    type: "Hospital",
    phone: "+604 222 9111",
    available24h: true,
    lat: 5.4171,
    lng: 100.3185,
    isOperational: true,
  },
  {
    id: "8",
    name: "Lam Wah Ee Hospital",
    address: "Jalan Tan Sri Teh Ewe Lim, Penang",
    distance: "16.5 km",
    type: "Hospital",
    phone: "+604 228 8811",
    available24h: true,
    lat: 5.4145,
    lng: 100.3292,
    isOperational: true,
  },
  // Johor Bahru
  {
    id: "9",
    name: "Sultanah Aminah Hospital",
    address: "Jalan Abu Bakar Sultan, Johor Bahru",
    distance: "25.4 km",
    type: "Hospital",
    phone: "+607 225 7000",
    available24h: true,
    lat: 1.4634,
    lng: 103.7644,
    isOperational: true,
  },
  {
    id: "10",
    name: "KPJ Johor Specialist Hospital",
    address: "39-B Jalan Abdul Samad, Johor Bahru",
    distance: "22.1 km",
    type: "Hospital",
    phone: "+607 278 3000",
    available24h: true,
    lat: 1.4775,
    lng: 103.7411,
    isOperational: true,
  },
  // Kuching, Sarawak
  {
    id: "11",
    name: "Normah Medical Specialist Centre",
    address: "Lot 937, Section 30 KTLD, Jalan Tun Abdul Rahman, Kuching",
    distance: "35.7 km",
    type: "Hospital",
    phone: "+6082 440 055",
    available24h: true,
    lat: 1.5535,
    lng: 110.3592,
    isOperational: true,
  },
  {
    id: "12",
    name: "Timberland Medical Centre",
    address: "Lot 177, Section 8, KTLD, Jalan Tun Abdul Rahman, Kuching",
    distance: "38.2 km",
    type: "Hospital",
    phone: "+6082 428 888",
    available24h: true,
    lat: 1.5523,
    lng: 110.3578,
    isOperational: true,
  },
  // Kota Kinabalu, Sabah
  {
    id: "13",
    name: "Queen Elizabeth Hospital",
    address: "Jalan Penampang, Kota Kinabalu",
    distance: "42.8 km",
    type: "Hospital",
    phone: "+6088 517 555",
    available24h: true,
    lat: 5.9478,
    lng: 116.0653,
    isOperational: true,
  },
  {
    id: "14",
    name: "KPJ Damai Specialist Hospital",
    address: "Lot 2, Lorong Damai Luyang 3, Kota Kinabalu",
    distance: "45.3 km",
    type: "Hospital",
    phone: "+6088 255 200",
    available24h: true,
    lat: 5.9764,
    lng: 116.0753,
    isOperational: true,
  },
  // Ipoh, Perak
  {
    id: "15",
    name: "Perak General Hospital",
    address: "Jalan Hospital, Ipoh",
    distance: "28.9 km",
    type: "Hospital",
    phone: "+605 208 5000",
    available24h: true,
    lat: 4.5975,
    lng: 101.0901,
    isOperational: true,
  },
  {
    id: "16",
    name: "Pantai Hospital Ipoh",
    address: "126 Jalan Tambun, Ipoh",
    distance: "31.2 km",
    type: "Hospital",
    phone: "+605 540 9000",
    available24h: true,
    lat: 4.6158,
    lng: 101.1183,
    isOperational: true,
  },
  // Melaka
  {
    id: "17",
    name: "Melaka General Hospital",
    address: "Jalan Mufti Haji Khalil, Melaka",
    distance: "19.6 km",
    type: "Hospital",
    phone: "+606 289 2000",
    available24h: true,
    lat: 2.2074,
    lng: 102.2501,
    isOperational: true,
  },
  // Clinics in Kuala Lumpur
  {
    id: "18",
    name: "Klinik Kesihatan Cheras",
    address: "Jalan Cheras, Kuala Lumpur",
    distance: "4.3 km",
    type: "Clinic",
    phone: "+603 9282 4000",
    available24h: false,
    lat: 3.0924,
    lng: 101.7594,
    isOperational: true,
  },
  {
    id: "19",
    name: "Columbia Asia Setapak",
    address: "No. 1, Jalan 1/96A, Taman Cheras Makmur, Kuala Lumpur",
    distance: "6.8 km",
    type: "Clinic",
    phone: "+603 9541 1111",
    available24h: false,
    lat: 3.1073,
    lng: 101.7267,
    isOperational: true,
  },
  {
    id: "20",
    name: "Emergency Clinic KL Sentral",
    address: "KL Sentral, Kuala Lumpur",
    distance: "1.9 km",
    type: "Emergency",
    phone: "+603 2273 3000",
    available24h: true,
    lat: 3.1334,
    lng: 101.6865,
    isOperational: true,
  },
  // More Private Clinics in Kuala Lumpur
  {
    id: "21",
    name: "Tung Shin Hospital",
    address: "102 Jalan Pudu, Kuala Lumpur",
    distance: "2.4 km",
    type: "Clinic",
    phone: "+603 2078 2333",
    available24h: true,
    lat: 3.1412,
    lng: 101.7077,
    isOperational: true,
  },
  {
    id: "22",
    name: "Prince Court Medical Centre",
    address: "39 Jalan Kia Peng, Kuala Lumpur",
    distance: "3.1 km",
    type: "Clinic",
    phone: "+603 2163 0000",
    available24h: true,
    lat: 3.1589,
    lng: 101.7101,
    isOperational: true,
  },
  {
    id: "23",
    name: "Beverly Wilshire Medical Centre",
    address: "22 Jalan 1/77A, Desa Pandan, Kuala Lumpur",
    distance: "7.2 km",
    type: "Clinic",
    phone: "+603 9059 8888",
    available24h: false,
    lat: 3.1324,
    lng: 101.7389,
    isOperational: true,
  },
  {
    id: "24",
    name: "Klinik Mediviron Bangsar",
    address: "No. 2, Jalan Telawi 3, Bangsar, Kuala Lumpur",
    distance: "4.7 km",
    type: "Clinic",
    phone: "+603 2282 2888",
    available24h: false,
    lat: 3.1298,
    lng: 101.6789,
    isOperational: true,
  },
  // Petaling Jaya/Selangor Clinics
  {
    id: "25",
    name: "Assunta Hospital",
    address: "Jalan Templer, Petaling Jaya",
    distance: "9.8 km",
    type: "Clinic",
    phone: "+603 7784 9393",
    available24h: true,
    lat: 3.1073,
    lng: 101.6413,
    isOperational: true,
  },
  {
    id: "26",
    name: "Subang Jaya Medical Centre",
    address: "No. 1, Jalan SS12/1A, Subang Jaya",
    distance: "14.5 km",
    type: "Clinic",
    phone: "+603 5639 1212",
    available24h: true,
    lat: 3.0819,
    lng: 101.5854,
    isOperational: true,
  },
  {
    id: "27",
    name: "Darul Ehsan Medical Centre",
    address: "Jalan Lapangan Terbang Subang, Shah Alam",
    distance: "18.2 km",
    type: "Clinic",
    phone: "+603 7846 8111",
    available24h: true,
    lat: 3.0714,
    lng: 101.5489,
    isOperational: true,
  },
  {
    id: "28",
    name: "Klinik Mediviron Damansara",
    address: "No. 2, Jalan PJU 1A/3, Ara Damansara, Petaling Jaya",
    distance: "11.3 km",
    type: "Clinic",
    phone: "+603 7841 2888",
    available24h: false,
    lat: 3.1258,
    lng: 101.6254,
    isOperational: true,
  },
  // Penang Clinics
  {
    id: "29",
    name: "Island Hospital Penang",
    address: "308 Jalan Macalister, Georgetown, Penang",
    distance: "17.1 km",
    type: "Clinic",
    phone: "+604 238 8888",
    available24h: true,
    lat: 5.4145,
    lng: 100.3292,
    isOperational: true,
  },
  {
    id: "30",
    name: "Mount Miriam Cancer Hospital",
    address: "No. 5, Jalan Bulan, Georgetown, Penang",
    distance: "16.8 km",
    type: "Clinic",
    phone: "+604 229 6262",
    available24h: false,
    lat: 5.4167,
    lng: 100.3312,
    isOperational: true,
  },
  {
    id: "31",
    name: "Klinik Mediviron Penang",
    address: "No. 1, Jalan Tan Sri Teh Ewe Lim, Georgetown, Penang",
    distance: "16.2 km",
    type: "Clinic",
    phone: "+604 228 2888",
    available24h: false,
    lat: 5.4148,
    lng: 100.3295,
    isOperational: true,
  },
  // Johor Bahru Clinics
  {
    id: "32",
    name: "Klinik Mediviron Johor Bahru",
    address: "No. 45, Jalan Wong Ah Fook, Johor Bahru",
    distance: "23.7 km",
    type: "Clinic",
    phone: "+607 223 2888",
    available24h: false,
    lat: 1.4598,
    lng: 103.7642,
    isOperational: true,
  },
  {
    id: "33",
    name: "Columbia Asia JB Medical Centre",
    address: "No. 8, Jalan Perdagangan 2, Johor Bahru",
    distance: "24.1 km",
    type: "Clinic",
    phone: "+607 333 1888",
    available24h: false,
    lat: 1.4765,
    lng: 103.7418,
    isOperational: true,
  },
  // Ipoh Clinics
  {
    id: "34",
    name: "Klinik Mediviron Ipoh",
    address: "No. 1, Jalan Raja Ekram, Ipoh",
    distance: "29.5 km",
    type: "Clinic",
    phone: "+605 254 2888",
    available24h: false,
    lat: 4.5975,
    lng: 101.0901,
    isOperational: true,
  },
  {
    id: "35",
    name: "Perdana Specialist Hospital",
    address: "No. 1, Jalan Meru Bestari, Ipoh",
    distance: "30.8 km",
    type: "Clinic",
    phone: "+605 528 0000",
    available24h: true,
    lat: 4.6123,
    lng: 101.1187,
    isOperational: true,
  },
  // Kuching Clinics
  {
    id: "36",
    name: "Klinik Mediviron Kuching",
    address: "No. 1, Jalan Song Thian Cheok, Kuching",
    distance: "36.4 km",
    type: "Clinic",
    phone: "+6082 240 2888",
    available24h: false,
    lat: 1.5535,
    lng: 110.3592,
    isOperational: true,
  },
  {
    id: "37",
    name: "Columbia Asia Kuching",
    address: "No. 1, Jalan Siol Kandis, Kuching",
    distance: "37.8 km",
    type: "Clinic",
    phone: "+6082 507 888",
    available24h: false,
    lat: 1.5523,
    lng: 110.3578,
    isOperational: true,
  },
  // Kota Kinabalu Clinics
  {
    id: "38",
    name: "Klinik Mediviron Kota Kinabalu",
    address: "No. 1, Jalan Lintas, Kota Kinabalu",
    distance: "43.2 km",
    type: "Clinic",
    phone: "+6088 232 2888",
    available24h: false,
    lat: 5.9478,
    lng: 116.0653,
    isOperational: true,
  },
  {
    id: "39",
    name: "Columbia Asia Kota Kinabalu",
    address: "No. 1, Jalan Kolam, Kota Kinabalu",
    distance: "44.6 km",
    type: "Clinic",
    phone: "+6088 518 888",
    available24h: false,
    lat: 5.9764,
    lng: 116.0753,
    isOperational: true,
  },
  // Melaka Clinics
  {
    id: "40",
    name: "Klinik Mediviron Melaka",
    address: "No. 1, Jalan Tun Abdul Razak, Melaka",
    distance: "20.3 km",
    type: "Clinic",
    phone: "+606 282 2888",
    available24h: false,
    lat: 2.2074,
    lng: 102.2501,
    isOperational: true,
  },
  {
    id: "41",
    name: "Putra Specialist Hospital",
    address: "No. 1, Jalan Putra, Melaka",
    distance: "21.7 km",
    type: "Clinic",
    phone: "+606 315 8888",
    available24h: true,
    lat: 2.1896,
    lng: 102.2501,
    isOperational: true,
  },
  // Additional Kuala Lumpur Hospitals & Clinics
  {
    id: "42",
    name: "University Malaya Medical Centre",
    address: "Jalan Universiti, Kuala Lumpur",
    distance: "8.9 km",
    type: "Hospital",
    phone: "+603 7949 4422",
    available24h: true,
    lat: 3.1208,
    lng: 101.6518,
    isOperational: true,
  },
  {
    id: "43",
    name: "National Heart Institute",
    address: "145 Jalan Tun Razak, Kuala Lumpur",
    distance: "6.4 km",
    type: "Hospital",
    phone: "+603 2617 8200",
    available24h: true,
    lat: 3.1713,
    lng: 101.6897,
    isOperational: true,
  },
  {
    id: "44",
    name: "Hospital Canselor Tuanku Muhriz",
    address: "Jalan Yaacob Latif, Cheras, Kuala Lumpur",
    distance: "11.2 km",
    type: "Hospital",
    phone: "+603 9145 5555",
    available24h: true,
    lat: 3.0827,
    lng: 101.7345,
    isOperational: true,
  },
  {
    id: "45",
    name: "Ara Damansara Medical Centre",
    address: "Lot 2, Jalan Lapangan Terbang Subang, Ara Damansara, Petaling Jaya",
    distance: "12.8 km",
    type: "Clinic",
    phone: "+603 7841 3000",
    available24h: true,
    lat: 3.1258,
    lng: 101.6254,
    isOperational: true,
  },
  {
    id: "46",
    name: "Klinik Mediviron Mont Kiara",
    address: "No. 1, Jalan Kiara 2, Mont Kiara, Kuala Lumpur",
    distance: "9.3 km",
    type: "Clinic",
    phone: "+603 6203 2888",
    available24h: false,
    lat: 3.1653,
    lng: 101.6521,
    isOperational: true,
  },
  {
    id: "47",
    name: "Klinik Mediviron TTDI",
    address: "No. 1, Jalan 1/50, Taman Tun Dr Ismail, Kuala Lumpur",
    distance: "7.6 km",
    type: "Clinic",
    phone: "+603 7728 2888",
    available24h: false,
    lat: 3.1432,
    lng: 101.6234,
    isOperational: true,
  },
  // Seremban, Negeri Sembilan
  {
    id: "48",
    name: "Tuanku Jaafar Hospital",
    address: "Jalan Rasah, Seremban",
    distance: "52.1 km",
    type: "Hospital",
    phone: "+606 768 2000",
    available24h: true,
    lat: 2.7123,
    lng: 101.9378,
    isOperational: true,
  },
  {
    id: "49",
    name: "Columbia Asia Seremban",
    address: "No. 1, Jalan Toman 1, Seremban 2, Seremban",
    distance: "53.4 km",
    type: "Clinic",
    phone: "+606 767 1888",
    available24h: false,
    lat: 2.6896,
    lng: 101.9178,
    isOperational: true,
  },
  // Kuantan, Pahang
  {
    id: "50",
    name: "Tengku Ampuan Afzan Hospital",
    address: "Jalan Tanah Putih, Kuantan",
    distance: "78.9 km",
    type: "Hospital",
    phone: "+609 513 3333",
    available24h: true,
    lat: 3.8147,
    lng: 103.3312,
    isOperational: true,
  },
  {
    id: "51",
    name: "Kuantan Medical Centre",
    address: "No. 2, Jalan Tun Ismail, Kuantan",
    distance: "76.5 km",
    type: "Clinic",
    phone: "+609 567 8888",
    available24h: true,
    lat: 3.8214,
    lng: 103.3234,
    isOperational: true,
  },
  // Kota Bharu, Kelantan
  {
    id: "52",
    name: "Raja Perempuan Zainab II Hospital",
    address: "Jalan Hospital, Kota Bharu",
    distance: "145.2 km",
    type: "Hospital",
    phone: "+609 745 2000",
    available24h: true,
    lat: 6.1245,
    lng: 102.2387,
    isOperational: true,
  },
  {
    id: "53",
    name: "KPJ Kota Bharu Specialist Hospital",
    address: "No. 1, Jalan Tun Abdul Razak, Kota Bharu",
    distance: "143.8 km",
    type: "Hospital",
    phone: "+609 745 8888",
    available24h: true,
    lat: 6.1189,
    lng: 102.2345,
    isOperational: true,
  },
  // Alor Setar, Kedah
  {
    id: "54",
    name: "Sultanah Bahiyah Hospital",
    address: "Km 6, Jalan Langgar, Alor Setar",
    distance: "98.7 km",
    type: "Hospital",
    phone: "+604 740 2000",
    available24h: true,
    lat: 6.1189,
    lng: 100.3678,
    isOperational: true,
  },
  {
    id: "55",
    name: "KPJ Alor Setar Specialist Hospital",
    address: "No. 1, Jalan Pegawai, Alor Setar",
    distance: "97.3 km",
    type: "Hospital",
    phone: "+604 730 8888",
    available24h: true,
    lat: 6.1234,
    lng: 100.3656,
    isOperational: true,
  },
  // Georgetown, Penang (Additional)
  {
    id: "56",
    name: "Penang Adventist Hospital",
    address: "465 Burmah Road, Georgetown, Penang",
    distance: "17.8 km",
    type: "Hospital",
    phone: "+604 222 7200",
    available24h: true,
    lat: 5.4189,
    lng: 100.3212,
    isOperational: true,
  },
  {
    id: "57",
    name: "Klinik Mediviron Jelutong",
    address: "No. 1, Jalan Jelutong 3, Georgetown, Penang",
    distance: "18.9 km",
    type: "Clinic",
    phone: "+604 281 2888",
    available24h: false,
    lat: 5.3967,
    lng: 100.3123,
    isOperational: true,
  },
  // Butterworth, Penang
  {
    id: "58",
    name: "Seberang Jaya Hospital",
    address: "Jalan Tun Hussein Onn, Butterworth, Penang",
    distance: "22.4 km",
    type: "Hospital",
    phone: "+604 576 2000",
    available24h: true,
    lat: 5.3876,
    lng: 100.3678,
    isOperational: true,
  },
  // Johor Bahru (Additional)
  {
    id: "59",
    name: "Hospital Permai",
    address: "No. 1, Jalan Permai, Johor Bahru",
    distance: "26.7 km",
    type: "Clinic",
    phone: "+607 333 8000",
    available24h: true,
    lat: 1.4896,
    lng: 103.7412,
    isOperational: true,
  },
  {
    id: "60",
    name: "Klinik Mediviron Skudai",
    address: "No. 1, Jalan Skudai, Johor Bahru",
    distance: "28.9 km",
    type: "Clinic",
    phone: "+607 521 2888",
    available24h: false,
    lat: 1.5321,
    lng: 103.6543,
    isOperational: true,
  },
  // Malacca (Additional)
  {
    id: "61",
    name: "Mahkota Medical Centre",
    address: "No. 3, Mahkota Melaka, Jalan Merdeka, Melaka",
    distance: "20.3 km",
    type: "Clinic",
    phone: "+606 315 1888",
    available24h: true,
    lat: 2.1896,
    lng: 102.2501,
    isOperational: true,
  },
  // Ipoh (Additional)
  {
    id: "62",
    name: "Klinik Mediviron Batu Gajah",
    address: "No. 1, Jalan Batu Gajah, Ipoh",
    distance: "32.1 km",
    type: "Clinic",
    phone: "+605 366 2888",
    available24h: false,
    lat: 4.4678,
    lng: 101.0345,
    isOperational: true,
  },
  // Kuala Terengganu, Terengganu
  {
    id: "63",
    name: "Sultanah Nur Zahirah Hospital",
    address: "Jalan Sultan Mahmud, Kuala Terengganu",
    distance: "123.4 km",
    type: "Hospital",
    phone: "+609 621 2000",
    available24h: true,
    lat: 5.3298,
    lng: 103.1234,
    isOperational: true,
  },
  // Kangar, Perlis
  {
    id: "64",
    name: "Hospital Tuanku Fauziah",
    address: "Jalan Tun Abdul Razak, Kangar",
    distance: "156.7 km",
    type: "Hospital",
    phone: "+604 976 2000",
    available24h: true,
    lat: 6.4412,
    lng: 100.1987,
    isOperational: true,
  },
  // More Kuala Lumpur Clinics
  {
    id: "65",
    name: "Klinik Mediviron Sri Hartamas",
    address: "No. 1, Jalan Sri Hartamas 1, Kuala Lumpur",
    distance: "5.2 km",
    type: "Clinic",
    phone: "+603 6201 2888",
    available24h: false,
    lat: 3.1623,
    lng: 101.6501,
    isOperational: true,
  },
  {
    id: "66",
    name: "Klinik Mediviron Puchong",
    address: "No. 1, Jalan Puchong, Puchong",
    distance: "16.8 km",
    type: "Clinic",
    phone: "+603 8060 2888",
    available24h: false,
    lat: 3.0321,
    lng: 101.6187,
    isOperational: true,
  },
  {
    id: "67",
    name: "Klinik Mediviron Kelana Jaya",
    address: "No. 1, Jalan SS6/1, Kelana Jaya, Petaling Jaya",
    distance: "13.4 km",
    type: "Clinic",
    phone: "+603 7880 2888",
    available24h: false,
    lat: 3.1123,
    lng: 101.5987,
    isOperational: true,
  },
  {
    id: "68",
    name: "Klinik Mediviron USJ",
    address: "No. 1, Jalan USJ 1, Subang Jaya",
    distance: "15.6 km",
    type: "Clinic",
    phone: "+603 8023 2888",
    available24h: false,
    lat: 3.0567,
    lng: 101.5876,
    isOperational: true,
  },
  // Cyberjaya Clinics
  {
    id: "69",
    name: "Klinik Mediviron Cyberjaya",
    address: "No. 1, Jalan Multimedia, Cyberjaya",
    distance: "18.9 km",
    type: "Clinic",
    phone: "+603 8318 2888",
    available24h: false,
    lat: 2.9213,
    lng: 101.6559,
    isOperational: true,
  },
  // Putrajaya Clinics
  {
    id: "70",
    name: "Putrajaya Hospital",
    address: "Jalan P9, Precinct 9, Putrajaya",
    distance: "14.2 km",
    type: "Hospital",
    phone: "+603 8312 4000",
    available24h: true,
    lat: 2.9354,
    lng: 101.6912,
    isOperational: true,
  },
  // Additional Emergency Clinics
  {
    id: "71",
    name: "Emergency Clinic Mid Valley",
    address: "Mid Valley City, Kuala Lumpur",
    distance: "3.8 km",
    type: "Emergency",
    phone: "+603 2938 3000",
    available24h: true,
    lat: 3.1178,
    lng: 101.6776,
    isOperational: true,
  },
  {
    id: "72",
    name: "Emergency Clinic Sunway Pyramid",
    address: "Sunway Pyramid, Petaling Jaya",
    distance: "10.1 km",
    type: "Emergency",
    phone: "+603 7492 3000",
    available24h: true,
    lat: 3.0727,
    lng: 101.6067,
    isOperational: true,
  },
  // More Government Clinics
  {
    id: "73",
    name: "Klinik Kesihatan Bandar Tun Razak",
    address: "Jalan Cheras, Kuala Lumpur",
    distance: "9.7 km",
    type: "Clinic",
    phone: "+603 9172 4000",
    available24h: false,
    lat: 3.0824,
    lng: 101.7594,
    isOperational: true,
  },
  {
    id: "74",
    name: "Klinik Kesihatan Jinjang",
    address: "Jalan Jinjang, Kuala Lumpur",
    distance: "8.3 km",
    type: "Clinic",
    phone: "+603 6258 4000",
    available24h: false,
    lat: 3.2098,
    lng: 101.6589,
    isOperational: true,
  },
  {
    id: "75",
    name: "Klinik Kesihatan Sentul",
    address: "Jalan Sentul, Kuala Lumpur",
    distance: "6.9 km",
    type: "Clinic",
    phone: "+603 4289 4000",
    available24h: false,
    lat: 3.1812,
    lng: 101.6912,
    isOperational: true,
  },
];
