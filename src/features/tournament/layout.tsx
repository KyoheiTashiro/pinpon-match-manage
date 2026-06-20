import { UsersIcon, PaddleIcon, TrophyIcon, GearIcon, ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { ROUTES, TAB_PATH } from "@/constants/routes";
import { FORMAT } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import type { ComponentType, SVGProps } from "react";
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";

type Tab = {
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const tabs: Tab[] = [
  { to: TAB_PATH.PARTICIPANTS, label: "参加者", Icon: UsersIcon },
  { to: TAB_PATH.MATRIX, label: "対戦表", Icon: PaddleIcon },
  { to: TAB_PATH.RESULT, label: "結果", Icon: TrophyIcon },
  { to: TAB_PATH.SETTINGS, label: "設定", Icon: GearIcon },
];

export const TournamentLayout = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const tournament = useAppStore((state) =>
    tournamentId ? state.tournaments[tournamentId] : undefined,
  );
  const setCurrent = useAppStore((state) => state.setCurrentTournament);

  useEffect(() => {
    if (tournamentId) setCurrent(tournamentId);
  }, [tournamentId, setCurrent]);

  if (!tournament) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4 text-lg">大会が見つかりません。</p>
        <button
          onClick={() => {
            void navigate(ROUTES.HOME);
          }}
          className="text-primary text-lg underline"
        >
          一覧へ戻る
        </button>
      </div>
    );
  }

  return (
    <div className="text-ink min-h-screen bg-white pb-24">
      <header className="bg-primary flex flex-wrap items-center gap-3 p-4 text-white">
        <Button
          variant="white"
          size="sm"
          onClick={() => {
            void navigate(ROUTES.HOME);
          }}
          className="inline-flex items-center gap-1"
          aria-label="大会一覧へ戻る"
        >
          <ChevronDownIcon className="rotate-90" /> 戻る
        </Button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xl font-extrabold">{tournament.name}</div>
          <div className="text-sm">
            {tournament.format === FORMAT.SINGLES ? "シングルス" : "ダブルス"}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>

      <nav
        aria-label="メインタブ"
        className="border-line fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t-4 bg-white"
      >
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-[72px] flex-col items-center justify-center py-2 font-bold ${
                isActive ? "bg-primary text-white" : "text-ink bg-white"
              }`
            }
          >
            <Icon className="text-2xl" />
            <span className="text-base">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
