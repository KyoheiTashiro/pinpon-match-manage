import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { FontSizeToggle } from '../components/FontSizeToggle';

const tabs = [
  { to: 'participants', label: '参加者', icon: '👥' },
  { to: 'matrix', label: '対戦表', icon: '🏓' },
  { to: 'ranking', label: '順位', icon: '🏆' },
  { to: 'settings', label: '設定', icon: '⚙' },
];

export const TournamentLayout = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const tournament = useAppStore((s) =>
    tournamentId ? s.tournaments[tournamentId] : undefined,
  );
  const setCurrent = useAppStore((s) => s.setCurrentTournament);

  useEffect(() => {
    if (tournamentId) setCurrent(tournamentId);
  }, [tournamentId, setCurrent]);

  if (!tournament) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg mb-4">大会が見つかりません。</p>
        <button onClick={() => navigate('/')} className="text-primary underline text-lg">
          一覧へ戻る
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-ink pb-24">
      <header className="bg-primary text-white p-4 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => navigate('/')}
          className="min-h-btn px-4 rounded-xl bg-white text-primary font-bold border-2 border-white"
          aria-label="大会一覧へ戻る"
        >
          ← もどる
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xl font-extrabold truncate">{tournament.name}</div>
          <div className="text-sm">
            {tournament.format === 'singles' ? 'シングルス' : 'ダブルス'}
          </div>
        </div>
        <FontSizeToggle />
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <Outlet />
      </main>

      <nav
        aria-label="メインタブ"
        className="fixed bottom-0 inset-x-0 bg-white border-t-4 border-line grid grid-cols-4"
      >
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[72px] py-2 font-bold ${
                isActive ? 'bg-primary text-white' : 'bg-white text-ink'
              }`
            }
          >
            <span className="text-2xl" aria-hidden>{t.icon}</span>
            <span className="text-base">{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
