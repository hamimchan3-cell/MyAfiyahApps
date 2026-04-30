export interface TreatmentStep {
  step: number;
  title: string;
  description: string;
}

export interface TreatmentGuide {
  id: string;
  name: string;
  icon: string;
  color: string;
  severity: "minor" | "moderate" | "serious";
  shortDescription: string;
  videoUrl?: string;
  steps: TreatmentStep[];
  warnings: string[];
}

const videoAssetUrl = (fileName: string) => new URL(`./VIDEO_SJE/${fileName}`, import.meta.url).href;

const cutsVideoUrl = videoAssetUrl("CutsNWounds.mp4");
const burnsVideoUrl = videoAssetUrl("Burnz.mp4");
const sprainsVideoUrl = videoAssetUrl("Sprains.mp4");
const nosebleedsVideoUrl = videoAssetUrl("Nose Bleeds.mp4");
const minorBleedingVideoUrl = videoAssetUrl("Minor Bleeding.mp4");
const faintingVideoUrl = videoAssetUrl("Fainting.mp4");

type SupportedLanguage = "en" | "ms";
type LocalizedGuideContent = Pick<TreatmentGuide, "name" | "shortDescription" | "steps" | "warnings">;

const treatmentGuideMalayCopy: Record<string, LocalizedGuideContent> = {
  cuts: {
    name: "Luka dan Calar",
    shortDescription: "Cara merawat luka kecil dan calar dengan betul",
    steps: [
      {
        step: 1,
        title: "Hentikan Pendarahan",
        description: "Tekan terus dengan kain bersih atau kasa. Tinggikan kawasan yang cedera melebihi paras jantung jika boleh.",
      },
      {
        step: 2,
        title: "Bersihkan Luka",
        description: "Bilas dengan air bersih selama 5 minit. Buang kotoran atau bendasing yang kelihatan dengan perlahan.",
      },
      {
        step: 3,
        title: "Sapukan Antiseptik",
        description: "Gunakan larutan antiseptik untuk membasmi kuman pada luka. Tepuk kering dengan kasa bersih.",
      },
      {
        step: 4,
        title: "Tutup Luka",
        description: "Letakkan kasa steril dan kemaskan dengan pembalut. Tukar balutan setiap hari.",
      },
    ],
    warnings: [
      "Dapatkan bantuan perubatan jika pendarahan tidak berhenti selepas 10 minit",
      "Perhatikan tanda jangkitan seperti kemerahan, bengkak, nanah, atau demam",
      "Luka yang dalam mungkin memerlukan jahitan - jumpa doktor",
    ],
  },
  burns: {
    name: "Melecur",
    shortDescription: "Rawatan untuk lecur haba yang ringan",
    steps: [
      {
        step: 1,
        title: "Sejukkan Bahagian Melecur",
        description: "Lalukan di bawah air mengalir yang sejuk selama 10 hingga 20 minit. Jangan guna ais secara terus.",
      },
      {
        step: 2,
        title: "Tanggalkan Barang Kemas",
        description: "Tanggalkan cincin, jam, atau barang ketat berhampiran kawasan melecur sebelum bengkak bermula.",
      },
      {
        step: 3,
        title: "Tutup Secara Longgar",
        description: "Tutup dengan balutan steril yang tidak melekat. Jangan sapu krim atau salap tanpa nasihat perubatan.",
      },
      {
        step: 4,
        title: "Pantau Keadaan",
        description: "Perhatikan tanda jangkitan. Pastikan kawasan itu bersih dan kering.",
      },
    ],
    warnings: [
      "Dapatkan bantuan segera untuk lecur yang lebih besar daripada 3 inci",
      "Pergi ke hospital untuk lecur pada muka, tangan, kaki, atau kemaluan",
      "Jangan pecahkan lepuh kerana ia melindungi daripada jangkitan",
      "Lecur tahap tiga dengan kulit putih atau hangus memerlukan rawatan kecemasan",
    ],
  },
  sprains: {
    name: "Terseliuh",
    shortDescription: "Penjagaan untuk sendi dan ligamen yang terseliuh",
    steps: [
      {
        step: 1,
        title: "Rehatkan Bahagian Cedera",
        description: "Hentikan aktiviti dengan segera. Elakkan meletakkan berat pada kawasan yang cedera.",
      },
      {
        step: 2,
        title: "Letakkan Ais",
        description: "Gunakan pek ais selama 15 hingga 20 minit setiap 2 hingga 3 jam. Gunakan alas kain dan jangan letak ais terus pada kulit.",
      },
      {
        step: 3,
        title: "Mampatan",
        description: "Balut dengan pembalut elastik, ketat tetapi tidak terlalu ketat. Periksa jika ada kebas atau sakit bertambah.",
      },
      {
        step: 4,
        title: "Tinggikan Bahagian Cedera",
        description: "Letakkan kawasan yang cedera lebih tinggi daripada paras jantung untuk mengurangkan bengkak.",
      },
    ],
    warnings: [
      "Jumpa doktor jika anda tidak boleh menampung berat pada sendi tersebut",
      "Dapatkan bantuan jika berlaku sakit teruk, kecacatan bentuk, atau kebas",
      "Jika tiada perubahan selepas 48 jam, dapatkan pemeriksaan perubatan",
    ],
  },
  nosebleeds: {
    name: "Hidung Berdarah",
    shortDescription: "Cara menghentikan hidung berdarah dengan selamat",
    steps: [
      {
        step: 1,
        title: "Duduk Tegak",
        description: "Duduk tegak dan tunduk sedikit ke hadapan. Jangan dongakkan kepala ke belakang.",
      },
      {
        step: 2,
        title: "Picit Hidung",
        description: "Picit bahagian lembut hidung dengan kuat selama 10 minit. Bernafas melalui mulut.",
      },
      {
        step: 3,
        title: "Letakkan Kompres Sejuk",
        description: "Letakkan kompres sejuk pada batang hidung dan pipi untuk mengecutkan salur darah.",
      },
      {
        step: 4,
        title: "Periksa dan Rehat",
        description: "Selepas 10 minit, lepaskan tekanan secara perlahan. Jika masih berdarah, ulang lagi selama 10 minit.",
      },
    ],
    warnings: [
      "Dapatkan bantuan jika pendarahan berterusan lebih daripada 20 minit",
      "Dapatkan rawatan jika hidung berdarah berlaku selepas kecederaan kepala",
      "Hidung berdarah yang kerap mungkin memerlukan pemeriksaan perubatan",
    ],
  },
  bleeding: {
    name: "Pendarahan Ringan",
    shortDescription: "Langkah untuk mengawal pendarahan ringan",
    steps: [
      {
        step: 1,
        title: "Tekan Luka",
        description: "Gunakan kain bersih atau kasa. Tekan dengan kuat pada luka selama 5 hingga 10 minit.",
      },
      {
        step: 2,
        title: "Tinggikan Jika Boleh",
        description: "Naikkan bahagian yang cedera melebihi paras jantung untuk melambatkan aliran darah.",
      },
      {
        step: 3,
        title: "Bersihkan Selepas Berhenti",
        description: "Apabila pendarahan berhenti, bersihkan luka dengan air dan antiseptik secara lembut.",
      },
      {
        step: 4,
        title: "Balut Luka",
        description: "Letakkan balutan bersih dan kemaskan dengan pembalut. Tukar setiap hari.",
      },
    ],
    warnings: [
      "Jika darah menembusi balutan, tambah lebih banyak kasa dan jangan buang lapisan pertama",
      "Pendarahan yang banyak memerlukan rawatan perubatan segera",
      "Pendarahan arteri dengan darah merah terang yang memancut ialah kecemasan perubatan",
    ],
  },
  fainting: {
    name: "Pengsan",
    shortDescription: "Cara membantu seseorang yang pengsan",
    steps: [
      {
        step: 1,
        title: "Pastikan Keselamatan",
        description: "Bantu individu berbaring rata. Pusingkan muka ke sisi sekiranya muntah.",
      },
      {
        step: 2,
        title: "Tinggikan Kaki",
        description: "Naikkan kaki kira-kira 12 inci untuk membantu aliran darah ke otak.",
      },
      {
        step: 3,
        title: "Longgarkan Pakaian",
        description: "Longgarkan tali pinggang, kolar, atau pakaian yang ketat. Pastikan aliran udara baik.",
      },
      {
        step: 4,
        title: "Pantau Pemulihan",
        description: "Individu sepatutnya sedar semula dalam 1 hingga 2 minit. Jika tidak, hubungi perkhidmatan kecemasan segera.",
      },
    ],
    warnings: [
      "Hubungi perkhidmatan kecemasan jika individu tidak sedar selepas 1 hingga 2 minit",
      "Dapatkan bantuan jika individu cedera akibat terjatuh",
      "Pengsan berulang memerlukan pemeriksaan perubatan",
      "Jangan beri makanan atau air sehingga individu sedar sepenuhnya",
    ],
  },
};

export const getLocalizedTreatmentGuide = (guide: TreatmentGuide, language: SupportedLanguage): TreatmentGuide => {
  if (language !== "ms") {
    return guide;
  }

  const translatedContent = treatmentGuideMalayCopy[guide.id];
  return translatedContent ? { ...guide, ...translatedContent } : guide;
};

export const treatmentGuides: TreatmentGuide[] = [
  {
    id: "cuts",
    name: "Cuts & Wounds",
    icon: "bandage",
    color: "bg-red-50",
    severity: "minor",
    shortDescription: "How to treat minor cuts and wounds properly",
    videoUrl: cutsVideoUrl,
    steps: [
      {
        step: 1,
        title: "Stop the Bleeding",
        description: "Apply direct pressure with a clean cloth or gauze. Elevate the injured area above the heart if possible.",
      },
      {
        step: 2,
        title: "Clean the Wound",
        description: "Rinse with clean water for 5 minutes. Remove any visible dirt or debris gently.",
      },
      {
        step: 3,
        title: "Apply Antiseptic",
        description: "Use antiseptic solution to disinfect the wound. Pat dry with clean gauze.",
      },
      {
        step: 4,
        title: "Cover the Wound",
        description: "Apply sterile gauze and secure with bandage. Change dressing daily.",
      },
    ],
    warnings: [
      "Seek medical help if bleeding doesn't stop after 10 minutes",
      "Watch for signs of infection: redness, swelling, pus, or fever",
      "Deep cuts may need stitches - visit a doctor",
    ],
  },
  {
    id: "burns",
    name: "Burns",
    icon: "flame",
    color: "bg-orange-50",
    severity: "moderate",
    shortDescription: "Treatment for minor thermal burns",
    videoUrl: burnsVideoUrl,
    steps: [
      {
        step: 1,
        title: "Cool the Burn",
        description: "Hold under cool (not cold) running water for 10-20 minutes. Never use ice directly.",
      },
      {
        step: 2,
        title: "Remove Jewelry",
        description: "Remove rings, watches, or tight items near the burn before swelling starts.",
      },
      {
        step: 3,
        title: "Cover Loosely",
        description: "Cover with sterile, non-stick dressing. Don't apply creams or ointments without medical advice.",
      },
      {
        step: 4,
        title: "Monitor Condition",
        description: "Watch for signs of infection. Keep the area clean and dry.",
      },
    ],
    warnings: [
      "Seek immediate help for burns larger than 3 inches",
      "Go to hospital for burns on face, hands, feet, or genitals",
      "Never pop blisters - they protect from infection",
      "Third-degree burns (white or charred skin) need emergency care",
    ],
  },
  {
    id: "sprains",
    name: "Sprains",
    icon: "bone",
    color: "bg-blue-50",
    severity: "moderate",
    shortDescription: "Care for sprained joints and ligaments",
    videoUrl: sprainsVideoUrl,
    steps: [
      {
        step: 1,
        title: "Rest the Injury",
        description: "Stop activity immediately. Avoid putting weight on the injured area.",
      },
      {
        step: 2,
        title: "Ice Application",
        description: "Apply ice pack for 15-20 minutes every 2-3 hours. Use cloth barrier, never apply ice directly.",
      },
      {
        step: 3,
        title: "Compression",
        description: "Wrap with elastic bandage, firm but not too tight. Check for numbness or increased pain.",
      },
      {
        step: 4,
        title: "Elevation",
        description: "Keep injured area elevated above heart level to reduce swelling.",
      },
    ],
    warnings: [
      "See a doctor if unable to bear weight on the joint",
      "Seek help if severe pain, deformity, or numbness occurs",
      "If no improvement in 48 hours, get medical evaluation",
    ],
  },
  {
    id: "nosebleeds",
    name: "Nosebleeds",
    icon: "droplets",
    color: "bg-pink-50",
    severity: "minor",
    shortDescription: "How to stop a nosebleed safely",
    videoUrl: nosebleedsVideoUrl,
    steps: [
      {
        step: 1,
        title: "Sit Upright",
        description: "Sit up straight and lean slightly forward. Don't tilt your head back.",
      },
      {
        step: 2,
        title: "Pinch the Nose",
        description: "Pinch the soft part of nose firmly for 10 minutes. Breathe through your mouth.",
      },
      {
        step: 3,
        title: "Apply Cold Compress",
        description: "Place cold compress on bridge of nose and cheeks to constrict blood vessels.",
      },
      {
        step: 4,
        title: "Check and Rest",
        description: "After 10 minutes, release pressure gently. If still bleeding, repeat for another 10 minutes.",
      },
    ],
    warnings: [
      "Seek help if bleeding continues for more than 20 minutes",
      "Get medical care if nosebleed follows a head injury",
      "Frequent nosebleeds may need medical evaluation",
    ],
  },
  {
    id: "bleeding",
    name: "Minor Bleeding",
    icon: "heart-pulse",
    color: "bg-red-50",
    severity: "minor",
    shortDescription: "Steps to control minor bleeding",
    videoUrl: minorBleedingVideoUrl,
    steps: [
      {
        step: 1,
        title: "Apply Pressure",
        description: "Use clean cloth or gauze. Press firmly on the wound for 5-10 minutes.",
      },
      {
        step: 2,
        title: "Elevate if Possible",
        description: "Raise the injured area above the heart to slow blood flow.",
      },
      {
        step: 3,
        title: "Clean When Stopped",
        description: "Once bleeding stops, clean wound gently with water and antiseptic.",
      },
      {
        step: 4,
        title: "Dress the Wound",
        description: "Apply clean dressing and secure with bandage. Change daily.",
      },
    ],
    warnings: [
      "If blood soaks through, add more gauze - don't remove the first layer",
      "Heavy bleeding needs immediate medical attention",
      "Arterial bleeding (bright red, spurting) is a medical emergency",
    ],
  },
  {
    id: "fainting",
    name: "Fainting",
    icon: "user-x",
    color: "bg-purple-50",
    severity: "serious",
    shortDescription: "How to help someone who has fainted",
    videoUrl: faintingVideoUrl,
    steps: [
      {
        step: 1,
        title: "Ensure Safety",
        description: "Help person lie down flat. Turn face to the side in case of vomiting.",
      },
      {
        step: 2,
        title: "Elevate Legs",
        description: "Raise legs about 12 inches to help blood flow to the brain.",
      },
      {
        step: 3,
        title: "Loosen Clothing",
        description: "Loosen belts, collars, or tight clothing. Ensure good air flow.",
      },
      {
        step: 4,
        title: "Monitor Recovery",
        description: "Person should recover in 1-2 minutes. If not, call emergency services immediately.",
      },
    ],
    warnings: [
      "Call emergency services if person doesn't wake in 1-2 minutes",
      "Seek help if person is injured from the fall",
      "Repeated fainting needs medical evaluation",
      "Don't give food or water until fully conscious",
    ],
  },
];
