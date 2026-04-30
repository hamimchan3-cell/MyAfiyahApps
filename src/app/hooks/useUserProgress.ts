import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/AuthProvider";

export type ProgressType = "tool" | "guide";

type ProgressMap = Record<ProgressType, Set<string>>;
type ProgressRow = { item_type: string; item_id: string };

const defaultProgress = (): ProgressMap => ({
  tool: new Set<string>(),
  guide: new Set<string>(),
});

const cacheKey = (userId: string) => `myafiyah:progress:${userId}`;

const saveCache = (userId: string, value: ProgressMap) => {
  const payload = {
    tool: Array.from(value.tool),
    guide: Array.from(value.guide),
  };
  localStorage.setItem(cacheKey(userId), JSON.stringify(payload));
};

const loadCache = (userId: string): ProgressMap => {
  const raw = localStorage.getItem(cacheKey(userId));
  if (!raw) {
    return defaultProgress();
  }

  try {
    const parsed = JSON.parse(raw) as { tool?: string[]; guide?: string[] };
    return {
      tool: new Set(parsed.tool ?? []),
      guide: new Set(parsed.guide ?? []),
    };
  } catch {
    return defaultProgress();
  }
};

const isProgressType = (value: string): value is ProgressType => {
  return value === "tool" || value === "guide";
};

export function useUserProgress() {
  const { user, isGuest } = useAuth();
  const [progress, setProgress] = useState<ProgressMap>(defaultProgress);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setProgress(defaultProgress());
      return;
    }

    if (isGuest) {
      setProgress(loadCache(user.id));
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("user_progress")
      .select("item_type, item_id")
      .eq("user_id", user.id)
      .returns<ProgressRow[]>();

    if (error) {
      console.error("Unable to load user progress", error);
      setProgress(loadCache(user.id));
      setLoading(false);
      return;
    }

    const next = defaultProgress();
    (data ?? []).forEach((entry) => {
      if (isProgressType(entry.item_type)) {
        next[entry.item_type].add(entry.item_id);
      }
    });

    setProgress(next);
    saveCache(user.id, next);
    setLoading(false);
  }, [isGuest, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isCompleted = useCallback(
    (itemType: ProgressType, itemId: string) => progress[itemType].has(itemId),
    [progress],
  );

  const completedCounts = useMemo(
    () => ({
      tool: progress.tool.size,
      guide: progress.guide.size,
    }),
    [progress],
  );

  const setCompleted = useCallback(
    async (itemType: ProgressType, itemId: string, completed: boolean) => {
      if (!user) return;

      if (completed) {
        const optimistic = {
          tool: new Set(progress.tool),
          guide: new Set(progress.guide),
        };
        optimistic[itemType].add(itemId);
        setProgress(optimistic);
        saveCache(user.id, optimistic);

        if (isGuest) {
          return;
        }

        const { error } = await supabase.from("user_progress").upsert(
          {
            user_id: user.id,
            item_type: itemType,
            item_id: itemId,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,item_type,item_id" },
        );

        if (error) {
          console.error("Unable to sync progress to Supabase, kept local cache", error);
        }

        return;
      }

      const optimistic = {
        tool: new Set(progress.tool),
        guide: new Set(progress.guide),
      };
      optimistic[itemType].delete(itemId);
      setProgress(optimistic);
      saveCache(user.id, optimistic);

      if (isGuest) {
        return;
      }

      const { error } = await supabase
        .from("user_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId);

      if (error) {
        console.error("Unable to sync progress removal, kept local cache", error);
      }
    },
    [isGuest, progress, user],
  );

  return {
    loading,
    isCompleted,
    completedCounts,
    refresh,
    setCompleted,
  };
}
