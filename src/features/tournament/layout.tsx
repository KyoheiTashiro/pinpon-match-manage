import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import type { ComponentType, SVGProps } from "react";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { UsersIcon, PaddleIcon, TrophyIcon, GearIcon } from "@/components/icons";

type Tab = {
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const tabs: Tab[] = [
  { to: "participants", label: "参加者", Icon: UsersIcon },
  { to: "matrix", label: "対戦表", Icon: PaddleIcon },
  { to: "result", label: "結果", Icon: TrophyIcon },
  { to: "settings", label: "設定", Icon: GearIcon },
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
        <p className="text-lg mb-4">大会が見つかりません。</p>
        <button onClick={() => navigate("/")} className="text-primary underline text-lg">
          一覧へ戻る
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-ink pb-24">
      <header className="bg-primary text-white p-4 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => navigate("/")}
          className="min-h-btn px-4 rounded-xl bg-white text-primary font-bold border-2 border-white"
          aria-label="大会一覧へ戻る"
        >
          ← もどる
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xl font-extrabold truncate">{tournament.name}</div>
          <div className="text-sm">
            {tournament.format === "singles" ? "シングルス" : "ダブルス"}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <Outlet />
      </main>

      <nav
        aria-label="メインタブ"
        className="fixed bottom-0 inset-x-0 z-50 bg-white border-t-4 border-line grid grid-cols-4"
      >
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[72px] py-2 font-bold ${
                isActive ? "bg-primary text-white" : "bg-white text-ink"
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
