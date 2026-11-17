import { Schema, type FormType, defaultValues } from "@/features/tournament/settings/schema";
import { useAppStore } from "@/store/useAppStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const SETTINGS_MODE = {
  VIEW: "view",
  EDITING: "editing",
  CONFIRM_RESET: "confirmReset",
  CONFIRM_DELETE: "confirmDelete",
} as const;
type SettingsMode = (typeof SETTINGS_MODE)[keyof typeof SETTINGS_MODE];

export const useSettings = (tournamentId: string, onDeleted: () => void) => {
  const tournament = useAppStore((state) => state.tournaments[tournamentId]);
  const updateTournament = useAppStore((state) => state.updateTournament);
  const resetTournament = useAppStore((state) => state.resetTournament);
  const deleteTournament = useAppStore((state) => state.deleteTournament);

  const [mode, setMode] = useState<SettingsMode>(SETTINGS_MODE.VIEW);
  const backToView = () => setMode(SETTINGS_MODE.VIEW);
  // 編集中に削除ダイアログへ移ると入力途中の値が確認なしで消えるため、閲覧状態からのみ開く
  const openFromView = (next: SettingsMode) =>
    setMode((current) => (current === SETTINGS_MODE.VIEW ? next : current));

  const form = useForm<FormType>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues,
  });

  const startEdit = () => {
    if (!tournament) return;
    form.reset({ name: tournament.name, date: tournament.date });
    void form.trigger(); // プリフィル値で isValid を即時確定（保存ボタンの初期 disabled 回避）
    setMode(SETTINGS_MODE.EDITING);
  };
  const saveEdit = form.handleSubmit((data) => {
    updateTournament(tournamentId, { name: data.name, date: data.date });
    backToView();
  });

  const doReset = () => {
    resetTournament(tournamentId);
    backToView();
  };
  const doDelete = () => {
    deleteTournament(tournamentId);
    backToView();
    onDeleted();
  };

  return {
    tournament,
    form,
    mode,
    startEdit,
    cancelEdit: backToView,
    saveEdit,
    openReset: () => openFromView(SETTINGS_MODE.CONFIRM_RESET),
    openDelete: () => openFromView(SETTINGS_MODE.CONFIRM_DELETE),
    closeDialog: backToView,
    doReset,
    doDelete,
  };
};
