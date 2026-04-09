import { groupsService } from "@/src/services/groupsService";
import { membersService } from "@/src/services/membersService";
import {
  buildStoragePath,
  storageService,
} from "@/src/services/storageService";
import { Group, GroupFormState, MemberFormState } from "@/src/types";
import { useState } from "react";
import { extractUrl } from "../utils/extractUrl";

interface UseEditGroupResult {
  loading: boolean;
  progress: string | null;
  error: string | null;
  submit: (
    groupId: string,
    form: GroupFormState,
    members: MemberFormState[],
    currentGroup: Group,
  ) => Promise<void>;
}

export const useEditGroup = (onSuccess: () => void): UseEditGroupResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const submit = async (
    groupId: string,
    form: GroupFormState,
    members: MemberFormState[],
    currentGroup: Group,
  ) => {
    setLoading(true);
    setError(null);

    try {
      // ── 1. Upload nouveau logo si modifié ──────────────────────────────
      let logoUrl: string | undefined;
      if (form.removeLogo && !form.logoUri) {
        const oldLogoUrl = extractUrl(currentGroup.logoUrl);
        if (oldLogoUrl) {
          await storageService.deleteFromUrl("group-logos", oldLogoUrl);
        }
        // Met null en BDD
        await groupsService.update(groupId, { logoUrl: null as any });
      } else if (form.logoUri) {
        setProgress("Upload du logo...");
        const oldLogoUrl = extractUrl(currentGroup.logoUrl);
        if (oldLogoUrl) {
          await storageService.deleteFromUrl("group-logos", oldLogoUrl);
        }

        logoUrl = await storageService.uploadImage(
          "group-logos",
          buildStoragePath.groupLogo(form.name),
          form.logoUri,
        );
      }

      // ── 2. Upload nouvelle bannière si modifiée ────────────────────────
      let bannerUrl: string | undefined;
      if (form.removeBanner && !form.bannerUri) {
        const oldBannerUrl = extractUrl(currentGroup.bannerUrl);
        if (oldBannerUrl) {
          await storageService.deleteFromUrl("group-banners", oldBannerUrl);
        }
        await groupsService.update(groupId, { bannerUrl: null as any });
      } else if (form.bannerUri) {
        setProgress("Upload de la bannière...");
        // Supprime l'ancienne bannière si elle existe
        const oldBannerUrl = extractUrl(currentGroup.bannerUrl);
        if (oldBannerUrl) {
          await storageService.deleteFromUrl("group-banners", oldBannerUrl);
        }

        bannerUrl = await storageService.uploadImage(
          "group-banners",
          buildStoragePath.groupBanner(form.name),
          form.bannerUri,
        );
      }

      // ── 3. Met à jour le groupe ────────────────────────────────────────
      setProgress("Mise à jour du groupe...");
      await groupsService.update(groupId, {
        name: form.name,
        koreanName: form.koreanName || undefined,
        company: form.company || undefined,
        debutDate: form.debutDate || undefined,
        disbandDate:
          form.status === "disbanded"
            ? form.disbandDate || undefined
            : undefined,
        generation: form.generation || undefined,
        fandomName: form.fandomName || undefined,
        status: (form.status as any) || "active",
        // ✅ Seulement si un nouveau fichier a été uploadé
        ...(logoUrl && { logoUrl: { uri: logoUrl } }),
        ...(bannerUrl && { bannerUrl: { uri: bannerUrl } }),
      });

      // ── 4. Gère les membres ────────────────────────────────────────────
      const existingMembers = members.filter((m) => !m.isNew);
      const newMembers = members.filter((m) => m.isNew);

      // Membres existants — met à jour
      for (let i = 0; i < existingMembers.length; i++) {
        const member = existingMembers[i];
        setProgress(
          `Mise à jour des membres... (${i + 1}/${existingMembers.length})`,
        );

        let photoUrl: string | null | undefined;

        if (member.removePhoto && !member.photoUri) {
          console.log(
            "Remove photo — existingPhotoUrl:",
            member.existingPhotoUrl,
          );

          if (member.existingPhotoUrl) {
            await storageService.deleteFromUrl(
              "member-photos",
              member.existingPhotoUrl,
            );
          } else {
            console.warn("Pas d'existingPhotoUrl pour", member.stageName);
          }
          photoUrl = null;
        } else if (member.photoUri) {
          // ── Remplace l'ancienne par la nouvelle ──────────────────────────
          if (member.existingPhotoUrl) {
            await storageService.deleteFromUrl(
              "member-photos",
              member.existingPhotoUrl,
            );
          }
          photoUrl = await storageService.uploadImage(
            "member-photos",
            buildStoragePath.memberPhoto(form.name, member.stageName),
            member.photoUri,
          );
        } else {
          // ── Pas de changement ────────────────────────────────────────────
          photoUrl = undefined; // ← undefined = ne touche pas la colonne
        }

        await membersService.update(member.id!, {
          stageName: member.stageName,
          realName: member.realName || undefined,
          koreanName: member.koreanName || undefined,
          birthDate: member.birthDate || undefined,
          position: member.position ? ([member.position] as any) : [],
          photoUrl:
            photoUrl !== undefined
              ? photoUrl === null
                ? null
                : { uri: photoUrl }
              : undefined,
        });
      }
      // Nouveaux membres — crée
      for (let i = 0; i < newMembers.length; i++) {
        const member = newMembers[i];
        setProgress(
          `Ajout des nouveaux membres... (${i + 1}/${newMembers.length})`,
        );

        let photoUrl: string | undefined;
        if (member.photoUri) {
          photoUrl = await storageService.uploadImage(
            "member-photos",
            buildStoragePath.memberPhoto(form.name, member.stageName),
            member.photoUri,
          );
        }

        await membersService.create({
          groupId: groupId,
          stageName: member.stageName,
          realName: member.realName || undefined,
          koreanName: member.koreanName || undefined,
          birthDate: member.birthDate || undefined,
          position: member.position ? ([member.position] as any) : [],
          photoUrl: photoUrl ? { uri: photoUrl } : undefined,
        });
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
