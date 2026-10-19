import {
  BriefcaseBusiness,
  House,
  RotateCcw,
  Smartphone,
  Wrench,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useDemo } from "../services/DemoContext";

export function PresentationDock() {
  const { repository } = useDemo();
  const location = useLocation();
  const items = [
    { to: "/", label: "Portal", icon: House },
    { to: "/crm/dashboard", label: "CRM", icon: BriefcaseBusiness },
    { to: "/app/inicio", label: "Cliente", icon: Smartphone },
    { to: "/tecnico", label: "Técnico", icon: Wrench },
  ];
  const reset = () => {
    if (
      window.confirm(
        "Restaurar todos os dados da demonstração? As alterações locais serão perdidas.",
      )
    )
      repository.reset();
  };
  return (
    <aside className="presentation-dock" aria-label="Menu da demonstração">
      <span className="demo-dot" title="Modo demonstrativo" />
      {items.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className={
            location.pathname === to ||
            (to !== "/" &&
              location.pathname.startsWith(to.split("/").slice(0, 2).join("/")))
              ? "active"
              : ""
          }
          title={label}
        >
          <Icon size={18} />
          <span>{label}</span>
        </Link>
      ))}
      <button onClick={reset} title="Restaurar demonstração">
        <RotateCcw size={18} />
        <span>Restaurar</span>
      </button>
    </aside>
  );
}
