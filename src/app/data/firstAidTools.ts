export interface FirstAidTool {
  id: string;
  name: string;
  icon: string;
  description: string;
  usage: string;
  usageSteps: string[];
  whenToUse: string;
  imageUrl: string;
  videoUrl?: string;
}

const assetUrl = (fileName: string) => new URL(`./VIDEOGAMBA_Tools/${fileName}`, import.meta.url).href;

type SupportedLanguage = "en" | "ms";
type LocalizedToolContent = Pick<FirstAidTool, "name" | "description" | "usage" | "usageSteps" | "whenToUse">;

const firstAidToolMalayCopy: Record<string, LocalizedToolContent> = {
  bandage: {
    name: "Pembalut Luka",
    description: "Pelekat atau pembalut yang digunakan untuk menutup dan melindungi luka.",
    usage: "Bersihkan luka terlebih dahulu, kemudian pasang pembalut dengan kemas tetapi tidak terlalu ketat. Tukar setiap hari atau apabila kotor.",
    usageSteps: [
      "Basuh tangan anda dan bersihkan luka dengan lembut.",
      "Keringkan kawasan sekeliling luka dengan kasa bersih.",
      "Letakkan pembalut pada kawasan luka dan kemaskan supaya tidak terlalu ketat.",
      "Gantikan pembalut jika ia basah, kotor, atau longgar.",
    ],
    whenToUse: "Gunakan untuk luka kecil, calar, dan kecederaan ringan supaya kawasan kekal bersih dan terlindung daripada jangkitan.",
  },
  antiseptic: {
    name: "Antiseptik",
    description: "Cecair yang membunuh atau menghalang pertumbuhan bakteria pada kulit dan luka.",
    usage: "Sapukan pada kapas atau kasa yang bersih, kemudian tekap perlahan pada luka. Biarkan kering sebelum ditutup.",
    usageSteps: [
      "Bilas dahulu kotoran yang kelihatan pada luka.",
      "Tuang sedikit antiseptik pada kasa atau kapas yang bersih.",
      "Tekap perlahan pada luka tanpa menggosok terlalu kuat.",
      "Biarkan kering sebelum memasang balutan atau pembalut.",
    ],
    whenToUse: "Gunakan sebelum membalut sebarang luka untuk membantu mencegah jangkitan, terutamanya untuk luka terbuka dan calar.",
  },
  gauze: {
    name: "Pad Kasa",
    description: "Pad steril yang menyerap cecair untuk membersihkan dan menutup luka.",
    usage: "Gunakan kasa baharu daripada bungkusan yang masih tertutup. Letakkan pada luka dan kemaskan dengan pita atau pembalut.",
    usageSteps: [
      "Buka pad kasa steril yang baharu daripada bungkusannya.",
      "Letakkan terus pada luka atau kawasan yang berdarah.",
      "Tekan perlahan untuk menyerap darah atau melindungi luka.",
      "Kemaskan dengan pita atau pembalut supaya ia kekal di tempatnya.",
    ],
    whenToUse: "Gunakan untuk luka yang lebih besar, menyerap darah, atau sebagai lapisan pelindung di bawah pembalut.",
  },
  gloves: {
    name: "Sarung Tangan Perubatan",
    description: "Sarung tangan pakai buang untuk mencegah pencemaran silang.",
    usage: "Pakai sarung tangan yang bersih sebelum merawat sebarang luka. Buang selepas sekali guna.",
    usageSteps: [
      "Periksa sarung tangan supaya tiada koyakan sebelum digunakan.",
      "Pakai sebelum menyentuh darah atau luka terbuka.",
      "Rawat kecederaan sambil memastikan sarung tangan kekal bersih.",
      "Tanggalkan dan buang sarung tangan dengan selamat selepas sekali guna.",
    ],
    whenToUse: "Sentiasa gunakan apabila merawat luka terbuka atau pendarahan untuk melindungi anda dan pesakit.",
  },
  scissors: {
    name: "Gunting Perubatan",
    description: "Gunting khas untuk memotong pembalut, pita, dan pakaian.",
    usage: "Pastikan bersih dan disanitasi. Gunakan dengan berhati-hati untuk memotong pembalut mengikut saiz atau menanggalkan pakaian dari kawasan cedera.",
    usageSteps: [
      "Bersihkan gunting sebelum digunakan jika boleh.",
      "Selitkan hujung tumpul dengan berhati-hati di bawah pita, pembalut, atau pakaian.",
      "Potong menjauhi kulit untuk mengelakkan kecederaan tambahan.",
      "Lap dan simpan semula gunting selepas digunakan.",
    ],
    whenToUse: "Gunakan untuk memotong pita, pembalut, atau pakaian di sekitar kecederaan tanpa menyebabkan kecederaan tambahan.",
  },
  thermometer: {
    name: "Termometer",
    description: "Alat untuk mengukur suhu badan dengan tepat.",
    usage: "Letakkan di bawah lidah, di ketiak, atau gunakan jenis telinga atau dahi mengikut arahan peranti. Bersihkan selepas digunakan.",
    usageSteps: [
      "Hidupkan termometer dan pastikan ia bersih.",
      "Letakkan di bawah lidah, ketiak, telinga, atau dahi mengikut jenis alat.",
      "Tunggu sehingga bacaan selesai atau bunyi bip kedengaran.",
      "Catat suhu dan bersihkan alat sebelum disimpan.",
    ],
    whenToUse: "Gunakan untuk memeriksa demam apabila seseorang berasa tidak sihat, terutama jika disertai simptom lain seperti menggigil atau lemah badan.",
  },
  "first-aid-kit": {
    name: "Kit Pertolongan Cemas",
    description: "Kit lengkap yang mengandungi bekalan pertolongan cemas yang penting.",
    usage: "Simpan di tempat yang mudah dicapai. Periksa secara berkala dan gantikan item yang telah digunakan atau tamat tempoh.",
    usageSteps: [
      "Simpan kit di tempat yang mudah dicapai di rumah, dalam kereta, atau di tempat kerja.",
      "Buka kit dan pilih item yang sesuai mengikut kecederaan yang dirawat.",
      "Gunakan bekalan satu per satu sambil memastikan semuanya kekal bersih.",
      "Isi semula kit selepas digunakan dan buang item yang tamat tempoh secara berkala.",
    ],
    whenToUse: "Penting untuk rumah, kereta, dan tempat kerja. Ia sepatutnya mengandungi semua bekalan asas pertolongan cemas.",
  },
};
export const getLocalizedFirstAidTool = (tool: FirstAidTool, language: SupportedLanguage): FirstAidTool => {
  if (language !== "ms") {
    return tool;
  }

  const translatedContent = firstAidToolMalayCopy[tool.id];
  return translatedContent ? { ...tool, ...translatedContent } : tool;
};

export const firstAidTools: FirstAidTool[] = [
  {
    id: "bandage",
    name: "Bandage",
    icon: "bandage",
    imageUrl: assetUrl("Bandage.png"),
    videoUrl: assetUrl("Bandage.mp4"),
    description: "An adhesive strip or wrap used to cover and protect wounds.",
    usage: "Clean the wound first, then apply the bandage firmly but not too tight. Change daily or when dirty.",
    usageSteps: [
      "Wash your hands and clean the wound gently.",
      "Dry the skin around the wound with clean gauze.",
      "Place the bandage over the area and secure it snugly, not too tight.",
      "Replace the bandage if it becomes wet, dirty, or loose.",
    ],
    whenToUse: "Use for minor cuts, scrapes, and wounds to protect from infection and keep the area clean.",
  },
  {
    id: "antiseptic",
    name: "Antiseptic",
    icon: "droplet",
    imageUrl: assetUrl("Antiseptic.png"),
    videoUrl: assetUrl("Antiseptic.mp4"),
    description: "A solution that kills or prevents the growth of bacteria on skin and wounds.",
    usage: "Apply to clean cotton or gauze, then gently dab on the wound. Let it air dry before covering.",
    usageSteps: [
      "Rinse away visible dirt from the wound first.",
      "Pour a small amount of antiseptic onto gauze or cotton.",
      "Dab the wound gently without rubbing too hard.",
      "Allow it to dry before adding a dressing or bandage.",
    ],
    whenToUse: "Use before dressing any wound to prevent infection. Essential for all open cuts and scrapes.",
  },
  {
    id: "gauze",
    name: "Gauze Pad",
    icon: "square",
    imageUrl: assetUrl("Gauze Pads.png"),
    videoUrl: assetUrl("GauzePad.mp4"),
    description: "Sterile absorbent pads used to clean and cover wounds.",
    usage: "Use fresh gauze from sealed packaging. Apply to wound and secure with tape or bandage.",
    usageSteps: [
      "Open a fresh sterile gauze pad from its packaging.",
      "Place it directly over the wound or bleeding area.",
      "Press gently to absorb blood or protect the wound.",
      "Secure it with tape or a bandage so it stays in place.",
    ],
    whenToUse: "Use for larger wounds, to absorb blood, or as padding under bandages.",
  },
  {
    id: "gloves",
    name: "Medical Gloves",
    icon: "hand",
    imageUrl: assetUrl("Madical Glove.png"),
    description: "Disposable protective gloves to prevent contamination.",
    usage: "Put on clean gloves before treating any wound. Dispose after single use.",
    usageSteps: [
      "Check the gloves for tears before using them.",
      "Put them on before touching any blood or open wound.",
      "Treat the injury while keeping the gloves clean.",
      "Remove and dispose of the gloves safely after one use.",
    ],
    whenToUse: "Always use when treating open wounds or bleeding to protect both you and the patient.",
  },
  {
    id: "scissors",
    name: "Medical Scissors",
    icon: "scissors",
    imageUrl: assetUrl("Medical Scsissor.png"),
    description: "Specialized scissors for cutting bandages, tape, and clothing.",
    usage: "Keep clean and sterilized. Use carefully to cut bandages to size or remove clothing from injury site.",
    usageSteps: [
      "Clean the scissors before use if possible.",
      "Guide the blunt tip under tape, bandage, or clothing carefully.",
      "Cut away from the skin to avoid causing another injury.",
      "Wipe and store the scissors after use.",
    ],
    whenToUse: "Use to cut tape, bandages, or clothing away from an injury without causing further harm.",
  },
  {
    id: "thermometer",
    name: "Thermometer",
    icon: "thermometer",
    imageUrl: assetUrl("Thermometer.png"),
    videoUrl: assetUrl("Thermometer.mp4"),
    description: "Device to measure body temperature accurately.",
    usage: "Place under tongue, in armpit, or use ear/forehead type. Follow device instructions. Clean after use.",
    usageSteps: [
      "Turn on the thermometer and make sure it is clean.",
      "Place it correctly under the tongue, armpit, ear, or forehead.",
      "Wait until the reading is complete or you hear the beep.",
      "Record the temperature and clean the device before storing it.",
    ],
    whenToUse: "Check for fever when someone feels unwell, especially with other symptoms like chills or weakness.",
  },
  {
    id: "first-aid-kit",
    name: "First Aid Kit",
    icon: "heart-pulse",
    description: "Complete kit containing essential first aid supplies.",
    usage: "Keep in accessible location. Check regularly and replace used or expired items.",
    usageSteps: [
      "Store the kit somewhere easy to reach at home, in the car, or at work.",
      "Open it and choose the correct item for the injury you are treating.",
      "Use supplies one by one while keeping everything as clean as possible.",
      "Restock the kit after use and remove expired items regularly.",
    ],
    imageUrl: assetUrl("First Aid.png"),
    videoUrl: assetUrl("Fist Aid Kid.mp4"),
    whenToUse: "Essential for home, car, and workplace. Should contain all basic first aid supplies.",
  },
];