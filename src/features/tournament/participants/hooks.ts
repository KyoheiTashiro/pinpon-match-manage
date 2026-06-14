import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/store/useAppStore";
import { Schema, type FormType, defaultValues } from "@/features/tournament/participants/schema";

export const useParticipants = (tournamentId: string) => {
  const tournament = useAppStore((state) => state.tournaments[tournamentId]);
  const participants = useAppStore((state) => state.participants);
  const addParticipant = useAppStore((state) => state.addParticipant);
  const updateParticipant = useAppStore((state) => state.updateParticipant);
  const removeParticipant = useAppStore((state) => state.removeParticipant);

  const list = tournament?.participantIds.map((id) => participants[id]).filter(Boolean) ?? [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const addForm = useForm<FormType>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues,
  });
  const editForm = useForm<FormType>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues,
  });

  const addSubmit = addForm.handleSubmit((data) => {
    addParticipant(tournamentId, data.name);
    addForm.reset();
  });

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    editForm.reset({ name: currentName });
    void editForm.trigger();
  };
  const cancelEdit = () => setEditingId(null);
  const submitEdit = editForm.handleSubmit((data) => {
    if (editingId) updateParticipant(editingId, { name: data.name });
    setEditingId(null);
  });

  const askRemove = (id: string) => setRemoveTarget(id);
  const doRemove = () => {
    if (removeTarget) removeParticipant(tournamentId, removeTarget);
    setRemoveTarget(null);
  };
  const cancelRemove = () => setRemoveTarget(null);

  return {
    list,
    addForm,
    addSubmit,
    editingId,
    startEdit,
    cancelEdit,
    editForm,
    submitEdit,
    removeTarget,
    askRemove,
    doRemove,
    cancelRemove,
  };
};
