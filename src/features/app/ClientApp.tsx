import { useState, type FormEvent } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  Download,
  FileText,
  Headphones,
  Home,
  MapPin,
  PackageCheck,
  ReceiptText,
  Send,
  Settings2,
  Wifi,
} from "lucide-react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  Button,
  EmptyState,
  PageTitle,
  money,
  shortDate,
} from "../../components/ui";
import { useDemo } from "../../services/DemoContext";
import { publicTicketMessages } from "../../services/demoRepository";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { state, repository } = useDemo();
  const client = state.clients[state.presentation.clientId];
  const contracts = Object.values(state.contracts).filter(
    (contract) => contract.clientId === client.id,
  );
  return (
    <div className="client-shell">
      <header className="client-header">
        <div>
          <img src="/assets/brand/icone-conectar.png" alt="Conectar Brasil" />
          <div>
            <small>Olá,</small>
            <strong>{client.name.split(" ")[0]}</strong>
          </div>
        </div>
        <Link to="/app/avisos" aria-label="Avisos">
          <Bell />
        </Link>
      </header>
      <div className="context-bar">
        <label>
          Cliente demonstrativo
          <select
            value={client.id}
            onChange={(event) =>
              repository.setPresentation({ clientId: event.target.value })
            }
          >
            {Object.values(state.clients).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Unidade / contrato
          <select
            value={state.presentation.contractId}
            onChange={(event) =>
              repository.setPresentation({ contractId: event.target.value })
            }
          >
            {contracts.map((contract) => {
              const address = client.addresses.find(
                (item) => item.id === contract.addressId,
              );
              return (
                <option key={contract.id} value={contract.id}>
                  {address?.label} · {address?.street}
                </option>
              );
            })}
          </select>
        </label>
      </div>
      <main className="client-main">{children}</main>
      <nav className="bottom-nav">
        <NavLink to="/app/inicio">
          <Home />
          Início
        </NavLink>
        <NavLink to="/app/faturas">
          <ReceiptText />
          Faturas
        </NavLink>
        <NavLink to="/app/suporte">
          <Headphones />
          Suporte
        </NavLink>
        <NavLink to="/app/perfil">
          <CircleUserRound />
          Perfil
        </NavLink>
      </nav>
    </div>
  );
}

function currentData() {
  const { state, repository } = useDemo();
  const contract = state.contracts[state.presentation.contractId];
  const client = state.clients[contract.clientId];
  const plan = state.plans[contract.planId];
  const address = client.addresses.find(
    (item) => item.id === contract.addressId,
  )!;
  return { state, repository, contract, client, plan, address };
}

export function ClientHome() {
  const { state, contract, client, plan } = currentData();
  const invoices = Object.values(state.invoices).filter(
    (item) => item.contractId === contract.id,
  );
  const next = invoices
    .filter((item) => item.status !== "Paga")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const notices = Object.values(state.notices).filter(
    (notice) =>
      notice.audience === "Todos" ||
      notice.audience === contract.id ||
      notice.audience === "Campo Verde - MT",
  );
  return (
    <>
      <section className="app-hero">
        <Badge tone="success">Ambiente demonstrativo</Badge>
        <h1>Bom ter você aqui, {client.name.split(" ")[0]}.</h1>
        <p>Veja o que está acontecendo com sua unidade selecionada.</p>
      </section>
      <div className="app-grid">
        <article className="app-card plan-summary">
          <div>
            <small>Seu plano</small>
            <h2>{plan.name}</h2>
            <strong>{plan.speedMbps} Mbps</strong>
          </div>
          <Wifi />
          <div className="status-pair">
            <span>
              Status do contrato{" "}
              <Badge tone={contract.status === "Ativo" ? "success" : "warning"}>
                {contract.status}
              </Badge>
            </span>
            <span>
              Status da conexão <Badge>{contract.connectionStatus}</Badge>
            </span>
          </div>
          <Link to="/app/plano">
            Ver meu plano <ChevronRight />
          </Link>
        </article>
        {next && (
          <article className="app-card">
            <div className="card-icon">
              <CreditCard />
            </div>
            <small>Próxima fatura</small>
            <h2>{money(next.amountCents)}</h2>
            <p>Vencimento em {shortDate(next.dueDate)}</p>
            <Link
              className="button button-primary"
              to={`/app/faturas/${next.id}`}
            >
              Ver detalhes
            </Link>
          </article>
        )}
        {contract.status === "Em instalação" && (
          <article className="app-card">
            <div className="card-icon">
              <PackageCheck />
            </div>
            <small>Instalação em andamento</small>
            <h2>{contract.installationStep}</h2>
            <p>Acompanhe as etapas atualizadas pela equipe.</p>
            <Link to="/app/instalacao">
              Acompanhar <ChevronRight />
            </Link>
          </article>
        )}
      </div>
      <section className="quick-links">
        <Link to="/app/suporte">
          <Headphones />
          Abrir suporte
        </Link>
        <Link to="/app/documentos">
          <FileText />
          Documentos
        </Link>
        <Link to="/app/avisos">
          <Bell />
          Avisos
        </Link>
      </section>
      <section className="notice-strip">
        <strong>{notices[0]?.title}</strong>
        <p>{notices[0]?.body}</p>
      </section>
    </>
  );
}

export function ClientPlan() {
  const { repository, contract, plan, address } = currentData();
  const [message, setMessage] = useState("");
  const request = (category: string) => {
    const ticket = repository.createServiceRequest(
      contract.id,
      category,
      `Solicitação de ${category.toLowerCase()} para análise. Nenhuma alteração contratual foi aplicada automaticamente.`,
    );
    setMessage(`Solicitação registrada: ${ticket.protocol}`);
  };
  return (
    <>
      <PageTitle eyebrow="Meu plano" title={`${plan.speedMbps} Mbps`}>
        {plan.name}
      </PageTitle>
      <article className="app-card detail-card">
        <dl>
          <div>
            <dt>Valor contratado</dt>
            <dd>{money(contract.agreedPriceCents)}/mês</dd>
          </div>
          <div>
            <dt>Status do contrato</dt>
            <dd>{contract.status}</dd>
          </div>
          <div>
            <dt>Unidade</dt>
            <dd>
              {address.street}, {address.number} — {address.district}
            </dd>
          </div>
          <div>
            <dt>Conexão</dt>
            <dd>{contract.connectionStatus}</dd>
          </div>
        </dl>
      </article>
      <section>
        <h2>Solicitações</h2>
        <div className="request-grid">
          {["Upgrade de plano", "Mudança de endereço", "Cancelamento"].map(
            (label) => (
              <button key={label} onClick={() => request(label)}>
                <Settings2 />
                <span>
                  <strong>{label}</strong>
                  <small>Sujeito à análise</small>
                </span>
                <ChevronRight />
              </button>
            ),
          )}
        </div>
        {message && <p className="success-message">{message}</p>}
      </section>
    </>
  );
}

export function InstallationPage() {
  const { state, contract } = currentData();
  const order = Object.values(state.workOrders).find(
    (item) => item.contractId === contract.id,
  );
  const steps = ["Análise", "Agendamento", "Visita", "Ativação", "Concluída"];
  const current = steps.indexOf(contract.installationStep);
  return (
    <>
      <PageTitle eyebrow="Instalação" title="Acompanhe cada etapa">
        As informações refletem ações simuladas no CRM e na agenda técnica.
      </PageTitle>
      <ol className="timeline">
        {steps.map((step, index) => (
          <li className={index <= current ? "done" : ""} key={step}>
            <span>{index < current ? <CheckCircle2 /> : index + 1}</span>
            <div>
              <strong>{step}</strong>
              <p>
                {index === current
                  ? "Etapa atual da sua instalação demonstrativa."
                  : index < current
                    ? "Etapa registrada como concluída."
                    : "Aguardando avanço da equipe."}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {order && (
        <article className="app-card">
          <small>Próxima visita</small>
          <h2>{shortDate(order.scheduledAt)}</h2>
          <p>Responsável: {order.technician}</p>
          <Badge tone="warning">{order.status}</Badge>
        </article>
      )}
    </>
  );
}

export function InvoicesPage() {
  const { state, contract } = currentData();
  const invoices = Object.values(state.invoices)
    .filter((item) => item.contractId === contract.id)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  return (
    <>
      <PageTitle eyebrow="Financeiro" title="Suas faturas">
        Cobranças e pagamentos desta área são exclusivamente demonstrativos.
      </PageTitle>
      <div className="filter-pills">
        <Badge tone="danger">
          {invoices.filter((i) => i.status === "Vencida").length} vencida(s)
        </Badge>
        <Badge tone="warning">
          {invoices.filter((i) => i.status === "Em aberto").length} em aberto
        </Badge>
        <Badge tone="success">
          {invoices.filter((i) => i.status === "Paga").length} paga(s)
        </Badge>
      </div>
      <div className="list-stack">
        {invoices.map((invoice) => (
          <Link
            className="list-item"
            to={`/app/faturas/${invoice.id}`}
            key={invoice.id}
          >
            <div>
              <strong>{shortDate(invoice.dueDate)}</strong>
              <small>Fatura {invoice.id}</small>
            </div>
            <div>
              <strong>{money(invoice.amountCents)}</strong>
              <Badge
                tone={
                  invoice.status === "Paga"
                    ? "success"
                    : invoice.status === "Vencida"
                      ? "danger"
                      : "warning"
                }
              >
                {invoice.status}
              </Badge>
            </div>
            <ChevronRight />
          </Link>
        ))}
      </div>
    </>
  );
}

export function InvoiceDetail() {
  const { id } = useParams();
  const { state, repository, contract } = currentData();
  const invoice = id ? state.invoices[id] : undefined;
  const [notice, setNotice] = useState("");
  if (!invoice || invoice.contractId !== contract.id)
    return (
      <EmptyState
        title="Fatura não encontrada"
        text="Este registro não pertence ao contrato selecionado."
      />
    );
  const pay = () => {
    if (
      !window.confirm(
        "Registrar pagamento demonstrativo? Nenhuma cobrança real será realizada.",
      )
    )
      return;
    const result = repository.payInvoice(invoice.id);
    setNotice(
      result.status === "Paga"
        ? "Pagamento demonstrativo registrado. Novas tentativas não duplicam a baixa."
        : "",
    );
  };
  const download = () => {
    const blob = new Blob(
      [
        `DEMONSTRATIVO SEM VALOR FISCAL\nFatura: ${invoice.id}\nValor: ${money(invoice.amountCents)}\nStatus: ${invoice.status}`,
      ],
      { type: "text/plain" },
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${invoice.id}-demonstrativo.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return (
    <>
      <PageTitle
        eyebrow="Detalhes da fatura"
        title={money(invoice.amountCents)}
      >
        Documento demonstrativo, sem código de pagamento válido.
      </PageTitle>
      <article className="app-card detail-card">
        <dl>
          <div>
            <dt>Vencimento</dt>
            <dd>{shortDate(invoice.dueDate)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <Badge
                tone={
                  invoice.status === "Paga"
                    ? "success"
                    : invoice.status === "Vencida"
                      ? "danger"
                      : "warning"
                }
              >
                {invoice.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt>Identificador</dt>
            <dd>{invoice.id}</dd>
          </div>
          {invoice.paidAt && (
            <div>
              <dt>Baixa registrada</dt>
              <dd>{shortDate(invoice.paidAt)}</dd>
            </div>
          )}
        </dl>
      </article>
      <div className="stack-actions">
        <Button onClick={pay} disabled={invoice.status === "Paga"}>
          {invoice.status === "Paga"
            ? "Pagamento já simulado"
            : "Simular pagamento"}
        </Button>
        <Button variant="secondary" onClick={download}>
          <Download /> Baixar demonstrativo de teste
        </Button>
      </div>
      {notice && <p className="success-message">{notice}</p>}
    </>
  );
}

export function SupportPage() {
  const { state, repository, contract } = currentData();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const tickets = Object.values(state.tickets)
    .filter((item) => item.contractId === contract.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const ticket = repository.openTicket(
      contract.id,
      String(data.get("category")),
      String(data.get("description")),
    );
    navigate(`/app/suporte/${ticket.id}`);
  };
  return (
    <>
      <PageTitle eyebrow="Suporte" title="Como podemos ajudar?">
        Anexos não são armazenados nesta demonstração; não envie arquivos
        pessoais.
      </PageTitle>
      <Button onClick={() => setOpen(!open)}>
        {open ? "Fechar formulário" : "Abrir novo chamado"}
      </Button>
      {open && (
        <form className="app-card form-stack" onSubmit={submit}>
          <label>
            Categoria
            <select name="category">
              <option>Conectividade demonstrativa</option>
              <option>Instalação</option>
              <option>Financeiro</option>
              <option>Outro</option>
            </select>
          </label>
          <label>
            Descrição
            <textarea
              name="description"
              minLength={10}
              required
              placeholder="Descreva o cenário usando dados fictícios."
            />
          </label>
          <label>
            Anexo demonstrativo
            <input
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              onChange={(e) => {
                if ((e.target.files?.[0]?.size ?? 0) > 2_000_000) {
                  alert("Limite demonstrativo: 2 MB.");
                  e.target.value = "";
                }
              }}
            />
            <small>
              O nome pode ser exibido, mas os bytes não serão persistidos.
            </small>
          </label>
          <Button type="submit">Criar chamado</Button>
        </form>
      )}
      <div className="list-stack">
        {tickets.length ? (
          tickets.map((ticket) => (
            <Link
              className="list-item"
              to={`/app/suporte/${ticket.id}`}
              key={ticket.id}
            >
              <div>
                <strong>{ticket.category}</strong>
                <small>{ticket.protocol}</small>
              </div>
              <Badge
                tone={ticket.status === "Resolvido" ? "success" : "warning"}
              >
                {ticket.status}
              </Badge>
              <ChevronRight />
            </Link>
          ))
        ) : (
          <EmptyState
            title="Nenhum chamado"
            text="Quando você precisar, abra uma solicitação por aqui."
          />
        )}
      </div>
    </>
  );
}

export function TicketDetail() {
  const { id } = useParams();
  const { state, repository, contract } = currentData();
  const ticket = id ? state.tickets[id] : undefined;
  const [body, setBody] = useState("");
  if (!ticket || ticket.contractId !== contract.id)
    return (
      <EmptyState
        title="Chamado não encontrado"
        text="Este registro não pertence ao contrato selecionado."
      />
    );
  const send = () => {
    repository.addTicketMessage(ticket.id, body, "Pública");
    setBody("");
  };
  return (
    <>
      <PageTitle eyebrow={ticket.protocol} title={ticket.category}>
        {ticket.description}
      </PageTitle>
      <Badge tone={ticket.status === "Resolvido" ? "success" : "warning"}>
        {ticket.status}
      </Badge>
      <div className="messages">
        {publicTicketMessages(ticket).map((message) => (
          <article key={message.id}>
            <strong>{message.author}</strong>
            <p>{message.body}</p>
            <small>{shortDate(message.createdAt)}</small>
          </article>
        ))}
      </div>
      <div className="message-compose">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva uma mensagem pública"
        />
        <Button
          onClick={send}
          disabled={!body.trim()}
          aria-label="Enviar mensagem"
        >
          <Send />
        </Button>
      </div>
      {ticket.status === "Resolvido" && (
        <Button
          variant="secondary"
          onClick={() =>
            repository.updateTicket(ticket.id, { status: "Aberto" })
          }
        >
          Reabrir chamado
        </Button>
      )}
    </>
  );
}

export function NoticesPage() {
  const { state, contract } = currentData();
  const notices = Object.values(state.notices).filter(
    (item) =>
      item.audience === "Todos" ||
      item.audience === contract.id ||
      item.audience === "Campo Verde - MT",
  );
  return (
    <>
      <PageTitle eyebrow="Comunicados" title="Avisos para você">
        Conteúdo segmentado para o contrato ou região demonstrativa.
      </PageTitle>
      <div className="list-stack">
        {notices.map((notice) => (
          <article className="app-card" key={notice.id}>
            <Badge>{shortDate(notice.publishedAt)}</Badge>
            <h2>{notice.title}</h2>
            <p>{notice.body}</p>
          </article>
        ))}
      </div>
    </>
  );
}

export function DocumentsPage() {
  const { contract } = currentData();
  return (
    <>
      <PageTitle eyebrow="Documentos" title="Arquivos do contrato">
        Documentos fiscais e de identidade reais não fazem parte desta
        demonstração.
      </PageTitle>
      <div className="list-stack">
        {[
          "Resumo do contrato demonstrativo",
          "Termo de instalação simulado",
        ].map((label) => (
          <article className="list-item" key={label}>
            <FileText />
            <div>
              <strong>{label}</strong>
              <small>Referência {contract.id}</small>
            </div>
            <Badge>Teste</Badge>
          </article>
        ))}
      </div>
    </>
  );
}

export function ProfilePage() {
  const { repository, client, address } = currentData();
  const [form, setForm] = useState({
    email: client.email,
    phone: client.phone,
  });
  const [saved, setSaved] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    repository.updateClient(client.id, form);
    setSaved(true);
  };
  return (
    <>
      <PageTitle eyebrow="Perfil" title={client.name}>
        Dados sintéticos do cliente selecionado.
      </PageTitle>
      <form className="app-card form-stack" onSubmit={submit}>
        <label>
          E-mail
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Telefone
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label>
          Endereço selecionado
          <input
            value={`${address.street}, ${address.number} — ${address.city}/${address.state}`}
            disabled
          />
        </label>
        <Button type="submit">Salvar contato</Button>
        {saved && (
          <p className="success-message">
            Contato atualizado também na visão do CRM.
          </p>
        )}
      </form>
      <p className="privacy-note">
        <MapPin /> As alterações permanecem apenas neste navegador e sincronizam
        entre abas da mesma origem.
      </p>
    </>
  );
}
