import { groupsService } from "@/src/services/groupsService";
import { membersService } from "@/src/services/membersService";
import {
  buildStoragePath,
  storageService,
} from "@/src/services/storageService";
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
    .replace(/[^a-z0-9-_]/g, "") || "unknown"; // ← fallback si vide

export const useAddGroup = (onSuccess: () => void): UseAddGroupResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const { invalidateAll } = useCacheStore();

  const submit = async (form: GroupFormState, members: MemberFormState[]) => {
    setLoading(true);
    setError(null);

    try {
      // ── 1. Upload logo ─────────────────────────────────────────────────
      // → group-logos/p1harmony/logo_1234567890.jpg
      let logoUrl: string | undefined;
      if (form.logoUri) {
        setProgress("Upload du logo...");
        const path = buildStoragePath.groupLogo(slugify(form.name));
        console.log("Upload logo →", {
          bucket: "group-logos",
          path,
          uri: form.logoUri,
        });

        logoUrl = await storageService.uploadImage(
          "group-logos",
          path,
          form.logoUri,
        );
      }

      // ── 2. Upload bannière ─────────────────────────────────────────────
      // → group-banners/p1harmony/banner_1234567890.jpg
      let bannerUrl: string | undefined;
      if (form.bannerUri) {
        setProgress("Upload de la bannière...");
        const path = buildStoragePath.groupBanner(slugify(form.name));
        console.log("Upload banner →", {
          bucket: "group-banners",
          path,
          uri: form.bannerUri,
        });

        bannerUrl = await storageService.uploadImage(
          "group-banners",
          path,
          form.bannerUri,
        );
      }

      // ── 3. Crée le groupe ──────────────────────────────────────────────
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

      // ── 4. Crée les membres (séquentiellement pour éviter les conflits) ──
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
