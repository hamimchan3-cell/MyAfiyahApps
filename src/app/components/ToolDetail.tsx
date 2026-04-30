import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Bandage, Droplet, Square, Hand, Scissors, Thermometer, HeartPulse, Info, Clock, Video } from "lucide-react";
import { firstAidTools, getLocalizedFirstAidTool } from "../data/firstAidTools";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useUserProgress } from "../hooks/useUserProgress";
import { useContentReports } from "../hooks/useContentReports";
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

export function ToolDetail() {
  const navigate = useNavigate();
  const { toolId } = useParams();
  const { isCompleted, setCompleted } = useUserProgress();
  const { addReport } = useContentReports();
  const [language] = useAppLanguage();
  const t = language === "ms"
    ? {
        notFound: "Alatan tidak ditemui",
        goBack: "Kembali",
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
        whatIsIt: "Apakah ini?",
        whenToUse: "Bila Digunakan",
        howToUse: "Cara Guna",
        completed: "Panduan selesai",
        markCompleted: "Tandakan panduan sebagai selesai",
        reportIssue: "Laporkan isu kandungan",
        reportPlaceholder: "Contoh: Arahan ini tidak jelas atau tidak selamat",
        submitReport: "Hantar Laporan",
      }
    : {
        notFound: "Tool not found",
        goBack: "Go back",
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
        whatIsIt: "What is it?",
        whenToUse: "When to Use",
        howToUse: "How to Use",
        completed: "Completed walkthrough",
        markCompleted: "Mark walkthrough as completed",
        reportIssue: "Report content issue",
        reportPlaceholder: "Example: This instruction is unclear or unsafe",
        submitReport: "Submit Report",
      };
  const [statusMessage, setStatusMessage] = useState("");
  const [reportReason, setReportReason] = useState("");
  
  const matchedTool = firstAidTools.find((toolItem) => toolItem.id === toolId);
  const tool = matchedTool ? getLocalizedFirstAidTool(matchedTool, language) : undefined;

  if (!tool) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t.notFound}</p>
          <button
            onClick={() => navigate("/app/first-aid-tools")}
            className="text-blue-600 hover:underline"
          >
            {t.goBack}
          </button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[tool.icon];
  const usageSteps = tool.usageSteps?.length ? tool.usageSteps : [tool.usage];
  const completed = isCompleted("tool", tool.id);

  const handleToggleCompleted = async () => {
    try {
      await setCompleted("tool", tool.id, !completed);
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
        content_type: "tool",
        content_id: tool.id,
        reason: reportReason.trim(),
      });
      setReportReason("");
      setStatusMessage(t.reportSubmitted);
    } catch (error: any) {
      setStatusMessage(error.message ?? t.reportFailed);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 pt-12 pb-6 sticky top-0 z-10">
        <button
          onClick={() => navigate("/app/first-aid-tools")}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Tool Icon & Name */}
      <div className="px-6 -mt-6 mb-6">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-10 h-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="px-6 mb-6">
        <div className="h-72 rounded-2xl overflow-hidden shadow-md bg-white border border-gray-200 p-2">
          <ImageWithFallback
            src={tool.imageUrl}
            alt={tool.name}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Video Tutorial */}
      {tool.videoUrl ? (
        <div className="px-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            {t.videoTutorial}
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            <div className="relative aspect-video bg-black">
              <video
                src={tool.videoUrl}
                controls
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Step-by-step Instructions */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-900 text-lg">{t.steps}</h2>
          </div>
          <div className="space-y-3">
            {usageSteps.map((step, index) => (
              <div key={`${tool.id}-step-${index + 1}`} className="flex gap-3 rounded-xl bg-blue-50 px-3 py-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-blue-900 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-900 text-lg">{t.whatIsIt}</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{tool.description}</p>
        </div>
      </div>

      {/* When to Use */}
      <div className="px-6 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-green-900 text-lg">{t.whenToUse}</h2>
          </div>
          <p className="text-green-800 leading-relaxed">{tool.whenToUse}</p>
        </div>
      </div>

      {/* How to Use */}
      <div className="px-6 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-blue-900 text-lg">{t.howToUse}</h2>
          </div>
          <p className="text-blue-800 leading-relaxed">{tool.usage}</p>
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