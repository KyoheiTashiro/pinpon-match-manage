import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "@/features/home";
import { TournamentLayout } from "@/features/tournament/layout";
import { ParticipantsTab } from "@/features/tournament/participants";
import { MatchMatrixTab } from "@/features/tournament/matrix";
import { ResultTab } from "@/features/tournament/ranking";
import { SettingsTab } from "@/features/tournament/settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/t/:tournamentId" element={<TournamentLayout />}>
        <Route index element={<Navigate to="participants" replace />} />
        <Route path="participants" element={<ParticipantsTab />} />
        <Route path="matrix" element={<MatchMatrixTab />} />
        <Route path="result" element={<ResultTab />} />
        <Route path="settings" element={<SettingsTab />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
