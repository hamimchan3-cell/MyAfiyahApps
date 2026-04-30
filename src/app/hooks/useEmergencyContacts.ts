import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/AuthProvider";

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
};

const cacheKey = (userId: string) => `myafiyah:contacts:${userId}`;

const saveCache = (userId: string, contacts: EmergencyContact[]) => {
  localStorage.setItem(cacheKey(userId), JSON.stringify(contacts));
};

const loadCache = (userId: string): EmergencyContact[] => {
  const raw = localStorage.getItem(cacheKey(userId));
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as EmergencyContact[];
  } catch {
    return [];
  }
};

export function useEmergencyContacts() {
  const { user, isGuest } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setContacts([]);
      return;
    }

    if (isGuest) {
      setContacts(loadCache(user.id));
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("emergency_contacts")
      .select("id, name, phone, relationship")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Unable to load emergency contacts", error);
      setContacts(loadCache(user.id));
      setLoading(false);
      return;
    }

    setContacts(data ?? []);
    saveCache(user.id, data ?? []);
    setLoading(false);
  }, [isGuest, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addContact = useCallback(
    async (payload: Omit<EmergencyContact, "id">) => {
      if (!user) return;

      const temporary: EmergencyContact = {
        id: `local-${Date.now()}`,
        ...payload,
      };

      const optimistic = [temporary, ...contacts];
      setContacts(optimistic);
      saveCache(user.id, optimistic);

      if (isGuest) {
        return;
      }

      const { data, error } = await supabase
        .from("emergency_contacts")
        .insert({ ...payload, user_id: user.id })
        .select("id, name, phone, relationship")
        .single();

      if (error) {
        console.error("Unable to sync emergency contact, kept local cache", error);
        return;
      }

      const next = [data, ...contacts];
      setContacts(next);
      saveCache(user.id, next);
    },
    [contacts, user],
  );

  const deleteContact = useCallback(
    async (id: string) => {
      if (!user) return;

      const next = contacts.filter((contact) => contact.id !== id);
      setContacts(next);
      saveCache(user.id, next);

      if (isGuest) {
        return;
      }

      const { error } = await supabase
        .from("emergency_contacts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Unable to sync contact deletion, kept local cache", error);
        return;
      }
    },
    [contacts, user],
  );

  return {
    contacts,
    loading,
    refresh,
    addContact,
    deleteContact,
  };
}
