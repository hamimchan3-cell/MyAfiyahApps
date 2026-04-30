import { useNavigate } from "react-router";
import { ArrowLeft, Bandage, Droplet, Square, Hand, Scissors, Thermometer, HeartPulse } from "lucide-react";
import { firstAidTools, getLocalizedFirstAidTool } from "../data/firstAidTools";
import { useUserProgress } from "../hooks/useUserProgress";
import { useAppLanguage } from "../lib/language";

const iconMap: Record<string, any> = {
  bandage: Bandage,
  droplet: Droplet,
  square: Square,
  hand: Hand,
  scissors: Scissors,
  thermometer: Thermometer,
  "heart-pulse": HeartPulse,
};

export function FirstAidTools() {
  const navigate = useNavigate();
  const { isCompleted, completedCounts } = useUserProgress();
  const [language] = useAppLanguage();
  const t = language === "ms"
    ? {
        title: "Alatan Pertolongan Cemas",
        subtitle: "Pelajari alatan perubatan penting",
        completed: "Selesai",
        completedWalkthrough: "Panduan selesai",
        toolsLabel: "alatan",
        keepSuppliesReady: "💡 Pastikan Bekalan Sentiasa Sedia",
        keepSuppliesReadyText: "Sentiasa simpan kit pertolongan cemas yang lengkap di rumah, dalam kereta, dan di tempat kerja. Periksa secara berkala dan gantikan item yang sudah tamat tempoh.",
      }
    : {
        title: "First Aid Tools",
        subtitle: "Learn about essential medical tools",
        completed: "Completed",
        completedWalkthrough: "Completed walkthrough",
        toolsLabel: "tools",
        keepSuppliesReady: "💡 Keep Supplies Ready",
        keepSuppliesReadyText: "Always keep a well-stocked first aid kit at home, in your car, and at work. Check regularly and replace expired items.",
      };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 pt-12 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate("/app")}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-sm text-blue-100">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Tools List */}
      <div className="p-6 space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p className="text-sm text-blue-900 font-semibold">
            {t.completed} {completedCounts.tool}/{firstAidTools.length} {t.toolsLabel}
          </p>
        </div>
        {firstAidTools.map((rawTool) => {
          const tool = getLocalizedFirstAidTool(rawTool, language);
          const Icon = iconMap[tool.icon];
          const completed = isCompleted("tool", tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => navigate(`/app/first-aid-tools/${tool.id}`)}
              className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg active:scale-95 transition-all text-left shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">
                    {tool.name}
                  </h3>
                  {completed ? (
                    <p className="text-xs text-green-700 font-semibold mb-1">{t.completedWalkthrough}</p>
                  ) : null}
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 transform rotate-180 flex-shrink-0 mt-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="px-6 pb-8">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <h3 className="font-bold text-green-900 mb-2">{t.keepSuppliesReady}</h3>
          <p className="text-sm text-green-800 leading-relaxed">
            {t.keepSuppliesReadyText}
          </p>
        </div>
      </div>
    </div>
  );
}