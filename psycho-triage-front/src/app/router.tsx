import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import TriageDashboardPage from "../features/triage/pages/TriageDashboard";
import TriageHistoryPage from "../features/triage/pages/TriageHistoryPage";
import TriageDetailPage from "../features/triage/pages/TriageDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <TriageDashboardPage /> },
      { path: "history", element: <TriageHistoryPage /> },
      { path: "history/:id", element: <TriageDetailPage /> },
    ],
  },
]);