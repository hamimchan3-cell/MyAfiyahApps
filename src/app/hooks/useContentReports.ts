import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/AuthProvider";

export type ReportStatus = "open" | "resolved" | "rejected";

export type ContentReport = {
  id: string;
  user_id: string;
  content_type: "tool" | "guide";
  content_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
};

export function useContentReports() {
  const { user, isAdmin } = useAuth();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setReports([]);
      return;
    }

    setLoading(true);

    const query = supabase
      .from("content_reports")
      .select("id, user_id, content_type, content_id, reason, status, created_at")
      .order("created_at", { ascending: false });

    const { data, error } = isAdmin ? await query : await query.eq("user_id", user.id);

    if (error) {
      console.error("Unable to load reports", error);
      setLoading(false);
      return;
    }

    setReports((data as ContentReport[]) ?? []);
    setLoading(false);
  }, [isAdmin, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addReport = useCallback(
    async (payload: { content_type: "tool" | "guide"; content_id: string; reason: string }) => {
      if (!user) return;

      const { data, error } = await supabase
        .from("content_reports")
        .insert({
          user_id: user.id,
          content_type: payload.content_type,
          content_id: payload.content_id,
          reason: payload.reason,
        })
        .select("id, user_id, content_type, content_id, reason, status, created_at")
        .single();

      if (error) {
        throw error;
      }

      setReports((current) => [data as ContentReport, ...current]);
    },
    [user],
  );

  const updateStatus = useCallback(
    async (id: string, status: ReportStatus) => {
      if (!isAdmin) return;

      const { error } = await supabase
        .from("content_reports")
        .update({ status })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setReports((current) => current.map((report) => (report.id === id ? { ...report, status } : report)));
    },
    [isAdmin],
  );

  return {
    reports,
    loading,
    refresh,
    addReport,
    updateStatus,
  };
}
