import { useClipEmbedding } from "@/src/hooks/useClipEmbedding";
import { useTranslation } from "@/src/hooks/useTranslation";
import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { router } from "expo-router";
import { ChevronLeft, Zap } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";

export default function GenerateEmbeddingsScreen() {
  const { t } = useTranslation();
  const { isAdmin } = useAuthStore();
  const { generateAndSave } = useClipEmbedding();

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [success, setSuccess] = useState(0);
  const [errors, setErrors] = useState(0);
  const [currentCard, setCurrentCard] = useState("");
  const [done, setDone] = useState(false);

  const handleGenerate = useCallback(async () => {
    Alert.alert(
      "Générer les embeddings",
      "Ceci va calculer les embeddings CLIP pour toutes les cartes sans embedding. Ça peut prendre plusieurs minutes.",
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: "Lancer",
          onPress: async () => {
            setRunning(true);
            setDone(false);
            setProgress(0);
            setSuccess(0);
            setErrors(0);

            try {
              // Récupère toutes les cartes sans embedding par batch de 1000
              let allCards: any[] = [];
              let from = 0;
              const batchSize = 1000;

              while (true) {
                const { data: cards, error } = await supabase
                  .from("photocards")
                  .select("id, image_url")
                  .eq("status", "approved")
                  .is("embedding", null)
                  .not("image_url", "is", null)
                  .range(from, from + batchSize - 1);

                if (error) throw error;
                if (!cards || cards.length === 0) break;

                allCards = [...allCards, ...cards];
                if (cards.length < batchSize) break;
                from += batchSize;
              }

              if (allCards.length === 0) {
                Alert.alert(
                  "✅ Déjà à jour",
                  "Toutes les cartes ont déjà un embedding.",
                );
                return;
              }

              setTotal(allCards.length);

              let successCount = 0;
              let errorCount = 0;

              for (let i = 0; i < allCards.length; i++) {
                const card = allCards[i];
                setProgress(i + 1);
                setCurrentCard(card.id);
                try {
                  await generateAndSave(card.id, card.image_url);
                  successCount++;
                  setSuccess(successCount);
                } catch (err: any) {
                  console.error(`❌ ${card.id}:`, err.message);
                  errorCount++;
                  setErrors(errorCount);
                }
                await new Promise((r) => setTimeout(r, 50));
              }

              setDone(true);
            } catch (err: any) {
              Alert.alert("Erreur", err.message);
            } finally {
              setRunning(false);
              setCurrentCard("");
            }
          },
        },
      ],
    );
  }, [generateAndSave]);

  if (!isAdmin) {
    router.replace("/admin");
    return null;
  }

  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Générer les embeddings</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Info ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comment ça fonctionne</Text>
          <Text style={styles.cardText}>
            Ce processus télécharge chaque image depuis Supabase Storage, génère
            son embedding via le modèle CLIP (HuggingFace Space), puis
            sauvegarde le vecteur en BDD.{"\n\n"}
            Les embeddings permettent au scan de retrouver la bonne carte par
            similarité visuelle.
          </Text>
        </View>

        {/* ── Progression ── */}
        {(running || done) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {done ? "Terminé !" : "En cours..."}
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${percentage}%` as any },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress} / {total} ({percentage}%)
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: Colors.accent }]}>
                  {success}
                </Text>
                <Text style={styles.statLabel}>Succès</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: Colors.danger }]}>
                  {errors}
                </Text>
                <Text style={styles.statLabel}>Erreurs</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: Colors.textMuted }]}>
                  {total - progress}
                </Text>
                <Text style={styles.statLabel}>Restantes</Text>
              </View>
            </View>
            {running && currentCard ? (
              <Text style={styles.currentCard} numberOfLines={1}>
                Traitement : {currentCard}
              </Text>
            ) : null}
          </View>
        )}

        {/* ── Bouton ── */}
        <TouchableOpacity
          style={[styles.btn, running && styles.btnDisabled]}
          onPress={handleGenerate}
          disabled={running}
          activeOpacity={0.8}
        >
          {running ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <>
              <Zap size={18} color={Colors.bg} strokeWidth={2} />
              <Text style={styles.btnText}>
                {done ? "Relancer" : "Générer les embeddings"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {done && (
          <Text style={styles.doneText}>
            ✅ {success} embedding{success > 1 ? "s" : ""} générés avec succès !
            {errors > 0 ? `\n⚠️ ${errors} erreur${errors > 1 ? "s" : ""}` : ""}
          </Text>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  navTitle: {
    flex: 1,
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.text,
    textAlign: "center",
  },
  content: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: Theme.spacing.md,
  },
  cardTitle: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.text,
  },
  cardText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginRight: 8,
  },
  statusText: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surface2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  progressText: {
    fontSize: Theme.fontSize.sm + 1,
    color: Colors.textMuted,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: { alignItems: "center", gap: 2 },
  statNum: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
  },
  statLabel: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  currentCard: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    fontFamily: "monospace",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md + 2,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.bg,
  },
  doneText: {
    fontSize: Theme.fontSize.base,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 22,
  },
  bottomPad: { height: 40 },
});
