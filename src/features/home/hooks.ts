import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/store/useAppStore";
import { Schema, type FormType, defaultValues } from "@/features/home/schema";

export const useHome = (onCreated: (id: string) => void) => {
  const tournaments = useAppStore((state) => state.tournaments);
  const createTournament = useAppStore((state) => state.createTournament);

  const list = Object.values(tournaments).sort(
    (tournamentA, tournamentB) =>
      (tournamentB.date ?? "").localeCompare(tournamentA.date ?? "") ||
      tournamentB.createdAt.localeCompare(tournamentA.createdAt),
  );

  const [creating, setCreating] = useState(false);

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

  return { list, creating, setCreating, closeForm, form: formMethods, submit };
};
