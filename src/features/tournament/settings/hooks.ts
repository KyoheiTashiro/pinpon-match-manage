import { Schema, type FormType, defaultValues } from "@/features/tournament/settings/schema";
import { useAppStore } from "@/store/useAppStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useSettings = (tournamentId: string, onDeleted: () => void) => {
  const tournament = useAppStore((state) => state.tournaments[tournamentId]);
  const updateTournament = useAppStore((state) => state.updateTournament);
  const resetTournament = useAppStore((state) => state.resetTournament);
  const deleteTournament = useAppStore((state) => state.deleteTournament);

  const [editing, setEditing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const askReset = () => setConfirmReset(true);
  const doReset = () => {
    resetTournament(tournamentId);
    setConfirmReset(false);
  };
  const cancelReset = () => setConfirmReset(false);

  const askDelete = () => setConfirmDelete(true);
  const doDelete = () => {
    deleteTournament(tournamentId);
    setConfirmDelete(false);
    onDeleted();
  };
  const cancelDelete = () => setConfirmDelete(false);

  return {
    tournament,
    form,
    editing,
    startEdit,
    cancelEdit,
    saveEdit,
    confirmReset,
    askReset,
    doReset,
    cancelReset,
    confirmDelete,
    askDelete,
    doDelete,
    cancelDelete,
  };
};
