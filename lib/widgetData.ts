import { Platform, NativeModules } from "react-native";
import { Game } from "./types";
import { getTotalScore, getDoubleOpener } from "./gameLogic";
import { Language } from "./settings";

const { WildDominoSharedData } = NativeModules;

let _language: Language = "es";

/** Call from SettingsContext whenever language changes. */
export function setWidgetLanguage(lang: Language): void {
  _language = lang;
  if (Platform.OS === "ios" && WildDominoSharedData) {
    WildDominoSharedData.setLanguage(lang);
  }
}

/** Call from GameContext on every state change. */
export function updateWidget(game: Game | null): void {
  if (Platform.OS !== "ios" || !WildDominoSharedData) return;

  if (!game) {
    WildDominoSharedData.updateWidgetData(
      JSON.stringify({ hasGame: false, language: _language })
    );
    return;
  }

  const rankings = game.players
    .map((p) => ({ name: p.name, total: getTotalScore(game, p.id) }))
    .sort((a, b) => a.total - b.total);

  const isFinished = !!game.finishedAt;

  const payload = {
    hasGame: true,
    language: _language,
    isFinished,
    currentRound: game.currentRound,
    totalRounds: game.totalRounds,
    doubleOpener: isFinished ? null : getDoubleOpener(game.currentRound),
    rankings,
  };

  WildDominoSharedData.updateWidgetData(JSON.stringify(payload));
}
