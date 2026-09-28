import { supabase } from "@/src/lib/supabase";
import { groupsService } from "@/src/services/groupsService";
import { membersService } from "@/src/services/membersService";
import {
  buildStoragePath,
  storageService,
} from "@/src/services/storageService";
import { useAuthStore } from "@/src/store/authStore";
import { useCacheStore } from "@/src/store/cacheStore";
import { GroupFormState, MemberFormState } from "@/src/types";
import { useState } from "react";

interface UseAddGroupResult {
  loading: boolean;
  progress: string | null;
  error: string | null;
  submit: (form: GroupFormState, members: MemberFormState[]) => Promise<void>;
}

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "") || "unknown";

export const useAddGroup = (
  onSuccess: () => void,
  isUserSubmission = false,
): UseAddGroupResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const { invalidateAll } = useCacheStore();
  const { user } = useAuthStore();

  const submit = async (form: GroupFormState, members: MemberFormState[]) => {
    setLoading(true);
    setError(null);
    try {
      // ── 1. Upload logo ────────────────────────────────────────────────
      let logoUrl: string | undefined;
      if (form.logoUri) {
        setProgress("Upload du logo...");
        logoUrl = await storageService.uploadImage(
          "group-logos",
          buildStoragePath.groupLogo(slugify(form.name)),
          form.logoUri,
        );
      }

      if (isUserSubmission) {
        // ── 2a. Soumission utilisateur → group_submissions ────────────
        setProgress("Envoi de la soumission...");
        const { error: insertError } = await supabase
          .from("group_submissions")
          .insert({
            created_by: user!.id,
            name: form.name,
            name_korean: form.koreanName || null,
            cover_url: logoUrl ?? null,
            debut_date: form.debutDate || null,
            status: "pending",
          });
        if (insertError) throw insertError;
        // ← Pas de membres pour une soumission utilisateur
      } else {
        // ── 2b. Admin → groups (comportement existant) ────────────────

        // Upload bannière
        let bannerUrl: string | undefined;
        if (form.bannerUri) {
          setProgress("Upload de la bannière...");
          bannerUrl = await storageService.uploadImage(
            "group-banners",
            buildStoragePath.groupBanner(slugify(form.name)),
            form.bannerUri,
          );
        }

        // Crée le groupe
        setProgress("Création du groupe...");
        const group = await groupsService.create({
          name: form.name,
          koreanName: form.koreanName || undefined,
          company: form.company || undefined,
          debutDate: form.debutDate || undefined,
          disbandDate: form.disbandDate || undefined,
          generation: form.generation || undefined,
          fandomName: form.fandomName || undefined,
          status: (form.status as any) || "active",
          logoUrl: logoUrl ? { uri: logoUrl } : undefined,
          bannerUrl: bannerUrl ? { uri: bannerUrl } : undefined,
          totalPhotocards: 0,
        });

        // Crée les membres
        for (let i = 0; i < members.length; i++) {
          const member = members[i];
          setProgress(`Ajout des membres... (${i + 1}/${members.length})`);

          let photoUrl: string | undefined;
          if (member.photoUri) {
            photoUrl = await storageService.uploadImage(
              "member-photos",
              buildStoragePath.memberPhoto(form.name, member.stageName),
              member.photoUri,
            );
          }

          await membersService.create({
            groupId: group.id,
            stageName: member.stageName,
            realName: member.realName || undefined,
            koreanName: member.koreanName || undefined,
            birthDate: member.birthDate || undefined,
            position: member.position as any,
            photoUrl: photoUrl ? { uri: photoUrl } : undefined,
          });
        }

        invalidateAll("groups:");
      }

      setProgress(null);
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return { loading, progress, error, submit };
};
