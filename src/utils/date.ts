export const formatDate = (iso?: string): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatYear = (iso?: string): string => {
  if (!iso) return "—";
  return new Date(iso).getFullYear().toString();
};

export const formatShortDate = (iso?: string): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
  });
};

export const getAge = (iso?: string): number | null => {
  if (!iso) return null;
  const today = new Date();
  const birth = new Date(iso);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};
