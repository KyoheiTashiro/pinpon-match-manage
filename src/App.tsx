import { Routes, Route, Navigate } from 'react-router-dom';
import { TournamentList } from './routes/TournamentList';
import { TournamentLayout } from './routes/TournamentLayout';
import { ParticipantsTab } from './routes/ParticipantsTab';
import { MatchMatrixTab } from './routes/MatchMatrixTab';
import { RankingTab } from './routes/RankingTab';
import { SettingsTab } from './routes/SettingsTab';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TournamentList />} />
      <Route path="/t/:tournamentId" element={<TournamentLayout />}>
        <Route index element={<Navigate to="participants" replace />} />
        <Route path="participants" element={<ParticipantsTab />} />
        <Route path="matrix" element={<MatchMatrixTab />} />
        <Route path="ranking" element={<RankingTab />} />
        <Route path="settings" element={<SettingsTab />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
