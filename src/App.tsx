import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "@/features/home";
import { TournamentLayout } from "@/features/tournament/layout";
import { ParticipantsTab } from "@/features/tournament/participants";
import { MatchMatrixTab } from "@/features/tournament/matrix";
import { ResultTab } from "@/features/tournament/result";
import { SettingsTab } from "@/features/tournament/settings";
import { ROUTES, TAB_PATH } from "@/constants/routes";

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.TOURNAMENT} element={<TournamentLayout />}>
        <Route index element={<Navigate to={TAB_PATH.PARTICIPANTS} replace />} />
        <Route path={TAB_PATH.PARTICIPANTS} element={<ParticipantsTab />} />
        <Route path={TAB_PATH.MATRIX} element={<MatchMatrixTab />} />
        <Route path={TAB_PATH.RESULT} element={<ResultTab />} />
        <Route path={TAB_PATH.SETTINGS} element={<SettingsTab />} />
      </Route>
      <Route path={ROUTES.NOT_FOUND} element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
