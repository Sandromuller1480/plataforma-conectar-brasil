import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  Wrench,
} from "lucide-react";
import { Badge, Button, PageTitle, shortDate } from "../../components/ui";
import { useDemo } from "../../services/DemoContext";

export function TechnicianPage() {
  const { state, repository } = useDemo();
  const [selected, setSelected] = useState(Object.keys(state.workOrders)[0]);
  const [error, setError] = useState("");
  const order = state.workOrders[selected];
  const contract = state.contracts[order.contractId];
  const client = state.clients[contract.clientId];
  const address = client.addresses.find(
    (item) => item.id === contract.addressId,
  )!;
  const complete = () => {
    try {
      repository.updateWorkOrder(order.id, { status: "Concluída" });
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <div className="technician-shell">
      <header>
        <img
          src="/assets/brand/logo-conectar-branco.png"
          alt="Conectar Brasil"
        />
        <Badge tone="success">
          <Wrench /> Técnico demo
        </Badge>
      </header>
      <main>
        <PageTitle eyebrow="Agenda de campo" title="Minhas ordens">
          Interface móvel para execução das visitas atribuídas.
        </PageTitle>
        <div className="tech-tabs">
          {Object.values(state.workOrders).map((item) => (
            <button
              className={item.id === selected ? "active" : ""}
              key={item.id}
              onClick={() => setSelected(item.id)}
            >
              <span>{shortDate(item.scheduledAt).slice(0, 6)}</span>
              <small>{item.scheduledAt.slice(11, 16)}</small>
            </button>
          ))}
        </div>
        <article className="tech-order">
          <div className="tech-order-title">
            <div>
              <Badge
                tone={order.status === "Concluída" ? "success" : "warning"}
              >
                {order.status}
              </Badge>
              <h2>{client.name}</h2>
              <p>{order.id}</p>
            </div>
            <CalendarDays />
          </div>
          <div className="tech-address">
            <MapPin />
            <span>
              {address.street}, {address.number}
              <small>
                {address.district} · {address.city}/{address.state}
              </small>
            </span>
          </div>
          <h3>
            <ClipboardCheck /> Checklist
          </h3>
          <div className="tech-checklist">
            {order.checklist.map((entry, index) => (
              <label key={entry.label}>
                <input
                  type="checkbox"
                  checked={entry.done}
                  onChange={() =>
                    repository.updateWorkOrder(order.id, {
                      checklist: order.checklist.map((item, i) =>
                        i === index ? { ...item, done: !item.done } : item,
                      ),
                    })
                  }
                />
                <span>{entry.label}</span>
                {entry.done && <CheckCircle2 />}
              </label>
            ))}
          </div>
          <label>
            Observações
            <textarea
              value={order.notes}
              onChange={(e) =>
                repository.updateWorkOrder(order.id, { notes: e.target.value })
              }
              placeholder="Registre apenas informações sintéticas."
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <div className="stack-actions">
            <Button onClick={complete}>Concluir ordem</Button>
            <Button
              variant="secondary"
              onClick={() =>
                repository.updateWorkOrder(order.id, { status: "Pendente" })
              }
            >
              Registrar pendência
            </Button>
          </div>
        </article>
      </main>
    </div>
  );
}
