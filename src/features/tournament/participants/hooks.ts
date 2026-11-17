import { Schema, type FormType, defaultValues } from "@/features/tournament/participants/schema";
import { pastParticipantNamesOf } from "@/store/selectors";
import { useAppStore } from "@/store/useAppStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

const EMPTY_SELECTION: ReadonlySet<string> = new Set();

export const PARTICIPANTS_MODE = {
  IDLE: "idle",
  EDITING: "editing",
  REMOVING: "removing",
  PICKING: "picking",
} as const;

// 編集・削除確認・履歴選択は同時に一つしか成り立たない
type ParticipantsMode =
  | { kind: typeof PARTICIPANTS_MODE.IDLE }
  | { kind: typeof PARTICIPANTS_MODE.EDITING; id: string }
  | { kind: typeof PARTICIPANTS_MODE.REMOVING; id: string }
  | { kind: typeof PARTICIPANTS_MODE.PICKING; selected: ReadonlySet<string> };

const IDLE: ParticipantsMode = { kind: PARTICIPANTS_MODE.IDLE };

export const useParticipants = (tournamentId: string) => {
  const tournament = useAppStore((state) => state.tournaments[tournamentId]);
  const participants = useAppStore((state) => state.participants);
  const addParticipant = useAppStore((state) => state.addParticipant);
  const addParticipants = useAppStore((state) => state.addParticipants);
  const updateParticipant = useAppStore((state) => state.updateParticipant);
  const removeParticipant = useAppStore((state) => state.removeParticipant);

  const list = tournament?.participantIds.map((id) => participants[id]).filter(Boolean) ?? [];

  const currentNames = new Set(list.map((participant) => participant.name.trim()));

  const pastCandidates = pastParticipantNamesOf(participants, tournamentId).map((name) => ({
    name,
    alreadyAdded: currentNames.has(name),
  }));

  const [mode, setMode] = useState<ParticipantsMode>(IDLE);
  const backToIdle = () => setMode(IDLE);
  const isIdle = mode.kind === PARTICIPANTS_MODE.IDLE;

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
    if (!isIdle) return;
    setMode({ kind: PARTICIPANTS_MODE.EDITING, id });
    editForm.reset({ name: currentName });
    void editForm.trigger();
  };
  const submitEdit = editForm.handleSubmit((data) => {
    if (mode.kind === PARTICIPANTS_MODE.EDITING) updateParticipant(mode.id, { name: data.name });
    backToIdle();
  });

  const askRemove = (id: string) => {
    if (isIdle) setMode({ kind: PARTICIPANTS_MODE.REMOVING, id });
  };
  const doRemove = () => {
    if (mode.kind === PARTICIPANTS_MODE.REMOVING) removeParticipant(tournamentId, mode.id);
    backToIdle();
  };

  const openPastPicker = () => {
    if (isIdle) setMode({ kind: PARTICIPANTS_MODE.PICKING, selected: new Set() });
  };
  const togglePast = (name: string) => {
    setMode((previous) => {
      if (previous.kind !== PARTICIPANTS_MODE.PICKING) return previous;
      const selected = new Set(previous.selected);
      if (selected.has(name)) {
        selected.delete(name);
      } else {
        selected.add(name);
      }
      return { kind: PARTICIPANTS_MODE.PICKING, selected };
    });
  };
  const confirmAddPast = () => {
    if (mode.kind === PARTICIPANTS_MODE.PICKING) addParticipants(tournamentId, [...mode.selected]);
    backToIdle();
  };

  return {
    list,
    addForm,
    addSubmit,
    isIdle,
    editingId: mode.kind === PARTICIPANTS_MODE.EDITING ? mode.id : null,
    startEdit,
    cancelEdit: backToIdle,
    editForm,
    submitEdit,
    removeConfirmOpen: mode.kind === PARTICIPANTS_MODE.REMOVING,
    askRemove,
    doRemove,
    cancelRemove: backToIdle,
    pastCandidates,
    pastPickerOpen: mode.kind === PARTICIPANTS_MODE.PICKING,
    pastSelected: mode.kind === PARTICIPANTS_MODE.PICKING ? mode.selected : EMPTY_SELECTION,
    openPastPicker,
    closePastPicker: backToIdle,
    togglePast,
    confirmAddPast,
  };
};
