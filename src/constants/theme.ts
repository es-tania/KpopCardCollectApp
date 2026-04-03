export const Theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 14,
    xl: 20,
    full: 999,
  },
  fontSize: {
    xs: 9,
    sm: 10,
    md: 11,
    base: 13,
    lg: 15,
    xl: 18,
    xxl: 20,
    title: 24,
  },
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;
