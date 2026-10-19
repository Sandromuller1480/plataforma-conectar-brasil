import { useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  PackageSearch,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { NavLink, useParams } from "react-router-dom";
import {
  Badge,
  Button,
  EmptyState,
  Metric,
  PageTitle,
  money,
  shortDate,
} from "../../components/ui";
import type { LeadStage, TicketMessage } from "../../domain/types";
import { useDemo } from "../../services/DemoContext";

const menu = [
  ["Dashboard", "/crm/dashboard", LayoutDashboard],
  ["Leads", "/crm/leads", BriefcaseBusiness],
  ["Clientes", "/crm/clientes", Users],
  ["Contratos", "/crm/contratos", ClipboardList],
  ["Agenda", "/crm/agenda", CalendarDays],
  ["Ordens de serviço", "/crm/ordens", PackageSearch],
  ["Chamados", "/crm/chamados", MessageSquareText],
  ["Financeiro", "/crm/financeiro", CircleDollarSign],
  ["Avisos", "/crm/avisos", Bell],
  ["Catálogo", "/crm/catalogo", BookOpen],
  ["Conteúdo", "/crm/conteudo", FileBarChart],
  ["Relatórios", "/crm/relatorios", BarChart3],
  ["Configurações", "/crm/configuracoes", Settings],
] as const;

export function CrmLayout({ children }: { children: React.ReactNode }) {
  const { state, repository } = useDemo();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  return (
    <div className={`crm-shell ${collapsed ? "collapsed" : ""}`}>
      <aside className={mobile ? "crm-sidebar mobile-open" : "crm-sidebar"}>
        <div className="crm-brand">
          <img
            src={
              collapsed
                ? "/assets/brand/icone-conectar.png"
                : "/assets/brand/logo-conectar-branco.png"
            }
            alt="Conectar Brasil"
          />
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Recolher menu"
          >
            <ChevronLeft />
          </button>
        </div>
        <nav>
          {menu.map(([label, path, Icon]) => (
            <NavLink key={path} to={path} onClick={() => setMobile(false)}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="crm-content">
        <header className="crm-topbar">
          <button
            className="mobile-sidebar-button"
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
          <div>
            <span className="demo-dot" /> Modo demonstrativo
          </div>
          <label>
            Perfil
            <select
              value={state.presentation.profile}
              onChange={(e) =>
                repository.setPresentation({
                  profile: e.target.value as typeof state.presentation.profile,
                })
              }
            >
              {[
                "Administrador",
                "Comercial",
                "Atendimento",
                "Financeiro",
                "Técnico",
                "Cliente",
              ].map((profile) => (
                <option key={profile}>{profile}</option>
              ))}
            </select>
          </label>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

const byText = (values: unknown[], query: string) =>
  values.join(" ").toLowerCase().includes(query.toLowerCase());

export function DashboardPage() {
  const { state } = useDemo();
  const invoices = Object.values(state.invoices);
  const billed = invoices.reduce((sum, item) => sum + item.amountCents, 0);
  const received = invoices
    .filter((i) => i.status === "Paga")
    .reduce((sum, item) => sum + item.amountCents, 0);
  const overdue = invoices
    .filter((i) => i.status === "Vencida")
    .reduce((sum, item) => sum + item.amountCents, 0);
  const stages: LeadStage[] = [
    "Novo",
    "Em contato",
    "Análise técnica",
    "Proposta",
    "Aprovado",
    "Perdido",
  ];
  return (
    <>
      <PageTitle eyebrow="Visão geral" title="Operação em um só lugar">
        Indicadores calculados em tempo real a partir dos registros da
        demonstração.
      </PageTitle>
      <div className="toolbar">
        <select aria-label="Período do dashboard" defaultValue="Todo o cenário">
          <option>Todo o cenário</option>
          <option>Últimos 30 dias</option>
          <option>Próximos 30 dias</option>
        </select>
      </div>
      <div className="metrics-grid">
        <Metric
          label="Leads ativos"
          value={String(
            Object.values(state.leads).filter(
              (l) => !["Aprovado", "Perdido"].includes(l.stage),
            ).length,
          )}
          detail={`${Object.keys(state.leads).length} no total`}
        />
        <Metric
          label="Instalações pendentes"
          value={String(
            Object.values(state.contracts).filter(
              (c) => c.status === "Em instalação",
            ).length,
          )}
          detail="Contratos em andamento"
        />
        <Metric
          label="Chamados abertos"
          value={String(
            Object.values(state.tickets).filter((t) => t.status !== "Resolvido")
              .length,
          )}
          detail="Fila atual"
        />
        <Metric
          label="Faturado"
          value={money(billed)}
          detail={`Recebido ${money(received)}`}
        />
        <Metric
          label="Vencido"
          value={money(overdue)}
          detail="Somente faturas não pagas"
        />
      </div>
      <div className="dashboard-grid">
        <section className="crm-panel">
          <div className="panel-title">
            <h2>Funil comercial</h2>
            <Badge>Atualizado agora</Badge>
          </div>
          <div className="funnel-chart">
            {stages.map((stage) => {
              const count = Object.values(state.leads).filter(
                (l) => l.stage === stage,
              ).length;
              return (
                <div key={stage}>
                  <span>{stage}</span>
                  <i style={{ width: `${Math.max(12, count * 18)}%` }} />
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </section>
        <section className="crm-panel">
          <div className="panel-title">
            <h2>Atividade recente</h2>
          </div>
          <div className="activity-list">
            {state.audit.length ? (
              state.audit.slice(0, 6).map((event) => (
                <div key={event.id}>
                  <span className="activity-dot" />
                  <div>
                    <strong>{event.action}</strong>
                    <small>
                      {event.author} · {event.entity}
                    </small>
                  </div>
                  <time>{shortDate(event.createdAt)}</time>
                </div>
              ))
            ) : (
              <EmptyState
                title="Sem ações recentes"
                text="Interaja com os fluxos para alimentar a auditoria."
              />
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export function LeadsPage() {
  const { state, repository } = useDemo();
  const { id: routeId } = useParams();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [selected, setSelected] = useState<string | null>(
    routeId && state.leads[routeId] ? routeId : null,
  );
  const stages: LeadStage[] = [
    "Novo",
    "Em contato",
    "Análise técnica",
    "Proposta",
    "Aprovado",
    "Perdido",
  ];
  const leads = Object.values(state.leads).filter((l) =>
    byText([l.name, l.protocol, l.email, l.stage], query),
  );
  const lead = selected ? state.leads[selected] : undefined;
  const move = (leadId: string, stage: LeadStage) => {
    let reason: string | undefined;
    if (stage === "Perdido") {
      reason = window.prompt("Motivo obrigatório da perda:") ?? undefined;
      if (!reason) return;
    }
    repository.moveLead(leadId, stage, reason);
  };
  return (
    <>
      <PageTitle eyebrow="Comercial" title="Leads e oportunidades">
        Acompanhe o funil, converta uma única vez e preserve o histórico.
      </PageTitle>
      <div className="toolbar">
        <label className="search-box">
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nome, protocolo ou etapa"
          />
        </label>
        <div className="segmented">
          <button
            className={view === "kanban" ? "active" : ""}
            onClick={() => setView("kanban")}
          >
            Kanban
          </button>
          <button
            className={view === "lista" ? "active" : ""}
            onClick={() => setView("lista")}
          >
            Lista
          </button>
        </div>
      </div>
      {view === "kanban" ? (
        <div className="kanban">
          {stages.map((stage) => (
            <section key={stage}>
              <header>
                <strong>{stage}</strong>
                <Badge>{leads.filter((l) => l.stage === stage).length}</Badge>
              </header>
              {leads
                .filter((l) => l.stage === stage)
                .map((item) => (
                  <article key={item.id} onClick={() => setSelected(item.id)}>
                    <strong>{item.name}</strong>
                    <small>{item.protocol}</small>
                    <span>
                      {state.plans[item.planId].speedMbps} Mbps · {item.origin}
                    </span>
                    <div>
                      <button
                        disabled={stages.indexOf(stage) === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          move(item.id, stages[stages.indexOf(stage) - 1]);
                        }}
                      >
                        <ChevronLeft />
                      </button>
                      <button
                        disabled={stages.indexOf(stage) === stages.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          move(item.id, stages[stages.indexOf(stage) + 1]);
                        }}
                      >
                        <ChevronRight />
                      </button>
                    </div>
                  </article>
                ))}
            </section>
          ))}
        </div>
      ) : (
        <DataTable
          headers={["Lead", "Protocolo", "Plano", "Etapa", "Origem"]}
          rows={leads.map((item) => [
            item.name,
            item.protocol,
            state.plans[item.planId].name,
            <Badge key="s">{item.stage}</Badge>,
            item.origin,
          ])}
          onRow={(index) => setSelected(leads[index].id)}
        />
      )}
      {lead && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside className="record-drawer" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setSelected(null)}>
              <X />
            </button>
            <Badge>{lead.origin}</Badge>
            <h2>{lead.name}</h2>
            <p>{lead.protocol}</p>
            <dl>
              <div>
                <dt>E-mail</dt>
                <dd>{lead.email}</dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>{lead.phone}</dd>
              </div>
              <div>
                <dt>Endereço</dt>
                <dd>
                  {lead.address.street}, {lead.address.number}
                </dd>
              </div>
              <div>
                <dt>Cobertura</dt>
                <dd>{lead.address.coverage}</dd>
              </div>
            </dl>
            <Button
              disabled={Boolean(lead.convertedContractId)}
              onClick={() => repository.convertLead(lead.id)}
            >
              {lead.convertedContractId
                ? "Lead já convertido"
                : "Converter em cliente e contrato"}
            </Button>
          </aside>
        </div>
      )}
    </>
  );
}

function DataTable({
  headers,
  rows,
  onRow,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  onRow?: (index: number) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} onClick={() => onRow?.(index)}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ClientsPage() {
  const { state } = useDemo();
  const { id: routeId } = useParams();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(
    routeId && state.clients[routeId] ? routeId : null,
  );
  const clients = Object.values(state.clients).filter((c) =>
    byText([c.name, c.email, c.phone], query),
  );
  const client = selected ? state.clients[selected] : undefined;
  const contracts = client
    ? Object.values(state.contracts).filter((c) => c.clientId === client.id)
    : [];
  return (
    <>
      <PageTitle eyebrow="Relacionamento" title="Clientes">
        Uma visão unificada de contatos, unidades e registros relacionados.
      </PageTitle>
      <label className="search-box">
        <Search />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar clientes"
        />
      </label>
      <DataTable
        headers={["Cliente", "Contato", "Unidades", "Contratos"]}
        rows={clients.map((c) => [
          c.name,
          c.email,
          String(c.addresses.length),
          String(
            Object.values(state.contracts).filter((x) => x.clientId === c.id)
              .length,
          ),
        ])}
        onRow={(i) => setSelected(clients[i].id)}
      />
      {client && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside
            className="record-drawer wide"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="drawer-close" onClick={() => setSelected(null)}>
              <X />
            </button>
            <Badge tone="success">Cliente demo</Badge>
            <h2>{client.name}</h2>
            <p>
              {client.email} · {client.phone}
            </p>
            <h3>Contratos e unidades</h3>
            {contracts.map((contract) => (
              <article className="mini-record" key={contract.id}>
                <strong>{state.plans[contract.planId].name}</strong>
                <span>
                  {contract.status} · {money(contract.agreedPriceCents)}
                </span>
              </article>
            ))}
            <h3>Resumo relacionado</h3>
            <p>
              {
                Object.values(state.invoices).filter((i) =>
                  contracts.some((c) => c.id === i.contractId),
                ).length
              }{" "}
              faturas ·{" "}
              {
                Object.values(state.tickets).filter((t) =>
                  contracts.some((c) => c.id === t.contractId),
                ).length
              }{" "}
              chamados
            </p>
          </aside>
        </div>
      )}
    </>
  );
}

export function ContractsPage() {
  const { state } = useDemo();
  const contracts = Object.values(state.contracts);
  return (
    <>
      <PageTitle eyebrow="Operação" title="Contratos">
        Valores acordados permanecem preservados mesmo após alterações no
        catálogo.
      </PageTitle>
      <DataTable
        headers={[
          "Contrato",
          "Cliente",
          "Plano",
          "Valor acordado",
          "Status",
          "Instalação",
        ]}
        rows={contracts.map((c) => [
          c.id,
          state.clients[c.clientId].name,
          state.plans[c.planId].name,
          money(c.agreedPriceCents),
          <Badge key="s" tone={c.status === "Ativo" ? "success" : "warning"}>
            {c.status}
          </Badge>,
          c.installationStep,
        ])}
      />
    </>
  );
}

export function OrdersPage({ agenda = false }: { agenda?: boolean }) {
  const { state, repository } = useDemo();
  const [error, setError] = useState("");
  const orders = Object.values(state.workOrders).sort((a, b) =>
    a.scheduledAt.localeCompare(b.scheduledAt),
  );
  const updateDate = (id: string, value: string) => {
    try {
      repository.updateWorkOrder(id, { scheduledAt: value });
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <>
      <PageTitle
        eyebrow={agenda ? "Planejamento" : "Campo"}
        title={agenda ? "Agenda técnica" : "Ordens de serviço"}
      >
        {agenda
          ? "Reagendamentos atualizam a jornada do cliente e bloqueiam conflitos."
          : "Checklist e pendências controlam a conclusão simulada."}
      </PageTitle>
      {error && <p className="error-message">{error}</p>}
      <div className="orders-grid">
        {orders.map((order) => (
          <article className="crm-panel" key={order.id}>
            <div className="panel-title">
              <Badge
                tone={order.status === "Concluída" ? "success" : "warning"}
              >
                {order.status}
              </Badge>
              <small>{order.id}</small>
            </div>
            <h3>
              {state.clients[state.contracts[order.contractId].clientId].name}
            </h3>
            <p>{state.plans[state.contracts[order.contractId].planId].name}</p>
            <label>
              Agendamento
              <input
                type="datetime-local"
                value={order.scheduledAt.slice(0, 16)}
                onChange={(e) => updateDate(order.id, e.target.value + ":00")}
              />
            </label>
            <p>
              <strong>{order.technician}</strong>
            </p>
            {!agenda && (
              <>
                <div className="checklist">
                  {order.checklist.map((entry, index) => (
                    <label key={entry.label}>
                      <input
                        type="checkbox"
                        checked={entry.done}
                        onChange={() =>
                          repository.updateWorkOrder(order.id, {
                            checklist: order.checklist.map((item, i) =>
                              i === index
                                ? { ...item, done: !item.done }
                                : item,
                            ),
                          })
                        }
                      />
                      {entry.label}
                    </label>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    try {
                      repository.updateWorkOrder(order.id, {
                        status: "Concluída",
                      });
                      setError("");
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Concluir instalação
                </Button>
              </>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

export function TicketsPage() {
  const { state, repository } = useDemo();
  const [selected, setSelected] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] =
    useState<TicketMessage["visibility"]>("Pública");
  const tickets = Object.values(state.tickets);
  const ticket = selected ? state.tickets[selected] : undefined;
  const send = () => {
    if (ticket) {
      repository.addTicketMessage(ticket.id, body, visibility);
      setBody("");
    }
  };
  return (
    <>
      <PageTitle eyebrow="Atendimento" title="Fila de chamados">
        Mensagens públicas e notas internas são separadas rigorosamente.
      </PageTitle>
      <DataTable
        headers={[
          "Protocolo",
          "Cliente",
          "Categoria",
          "Prioridade",
          "Responsável",
          "Status",
        ]}
        rows={tickets.map((t) => [
          t.protocol,
          state.clients[state.contracts[t.contractId].clientId].name,
          t.category,
          <Badge key="p" tone={t.priority === "Alta" ? "danger" : "neutral"}>
            {t.priority}
          </Badge>,
          t.assignee ?? "Não atribuído",
          t.status,
        ])}
        onRow={(i) => setSelected(tickets[i].id)}
      />
      {ticket && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside
            className="record-drawer wide"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="drawer-close" onClick={() => setSelected(null)}>
              <X />
            </button>
            <Badge tone={ticket.priority === "Alta" ? "danger" : "warning"}>
              {ticket.status}
            </Badge>
            <h2>{ticket.category}</h2>
            <p>{ticket.description}</p>
            <div className="drawer-controls">
              <select
                value={ticket.assignee ?? ""}
                onChange={(e) =>
                  repository.updateTicket(ticket.id, {
                    assignee: e.target.value,
                    status: "Em atendimento",
                  })
                }
              >
                <option value="">Atribuir</option>
                <option>Equipe Atendimento</option>
                <option>Equipe Técnica</option>
              </select>
              <select
                value={ticket.status}
                onChange={(e) =>
                  repository.updateTicket(ticket.id, {
                    status: e.target.value as typeof ticket.status,
                  })
                }
              >
                <option>Aberto</option>
                <option>Em atendimento</option>
                <option>Aguardando visita</option>
                <option>Resolvido</option>
              </select>
            </div>
            <div className="crm-messages">
              {ticket.messages.map((m) => (
                <article
                  className={m.visibility === "Interna" ? "internal" : ""}
                  key={m.id}
                >
                  <Badge
                    tone={m.visibility === "Interna" ? "warning" : "success"}
                  >
                    {m.visibility}
                  </Badge>
                  <strong>{m.author}</strong>
                  <p>{m.body}</p>
                </article>
              ))}
            </div>
            <div className="compose-admin">
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as TicketMessage["visibility"])
                }
              >
                <option>Pública</option>
                <option>Interna</option>
              </select>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  visibility === "Interna"
                    ? "Nota visível somente no CRM"
                    : "Resposta que aparecerá no aplicativo"
                }
              />
              <Button onClick={send}>Adicionar</Button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export function FinancePage() {
  const { state, repository } = useDemo();
  const [status, setStatus] = useState("Todos");
  const invoices = Object.values(state.invoices).filter(
    (i) => status === "Todos" || i.status === status,
  );
  const total = (key: string) =>
    Object.values(state.invoices)
      .filter((i) => key === "Faturado" || i.status === key)
      .reduce((s, i) => s + i.amountCents, 0);
  return (
    <>
      <PageTitle eyebrow="Financeiro" title="Faturas e recebimentos">
        Recebido corresponde somente a pagamentos demonstrativos concluídos.
      </PageTitle>
      <div className="metrics-grid">
        <Metric label="Faturado" value={money(total("Faturado"))} />
        <Metric label="Recebido" value={money(total("Paga"))} />
        <Metric label="Vencido" value={money(total("Vencida"))} />
      </div>
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Todos</option>
          <option>Em aberto</option>
          <option>Vencida</option>
          <option>Paga</option>
        </select>
      </div>
      <DataTable
        headers={["Fatura", "Cliente", "Vencimento", "Valor", "Status", "Ação"]}
        rows={invoices.map((i) => [
          i.id,
          state.clients[state.contracts[i.contractId].clientId].name,
          shortDate(i.dueDate),
          money(i.amountCents),
          <Badge
            key="s"
            tone={
              i.status === "Paga"
                ? "success"
                : i.status === "Vencida"
                  ? "danger"
                  : "warning"
            }
          >
            {i.status}
          </Badge>,
          <Button
            key="a"
            variant="ghost"
            disabled={i.status === "Paga"}
            onClick={(e) => {
              e.stopPropagation();
              repository.payInvoice(i.id);
            }}
          >
            Simular baixa
          </Button>,
        ])}
      />
    </>
  );
}

export function CatalogPage() {
  const { state, repository } = useDemo();
  const [saved, setSaved] = useState("");
  return (
    <>
      <PageTitle eyebrow="Administração" title="Catálogo de planos">
        Alterações afetam novas ofertas; contratos existentes mantêm o valor
        acordado.
      </PageTitle>
      <div className="orders-grid">
        {Object.values(state.plans).map((plan) => (
          <form
            className="crm-panel form-stack"
            key={plan.id}
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              repository.updatePlan(plan.id, {
                name: String(data.get("name")),
                priceCents: Math.round(Number(data.get("price")) * 100),
                active: data.get("active") === "on",
              });
              setSaved(`Plano ${plan.id} atualizado.`);
            }}
          >
            <label>
              Nome
              <input name="name" defaultValue={plan.name} />
            </label>
            <label>
              Velocidade
              <input value={`${plan.speedMbps} Mbps`} disabled />
            </label>
            <label>
              Preço mensal
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={(plan.priceCents / 100).toFixed(2)}
              />
            </label>
            <label className="inline-check">
              <input
                name="active"
                type="checkbox"
                defaultChecked={plan.active}
              />{" "}
              Oferta ativa
            </label>
            <Button type="submit">Salvar plano</Button>
          </form>
        ))}
      </div>
      {saved && <p className="success-message">{saved}</p>}
    </>
  );
}

export function NoticesAdminPage() {
  const { state } = useDemo();
  return (
    <>
      <PageTitle eyebrow="Comunicação" title="Avisos segmentados">
        Comunicados ativos por público e contrato demonstrativo.
      </PageTitle>
      <DataTable
        headers={["Título", "Público", "Publicação", "Conteúdo"]}
        rows={Object.values(state.notices).map((n) => [
          n.title,
          n.audience,
          shortDate(n.publishedAt),
          n.body,
        ])}
      />
      <p className="helper-text">
        A edição estrutural de avisos está representada pelos registros ativos;
        integrações de envio externo não fazem parte deste protótipo.
      </p>
    </>
  );
}

function downloadCsv(name: string, rows: string[][]) {
  const content = [
    "DADOS DEMONSTRATIVOS",
    ...rows.map((r) =>
      r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(";"),
    ),
  ].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function ReportsPage() {
  const { state } = useDemo();
  return (
    <>
      <PageTitle eyebrow="Inteligência" title="Relatórios demonstrativos">
        Exportações refletem o estado atual e são identificadas como dados de
        teste.
      </PageTitle>
      <div className="report-grid">
        <article className="crm-panel">
          <FileBarChart />
          <h2>Leads por etapa</h2>
          <p>{Object.keys(state.leads).length} registros no funil atual.</p>
          <Button
            onClick={() =>
              downloadCsv("leads-demonstrativos.csv", [
                ["Protocolo", "Nome", "Etapa"],
                ...Object.values(state.leads).map((l) => [
                  l.protocol,
                  l.name,
                  l.stage,
                ]),
              ])
            }
          >
            Exportar CSV
          </Button>
        </article>
        <article className="crm-panel">
          <CircleDollarSign />
          <h2>Resumo financeiro</h2>
          <p>
            {Object.keys(state.invoices).length} faturas no período
            demonstrativo.
          </p>
          <Button
            onClick={() =>
              downloadCsv("faturas-demonstrativas.csv", [
                ["ID", "Status", "Valor centavos"],
                ...Object.values(state.invoices).map((i) => [
                  i.id,
                  i.status,
                  String(i.amountCents),
                ]),
              ])
            }
          >
            Exportar CSV
          </Button>
        </article>
      </div>
    </>
  );
}

export function ContentPage() {
  return (
    <>
      <PageTitle eyebrow="Conteúdo" title="Portal e ajuda">
        Textos públicos alinhados aos limites desta demonstração.
      </PageTitle>
      <div className="orders-grid">
        <article className="crm-panel">
          <h2>Banner principal</h2>
          <p>Conexão que acompanha o seu próximo passo.</p>
          <Badge tone="success">Publicado</Badge>
        </article>
        <article className="crm-panel">
          <h2>Perguntas frequentes</h2>
          <p>3 respostas ativas sobre cobertura, valores e pagamento.</p>
          <Badge tone="success">Publicado</Badge>
        </article>
        <article className="crm-panel">
          <h2>Contato</h2>
          <p>
            Atendimento demonstrativo interno, sem canais externos oficiais.
          </p>
          <Badge tone="warning">A confirmar</Badge>
        </article>
      </div>
    </>
  );
}

export function SettingsPage() {
  const { state } = useDemo();
  return (
    <>
      <PageTitle eyebrow="Configurações" title="Ambiente da apresentação">
        Controles visuais não representam autenticação ou permissão segura.
      </PageTitle>
      <div className="settings-list">
        <article className="crm-panel">
          <h2>Perfil ativo</h2>
          <p>{state.presentation.profile}</p>
          <Badge>Seletor demonstrativo</Badge>
        </article>
        <article className="crm-panel">
          <h2>Persistência</h2>
          <p>
            LocalStorage com schema versão {state.schemaVersion}, sincronizado
            entre abas da mesma origem.
          </p>
          <Badge tone="success">Ativa</Badge>
        </article>
        <article className="crm-panel">
          <h2>Integrações externas</h2>
          <p>
            Supabase, ERP, cobrança, WhatsApp e infraestrutura de rede não estão
            conectados.
          </p>
          <Badge tone="warning">Fase futura</Badge>
        </article>
      </div>
    </>
  );
}
