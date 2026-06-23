import { EmptyState } from "@/components/ui";
import { PersonalMatchResultRow } from "@/features/tournament/result/components/PersonalMatchResultRow";
import type { PersonalMatchRow } from "@/features/tournament/result/hooks";

type Props = {
  matches: PersonalMatchRow[];
};

export const PersonalMatchResults = ({ matches }: Props) => {
  const selfName = matches[0]?.selfName;
  const title = selfName ? `${selfName}さんの対戦結果` : "対戦結果";
  if (matches.length === 0) {
    return (
      <div className="space-y-2 pt-2">
        <div className="text-xl font-extrabold">{title}</div>
        <EmptyState />
      </div>
    );
  }
  return (
    <div className="-mx-3 space-y-2 pt-2">
      <div className="px-2 text-xl font-extrabold">{title}</div>
      <div className="space-y-3">
        {matches.map((match) => (
          <PersonalMatchResultRow key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};
