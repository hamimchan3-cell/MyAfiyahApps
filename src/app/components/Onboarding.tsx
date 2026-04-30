import { useState } from "react";
import { useNavigate } from "react-router";
import { HeartPulse, Book, MapPin, Phone } from "lucide-react";
import { useAppLanguage } from "../lib/language";

export function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const [language] = useAppLanguage();

  const onboardingSlides = language === "ms"
    ? [
        {
          icon: HeartPulse,
          title: "Pelajari Asas Pertolongan Cemas",
          description: "Kuasai teknik pertolongan cemas penting dengan panduan yang mudah diikuti dan langkah demi langkah.",
          color: "bg-blue-500",
        },
        {
          icon: Book,
          title: "Panduan Rawatan Pantas",
          description: "Akses panduan rawatan segera untuk kecederaan biasa seperti luka, lecur, dan terseliuh.",
          color: "bg-green-500",
        },
        {
          icon: MapPin,
          title: "Cari Hospital Berdekatan",
          description: "Cari hospital dan klinik kecemasan terdekat dengan satu sentuhan apabila anda memerlukan rawatan segera.",
          color: "bg-red-500",
        },
        {
          icon: Phone,
          title: "Bantuan Kecemasan",
          description: "Akses pantas kepada perkhidmatan kecemasan dan tip pertolongan cemas penting semasa situasi tertekan.",
          color: "bg-orange-500",
        },
      ]
    : [
        {
          icon: HeartPulse,
          title: "Learn First Aid Basics",
          description: "Master essential first aid techniques with easy-to-follow guides and step-by-step instructions.",
          color: "bg-blue-500",
        },
        {
          icon: Book,
          title: "Quick Treatment Guides",
          description: "Access instant treatment guides for common injuries like cuts, burns, and sprains.",
          color: "bg-green-500",
        },
        {
          icon: MapPin,
          title: "Find Nearby Hospitals",
          description: "Locate the nearest hospitals and emergency clinics with one tap when you need urgent care.",
          color: "bg-red-500",
        },
        {
          icon: Phone,
          title: "Emergency Help",
          description: "Quick access to emergency services and critical first aid tips during stressful situations.",
          color: "bg-orange-500",
        },
      ];

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/login");
    }
  };

  const handleSkip = () => {
    navigate("/login");
  };

  const slide = onboardingSlides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Skip Button */}
      {currentSlide < onboardingSlides.length - 1 && (
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 px-4 py-2"
          >
            {language === "ms" ? "Langkau" : "Skip"}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className={`w-32 h-32 ${slide.color} rounded-full flex items-center justify-center shadow-lg mb-8`}>
          <Icon className="w-16 h-16 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4 max-w-md">
          {slide.title}
        </h2>

        <p className="text-lg text-gray-600 text-center max-w-md leading-relaxed">
          {slide.description}
        </p>
      </div>

      {/* Bottom Section */}
      <div className="p-8">
        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {onboardingSlides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-blue-600"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          {currentSlide < onboardingSlides.length - 1
            ? language === "ms" ? "Seterusnya" : "Next"
            : language === "ms" ? "Mula" : "Get Started"}
        </button>
      </div>
    </div>
  );
}
