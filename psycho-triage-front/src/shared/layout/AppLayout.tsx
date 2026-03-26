import type { ReactNode } from "react";
import { NavLink, type NavLinkRenderProps } from "react-router-dom";

type Props = {
  children: ReactNode;
};

export default function AppLayout({ children }: Props) {
  return (
    <div className="page-shell">
      <div className="page-container">
        <header className="panel">
          <div className="header-row">
            <div>
              <h1 className="app-title">Psycho Triage</h1>
              <p className="app-subtitle">
                Wizard clínico, historial y detalle de evaluaciones.
              </p>
            </div>

            <nav className="nav-row">
              <nav style={{ display: "flex", gap: 12 }}>
              <NavLink
                to="/"
                className={({ isActive }: NavLinkRenderProps) => 
                  `btn ${isActive ?  "btn-primary" : "btn-secondary"}`
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }: NavLinkRenderProps) =>
                  `btn ${isActive ? "btn-primary" : "btn-secondary"}`
                }
              >
                Historial
              </NavLink>
               </nav>
            </nav>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}