import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Bandage, Flame, Bone, Droplets, HeartPulse, UserX, AlertTriangle, CheckCircle, Video } from "lucide-react";
import { treatmentGuides, getLocalizedTreatmentGuide } from "../data/treatmentGuides";
import { useUserProgress } from "../hooks/useUserProgress";
import { useContentReports } from "../hooks/useContentReports";
import { useAppLanguage } from "../lib/language";

const iconMap: Record<string, any> = {
  bandage: Bandage,
  flame: Flame,
  bone: Bone,
  droplets: Droplets,
  "heart-pulse": HeartPulse,
  "user-x": UserX,
};

const severityConfig = {
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

export function TreatmentDetail() {
  const navigate = useNavigate();
  const { guideId } = useParams();
  const { isCompleted, setCompleted } = useUserProgress();
  const { addReport } = useContentReports();
  const [language] = useAppLanguage();
  const t = language === "ms"
    ? {
        guideNotFound: "Panduan tidak ditemui",
        goBack: "Kembali",
        minor: "Kecederaan Ringan",
        moderate: "Sederhana",
        serious: "Serius",
        markedDone: "Ditandakan sebagai selesai.",
        markedUndone: "Tanda selesai dibuang.",
        saveFailed: "Tidak dapat menyimpan kemajuan.",
        reportPrompt: "Sila tulis sebab ringkas sebelum menghantar laporan.",
        reportSubmitted: "Laporan dihantar. Admin akan menyemaknya.",
        reportFailed: "Tidak dapat menghantar laporan.",
        videoTutorial: "Tutorial Video",
        videoSoon: "Tutorial video akan tersedia di sini",
        comingSoon: "Akan datang",
        steps: "Arahan Langkah demi Langkah",
        stepsHint: "Ikuti langkah-langkah ini terus di bawah video semasa memberi pertolongan cemas.",
        warnings: "Amaran Penting",
        whenInDoubt: "⚠️ Jika Ragu-ragu",
        whenInDoubtText: "Jika anda tidak pasti tentang tahap serius atau rawatan, sentiasa dapatkan bantuan perubatan profesional dengan segera.",
        emergencyHelp: "Dapatkan Bantuan Kecemasan",
        completed: "Panduan selesai",
        markCompleted: "Tandakan panduan sebagai selesai",
        reportIssue: "Laporkan isu kandungan",
        reportPlaceholder: "Contoh: Langkah ini tidak tepat atau perlu penjelasan",
        submitReport: "Hantar Laporan",
      }
    : {
        guideNotFound: "Guide not found",
        goBack: "Go back",
        minor: "Minor Injury",
        moderate: "Moderate",
        serious: "Serious",
        markedDone: "Marked as completed.",
        markedUndone: "Marked as not completed.",
        saveFailed: "Unable to save progress.",
        reportPrompt: "Please write a short reason before submitting report.",
        reportSubmitted: "Report submitted. Admin will review it.",
        reportFailed: "Unable to submit report.",
        videoTutorial: "Video Tutorial",
        videoSoon: "Video tutorial will be available here",
        comingSoon: "Coming soon",
        steps: "Step-by-step Instructions",
        stepsHint: "Follow these steps directly beneath the video while giving first aid.",
        warnings: "Important Warnings",
        whenInDoubt: "⚠️ When in Doubt",
        whenInDoubtText: "If you're unsure about the severity or treatment, always seek professional medical help immediately.",
        emergencyHelp: "Get Emergency Help",
        completed: "Completed walkthrough",
        markCompleted: "Mark walkthrough as completed",
        reportIssue: "Report content issue",
        reportPlaceholder: "Example: A step is inaccurate or needs clarification",
        submitReport: "Submit Report",
      };
  const [statusMessage, setStatusMessage] = useState("");
  const [reportReason, setReportReason] = useState("");
  
  const matchedGuide = treatmentGuides.find((guideItem) => guideItem.id === guideId);
  const guide = matchedGuide ? getLocalizedTreatmentGuide(matchedGuide, language) : undefined;

  if (!guide) {
    return (
      <div className="min-h-screen bg-pink-100 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t.guideNotFound}</p>
          <button
            onClick={() => navigate("/app/treatment-guides")}
            className="text-blue-600 hover:underline"
          >
            {t.goBack}
          </button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[guide.icon];
  const severityInfo = {
    ...severityConfig[guide.severity],
    badge:
      guide.severity === "minor"
        ? t.minor
        : guide.severity === "moderate"
          ? t.moderate
          : t.serious,
  };
  const completed = isCompleted("guide", guide.id);

  const handleToggleCompleted = async () => {
    try {
      await setCompleted("guide", guide.id, !completed);
      setStatusMessage(!completed ? t.markedDone : t.markedUndone);
    } catch (error: any) {
      setStatusMessage(error.message ?? t.saveFailed);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      setStatusMessage(t.reportPrompt);
      return;
    }

    try {
      await addReport({
        content_type: "guide",
        content_id: guide.id,
        reason: reportReason.trim(),
      });
      setReportReason("");
      setStatusMessage(t.reportSubmitted);
    } catch (error: any) {
      setStatusMessage(error.message ?? t.reportFailed);
    }
  };

  return (
    <div className="min-h-screen bg-pink-100">
      {/* Header */}
      <div className="bg-green-600 text-white px-6 pt-12 pb-6 sticky top-0 z-10">
        <button
          onClick={() => navigate("/app/treatment-guides")}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Title Card */}
      <div className="px-6 -mt-6 mb-6">
        <div className={`${guide.color} rounded-3xl shadow-lg p-6 border-2 border-white`}>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon className="w-8 h-8 text-gray-700" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{guide.name}</h1>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${severityInfo.badgeColor}`}>
                {severityInfo.badge}
              </span>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">{guide.shortDescription}</p>
        </div>
      </div>


      {/* Video Tutorial */}
      <div className="px-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          {t.videoTutorial}
        </h2>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          {guide.videoUrl ? (
            <div className="relative aspect-video bg-black">
              <video
                src={guide.videoUrl}
                controls
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-blue-50 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-md">
                <Video className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-700 font-medium px-6">
                {t.videoSoon}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {t.comingSoon}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step-by-step Instructions */}
      <div className="px-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          {t.steps}
        </h2>
        <p className="text-sm text-gray-600 mb-4">{t.stepsHint}</p>
        <div className="space-y-4">
          {guide.steps.map((step) => (
            <div key={step.step} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      <div className="px-6 pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          {t.warnings}
        </h2>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
          <div className="space-y-3">
            {guide.warnings.map((warning, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <p className="text-red-900 leading-relaxed font-medium">
                  {warning}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-6 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl p-5 shadow-lg">
          <h3 className="font-bold mb-2 text-lg">{t.whenInDoubt}</h3>
          <p className="text-red-50 leading-relaxed mb-4">
            {t.whenInDoubtText}
          </p>
          <button
            onClick={() => navigate("/app/emergency")}
            className="w-full bg-white text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 active:scale-95 transition-all"
          >
            {t.emergencyHelp}
          </button>
        </div>

        <button
          onClick={handleToggleCompleted}
          className={`mt-4 w-full py-3 rounded-xl font-semibold transition ${
            completed
              ? "bg-green-600 text-white"
              : "bg-white border border-green-600 text-green-700"
          }`}
        >
          {completed ? t.completed : t.markCompleted}
        </button>

        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-3">
          <p className="text-sm font-semibold text-gray-900 mb-2">{t.reportIssue}</p>
          <textarea
            value={reportReason}
            onChange={(event) => setReportReason(event.target.value)}
            placeholder={t.reportPlaceholder}
            className="w-full min-h-20 border border-gray-300 rounded-lg p-2 text-sm"
          />
          <button
            onClick={handleReport}
            className="mt-2 w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-medium"
          >
            {t.submitReport}
          </button>
        </div>
        {statusMessage ? <p className="text-xs text-gray-600 mt-2">{statusMessage}</p> : null}
      </div>
    </div>
  );
}