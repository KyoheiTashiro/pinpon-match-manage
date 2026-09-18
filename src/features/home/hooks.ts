import { Schema, type FormType, defaultValues } from "@/features/home/schema";
import { useAppStore } from "@/store/useAppStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useHome = (onCreated: (id: string) => void) => {
  const tournaments = useAppStore((state) => state.tournaments);
  const createTournament = useAppStore((state) => state.createTournament);
  const defaultBestOf = useAppStore((state) => state.defaultBestOf);

  const list = Object.values(tournaments).toSorted(
    (tournamentA, tournamentB) =>
      (tournamentB.date ?? "").localeCompare(tournamentA.date ?? "") ||
      tournamentB.createdAt.localeCompare(tournamentA.createdAt),
  );

  const [creating, setCreating] = useState(false);

  const form = useForm<FormType>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues: { ...defaultValues, bestOf: defaultBestOf },
  });

  const openForm = () => {
    form.reset({ ...defaultValues, bestOf: defaultBestOf });
    setCreating(true);
  };

  const submit = form.handleSubmit((data) => {
    const id = createTournament(data.name, data.format, data.date, data.bestOf);
    form.reset();
    setCreating(false);
    onCreated(id);
  });

  const closeForm = () => {
    form.reset();
    setCreating(false);
  };

  return { list, creating, openForm, closeForm, form, submit };
};
