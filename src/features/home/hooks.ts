import { Schema, type FormType, defaultValues } from "@/features/home/schema";
import { useAppStore } from "@/store/useAppStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useHome = (onCreated: (id: string) => void) => {
  const tournaments = useAppStore((state) => state.tournaments);
  const createTournament = useAppStore((state) => state.createTournament);
  const resetAll = useAppStore((state) => state.resetAll);

  const list = Object.values(tournaments).toSorted(
    (tournamentA, tournamentB) =>
      (tournamentB.date ?? "").localeCompare(tournamentA.date ?? "") ||
      tournamentB.createdAt.localeCompare(tournamentA.createdAt),
  );

  const [creating, setCreating] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const formMethods = useForm<FormType>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues,
  });

  const submit = formMethods.handleSubmit((data) => {
    const id = createTournament(data.name, data.format, data.date, data.bestOf);
    formMethods.reset();
    setCreating(false);
    onCreated(id);
  });

  const closeForm = () => {
    formMethods.reset();
    setCreating(false);
  };

  const askReset = () => setConfirmReset(true);
  const doReset = () => {
    resetAll();
    setConfirmReset(false);
    setSettingsOpen(false);
  };
  const cancelReset = () => setConfirmReset(false);

  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => {
    setSettingsOpen(false);
    setConfirmReset(false);
  };

  return {
    list,
    creating,
    setCreating,
    closeForm,
    form: formMethods,
    submit,
    confirmReset,
    askReset,
    doReset,
    cancelReset,
    settingsOpen,
    openSettings,
    closeSettings,
  };
};
