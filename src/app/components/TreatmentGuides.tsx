import { useNavigate } from "react-router";
import { ArrowLeft, Bandage, Flame, Bone, Droplets, HeartPulse, UserX, AlertTriangle } from "lucide-react";
import { treatmentGuides, getLocalizedTreatmentGuide } from "../data/treatmentGuides";
import { useUserProgress } from "../hooks/useUserProgress";
import { useAppLanguage } from "../lib/language";

const iconMap: Record<string, any> = {
  bandage: Bandage,
  flame: Flame,
  bone: Bone,
  droplets: Droplets,
  "heart-pulse": HeartPulse,
  "user-x": UserX,
};

export function TreatmentGuides() {
  const navigate = useNavigate();
  const { isCompleted, completedCounts } = useUserProgress();
  const [language] = useAppLanguage();
  const t = language === "ms"
    ? {
        title: "Panduan Rawatan",
        subtitle: "Arahan pertolongan cemas langkah demi langkah",
        notice: "Notis Penting",
        noticeText: "Panduan ini adalah untuk kecederaan ringan sahaja. Sentiasa dapatkan bantuan perubatan profesional untuk keadaan yang serius.",
        completed: "Selesai",
        completedWalkthrough: "Panduan selesai",
        guidesLabel: "panduan",
        steps: "langkah",
        warnings: "amaran",
      }
    : {
        title: "Treatment Guides",
        subtitle: "Step-by-step first aid instructions",
        notice: "Important Notice",
        noticeText: "These guides are for minor injuries only. Always seek professional medical help for serious conditions.",
        completed: "Completed",
        completedWalkthrough: "Completed walkthrough",
        guidesLabel: "guides",
        steps: "steps",
        warnings: "warnings",
      };

  const severityConfig = language === "ms"
    ? {
        minor: {
          badge: "Kecederaan Ringan",
          badgeColor: "bg-green-100 text-green-700 border-green-200",
        },
        moderate: {
          badge: "Sederhana",
          badgeColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
        },
        serious: {
          badge: "Serius",
          badgeColor: "bg-red-100 text-red-700 border-red-200",
        },
      }
    : {
        minor: {
          badge: "Minor Injury",
          badgeColor: "bg-green-100 text-green-700 border-green-200",
        },
        moderate: {
          badge: "Moderate",
          badgeColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
        },
        serious: {
          badge: "Serious",
          badgeColor: "bg-red-100 text-red-700 border-red-200",
        },
      };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white px-6 pt-12 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate("/app")}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-sm text-green-100">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="mx-6 mt-6 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-900 font-medium mb-1">{t.notice}</p>
            <p className="text-xs text-amber-800 leading-relaxed">
              {t.noticeText}
            </p>
          </div>
        </div>
      </div>

      {/* Guides List */}
      <div className="px-6 space-y-4 pb-8">
        <div className="bg-green-50 border border-green-100 rounded-xl p-3">
          <p className="text-sm text-green-900 font-semibold">
            {t.completed} {completedCounts.guide}/{treatmentGuides.length} {t.guidesLabel}
          </p>
        </div>
        {treatmentGuides.map((rawGuide) => {
          const guide = getLocalizedTreatmentGuide(rawGuide, language);
          const Icon = iconMap[guide.icon];
          const severityInfo = severityConfig[guide.severity];
          const completed = isCompleted("guide", guide.id);
          
          return (
            <button
              key={guide.id}
              onClick={() => navigate(`/app/treatment-guides/${guide.id}`)}
              className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg active:scale-95 transition-all text-left shadow-sm"
            >
              <div className={`${guide.color} p-5`}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="w-7 h-7 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {guide.name}
                      </h3>
                    </div>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${severityInfo.badgeColor} mb-2`}>
                      {severityInfo.badge}
                    </span>
                    {completed ? (
                      <p className="text-xs text-green-700 font-semibold mb-2">{t.completedWalkthrough}</p>
                    ) : null}
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {guide.shortDescription}
                    </p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 transform rotate-180 flex-shrink-0 mt-1" />
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  {guide.steps.length} {t.steps} • {guide.warnings.length} {t.warnings}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
