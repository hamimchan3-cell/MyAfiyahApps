import { useMemo } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useContentReports, type ReportStatus } from "../hooks/useContentReports";

const statusStyle: Record<ReportStatus, string> = {
  open: "bg-amber-100 text-amber-800 border-amber-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export function AdminModeration() {
  const navigate = useNavigate();
  const { reports, loading, updateStatus } = useContentReports();

  const totals = useMemo(() => {
    return {
      open: reports.filter((report) => report.status === "open").length,
      resolved: reports.filter((report) => report.status === "resolved").length,
      rejected: reports.filter((report) => report.status === "rejected").length,
    };
  }, [reports]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-800 text-white px-6 pt-12 pb-6 sticky top-0 z-10">
        <button
          onClick={() => navigate("/app")}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Admin Moderation</h1>
        <p className="text-sm text-slate-200">Review reports submitted by users</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-white border border-amber-100 rounded-xl p-2">
            <p className="text-xs text-amber-700">Open</p>
            <p className="font-bold text-amber-900">{totals.open}</p>
          </div>
          <div className="bg-white border border-green-100 rounded-xl p-2">
            <p className="text-xs text-green-700">Resolved</p>
            <p className="font-bold text-green-900">{totals.resolved}</p>
          </div>
          <div className="bg-white border border-red-100 rounded-xl p-2">
            <p className="text-xs text-red-700">Rejected</p>
            <p className="font-bold text-red-900">{totals.rejected}</p>
          </div>
        </div>

        {loading ? <p className="text-sm text-gray-500">Loading reports...</p> : null}

        {!loading && reports.length === 0 ? (
          <p className="text-sm text-gray-500">No reports submitted yet.</p>
        ) : null}

        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-900 uppercase">
                  {report.content_type} - {report.content_id}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full border ${statusStyle[report.status]}`}>
                  {report.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-3">{report.reason}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(report.id, "resolved")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white"
                >
                  Resolve
                </button>
                <button
                  onClick={() => updateStatus(report.id, "rejected")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white"
                >
                  Reject
                </button>
                <button
                  onClick={() => updateStatus(report.id, "open")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white"
                >
                  Reopen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
