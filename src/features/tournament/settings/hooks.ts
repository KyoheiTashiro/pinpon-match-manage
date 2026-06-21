import { Schema, type FormType, defaultValues } from "@/features/tournament/settings/schema";
import { useAppStore } from "@/store/useAppStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const DIALOG = { reset: "reset", delete: "delete" } as const;
type Dialog = (typeof DIALOG)[keyof typeof DIALOG];

export const useSettings = (tournamentId: string, onDeleted: () => void) => {
  const tournament = useAppStore((state) => state.tournaments[tournamentId]);
  const updateTournament = useAppStore((state) => state.updateTournament);
  const resetTournament = useAppStore((state) => state.resetTournament);
  const deleteTournament = useAppStore((state) => state.deleteTournament);

  const [editing, setEditing] = useState(false);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const closeDialog = () => setDialog(null);

  const form = useForm<FormType>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues,
  });

  const startEdit = () => {
    if (!tournament) return;
    form.reset({ name: tournament.name, date: tournament.date });
    void form.trigger(); // プリフィル値で isValid を即時確定（保存ボタンの初期 disabled 回避）
    setEditing(true);
  };
  const cancelEdit = () => setEditing(false);
  const saveEdit = form.handleSubmit((data) => {
    updateTournament(tournamentId, { name: data.name, date: data.date });
    setEditing(false);
  });

  const doReset = () => {
    resetTournament(tournamentId);
    closeDialog();
  };
  const doDelete = () => {
    deleteTournament(tournamentId);
    closeDialog();
    onDeleted();
  };

  return {
    tournament,
    form,
    editing,
    startEdit,
    cancelEdit,
    saveEdit,
    dialog,
    openReset: () => setDialog(DIALOG.reset),
    openDelete: () => setDialog(DIALOG.delete),
    closeDialog,
    doReset,
    doDelete,
  };
};
