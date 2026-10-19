import { useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  Gauge,
  Headphones,
  MapPin,
  Menu,
  Network,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Badge, Button, PageTitle, money } from "../../components/ui";
import type { Address, Plan } from "../../domain/types";
import { useDemo } from "../../services/DemoContext";

const nav = [
  ["Planos", "/planos"],
  ["Cobertura", "/cobertura"],
  ["Empresas", "/empresas"],
  ["Sobre", "/sobre"],
  ["Ajuda", "/ajuda"],
] as const;

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="portal-container nav-wrap">
          <Link to="/" className="brand-link" aria-label="Conectar Brasil">
            <img
              src="/assets/brand/logo-conectar-colorido.png"
              alt="Conectar Brasil"
            />
          </Link>
          <nav
            className={open ? "portal-nav open" : "portal-nav"}
            aria-label="Navegação principal"
          >
            {nav.map(([label, path]) => (
              <NavLink key={path} to={path} onClick={() => setOpen(false)}>
                {label}
              </NavLink>
            ))}
            <Link to="/app/inicio" className="button button-secondary">
              Área do cliente
            </Link>
            <Link to="/contratar" className="button button-primary">
              Quero contratar
            </Link>
          </nav>
          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-label="Alternar menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="portal-footer">
        <div className="portal-container footer-grid">
          <div>
            <img
              src="/assets/brand/logo-conectar-branco.png"
              alt="Conectar Brasil"
            />
            <p>
              Internet para aproximar possibilidades. Protótipo comercial com
              dados inteiramente demonstrativos.
            </p>
          </div>
          <div>
            <strong>Navegue</strong>
            <Link to="/planos">Planos</Link>
            <Link to="/cobertura">Cobertura</Link>
            <Link to="/status">Status</Link>
          </div>
          <div>
            <strong>Atendimento</strong>
            <Link to="/contato">Contato demonstrativo</Link>
            <Link to="/ajuda">Central de ajuda</Link>
            <span>Campo Verde - MT (referência a confirmar)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function HomePage() {
  const { state } = useDemo();
  const plans = Object.values(state.plans).filter((plan) => plan.active);
  return (
    <>
      <section className="hero">
        <div className="network-lines" aria-hidden="true" />
        <div className="portal-container hero-grid">
          <div>
            <Badge tone="success">
              <Sparkles size={14} /> Uma nova conexão está chegando
            </Badge>
            <h1>
              Conexão que acompanha o seu <span>próximo passo.</span>
            </h1>
            <p>
              Planos demonstrativos de internet com uma experiência simples,
              transparente e próxima — do pedido ao suporte.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/planos">
                Ver planos <ArrowRight size={18} />
              </Link>
              <Link className="button button-secondary" to="/cobertura">
                Consultar cobertura
              </Link>
            </div>
            <small>
              Campo Verde - MT é uma referência provisória. Disponibilidade
              sujeita à análise técnica.
            </small>
          </div>
          <div className="hero-visual glass">
            <div className="signal-orbit">
              <img src="/assets/brand/icone-conectar.png" alt="" />
              <i />
              <i />
              <i />
            </div>
            <div className="connection-card">
              <span>Experiência integrada</span>
              <strong>Portal + Cliente + Operação</strong>
              <small>Uma única jornada demonstrativa</small>
            </div>
          </div>
        </div>
      </section>
      <section className="portal-section">
        <div className="portal-container">
          <div className="section-heading">
            <span className="eyebrow">Planos de internet</span>
            <h2>Velocidade para cada momento</h2>
            <p>Planos e valores ilustrativos para apresentação.</p>
          </div>
          <PlanGrid plans={plans} />
        </div>
      </section>
      <section className="portal-section muted-section">
        <div className="portal-container">
          <div className="benefit-grid">
            {[
              [
                Gauge,
                "Desempenho claro",
                "Escolha a velocidade que combina com sua rotina.",
              ],
              [
                ShieldCheck,
                "Jornada transparente",
                "Acompanhe instalação, faturas e suporte no mesmo lugar.",
              ],
              [
                Headphones,
                "Atendimento conectado",
                "Solicitações chegam diretamente à equipe no CRM demonstrativo.",
              ],
            ].map(([Icon, title, text]) => (
              <article className="benefit-card" key={String(title)}>
                <Icon size={26} />
                <h3>{title as string}</h3>
                <p>{text as string}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="portal-section">
        <div className="portal-container split-section">
          <div>
            <span className="eyebrow">Instalação</span>
            <h2>Do interesse à conexão, passo a passo</h2>
            <p>
              Uma jornada acompanhável, sem promessas automáticas de
              viabilidade.
            </p>
          </div>
          <ol className="steps">
            {[
              "Consulte o cenário de cobertura",
              "Envie sua solicitação comercial",
              "Aguarde a análise e o agendamento",
              "Acompanhe a ativação simulada",
            ].map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="portal-section faq-section">
        <div className="portal-container">
          <div className="section-heading">
            <span className="eyebrow">Perguntas frequentes</span>
            <h2>Informação sem letras miúdas</h2>
          </div>
          <div className="faq-list">
            {[
              "A consulta confirma cobertura?",
              "Os valores já são comerciais?",
              "O pagamento é real?",
            ].map((question, index) => (
              <details key={question} open={index === 0}>
                <summary>
                  {question}
                  <ChevronDown />
                </summary>
                <p>
                  {index === 0
                    ? "Não. O resultado é um cenário demonstrativo e depende de análise técnica e disponibilidade de porta."
                    : index === 1
                      ? "Não. Planos e valores são ilustrativos e precisam de validação comercial."
                      : "Não. Toda baixa financeira nesta versão é uma simulação segura, sem cobrança externa."}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function PlanGrid({
  plans,
  selectable = false,
  selected,
  onSelect,
}: {
  plans: Plan[];
  selectable?: boolean;
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const [compare, setCompare] = useState<string[]>([]);
  const toggleCompare = (planId: string) =>
    setCompare((items) =>
      items.includes(planId)
        ? items.filter((id) => id !== planId)
        : items.length < 3
          ? [...items, planId]
          : items,
    );
  return (
    <>
      <div className="plan-grid">
        {plans.map((plan) => (
          <article
            className={`plan-card glass ${plan.highlight ? "featured" : ""} ${selected === plan.id ? "selected" : ""}`}
            key={plan.id}
          >
            {plan.highlight && <Badge tone="success">Recomendado</Badge>}
            <h3>{plan.name}</h3>
            <div className="speed">
              <strong>{plan.speedMbps}</strong>
              <span>Mbps</span>
            </div>
            <p className="price">
              <strong>{money(plan.priceCents)}</strong>
              <span>/mês</span>
            </p>
            <ul>
              <li>
                <Check /> Upload a confirmar
              </li>
              <li>
                <Check /> Instalação a confirmar
              </li>
              <li>
                <Check /> Fidelidade a confirmar
              </li>
              <li>
                <Check /> Equipamentos a confirmar
              </li>
            </ul>
            {selectable ? (
              <Button onClick={() => onSelect?.(plan.id)}>
                {selected === plan.id
                  ? "Plano selecionado"
                  : "Selecionar plano"}
              </Button>
            ) : (
              <Link
                className="button button-primary"
                to={`/contratar?plano=${plan.id}`}
              >
                Escolher plano
              </Link>
            )}
            <label className="compare-check">
              <input
                type="checkbox"
                checked={compare.includes(plan.id)}
                onChange={() => toggleCompare(plan.id)}
              />{" "}
              Comparar
            </label>
          </article>
        ))}
      </div>
      {compare.length > 0 && (
        <div className="compare-bar">
          <span>{compare.length} plano(s) selecionado(s)</span>
          <span>Compare velocidade e preço diretamente nos cards.</span>
        </div>
      )}
    </>
  );
}

export function PlansPage() {
  const { state } = useDemo();
  return (
    <section className="portal-page portal-container">
      <PageTitle eyebrow="Planos" title="Uma escolha simples para cada rotina">
        Planos e valores ilustrativos para apresentação. Condições técnicas e
        comerciais a confirmar.
      </PageTitle>
      <PlanGrid
        plans={Object.values(state.plans).filter((plan) => plan.active)}
      />
    </section>
  );
}

export function CoveragePage() {
  const [result, setResult] = useState<Address["coverage"] | null>(null);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const district = String(form.get("district")).toLowerCase();
    const street = String(form.get("street")).toLowerCase();
    setResult(
      district.includes("fora") || street.includes("rural")
        ? "Fora da área demonstrativa"
        : district.includes("jardim")
          ? "Requer análise"
          : "Pré-viável",
    );
  };
  return (
    <section className="portal-page portal-container">
      <PageTitle
        eyebrow="Cobertura demonstrativa"
        title="Consulte um endereço de teste"
      >
        O CEP isolado não confirma cobertura nem disponibilidade de porta.
      </PageTitle>
      <div className="form-panel glass">
        <form className="form-grid" onSubmit={submit}>
          <label>
            Cidade
            <input name="city" defaultValue="Campo Verde" required />
          </label>
          <label>
            UF
            <input name="state" defaultValue="MT" required maxLength={2} />
          </label>
          <label>
            CEP
            <input name="zip" placeholder="78840-000" required />
          </label>
          <label>
            Bairro
            <input name="district" placeholder="Centro Demo" required />
          </label>
          <label className="span-2">
            Rua
            <input name="street" placeholder="Rua de Teste A" required />
          </label>
          <label>
            Número
            <input name="number" placeholder="100" required />
          </label>
          <Button type="submit">Consultar cenário</Button>
        </form>
        {result && (
          <div
            className={`coverage-result ${result === "Pré-viável" ? "ok" : result === "Requer análise" ? "warn" : "out"}`}
          >
            <MapPin />
            <div>
              <strong>{result}</strong>
              <p>
                {result === "Pré-viável"
                  ? "Há sinalização inicial positiva, ainda sujeita à análise técnica."
                  : result === "Requer análise"
                    ? "Precisamos avaliar a rota e a disponibilidade demonstrativa."
                    : "O endereço está fora dos cenários locais configurados para esta apresentação."}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function HirePage() {
  const { state, repository } = useDemo();
  const navigate = useNavigate();
  const queryPlan = new URLSearchParams(location.search).get("plano");
  const submitting = useRef(false);
  const [step, setStep] = useState(1);
  const [planId, setPlanId] = useState(
    queryPlan && state.plans[queryPlan] ? queryPlan : "plan-500",
  );
  const [sent, setSent] = useState<string | null>(null);
  const [address, setAddress] = useState({
    city: "Campo Verde",
    state: "MT",
    zip: "78840-000",
    district: "Centro Demo",
    street: "Rua de Teste A",
    number: "100",
  });
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const submit = () => {
    if (sent || submitting.current) return;
    submitting.current = true;
    const lead = repository.createLead({
      planId,
      ...contact,
      address: {
        ...address,
        label: "Endereço solicitado",
        coverage: "Pré-viável",
      },
    });
    setSent(lead.protocol);
    setStep(5);
  };
  const valid =
    step === 1 || step === 2
      ? Object.values(address).every(Boolean)
      : step === 3
        ? contact.name.length > 2 &&
          contact.email.includes("@") &&
          contact.phone.length > 7
        : true;
  return (
    <section className="portal-page portal-container narrow">
      <PageTitle
        eyebrow="Solicitação comercial"
        title="Vamos conectar seu próximo passo"
      >
        Nenhum CPF ou documento real é necessário nesta demonstração.
      </PageTitle>
      <div className="wizard-progress">
        {["Plano", "Endereço", "Contato", "Revisão"].map((label, index) => (
          <span className={step > index ? "active" : ""} key={label}>
            {index + 1}
            <small>{label}</small>
          </span>
        ))}
      </div>
      <div className="form-panel glass">
        {step === 1 && (
          <PlanGrid
            plans={Object.values(state.plans).filter((plan) => plan.active)}
            selectable
            selected={planId}
            onSelect={setPlanId}
          />
        )}
        {step === 2 && (
          <div className="form-grid">
            <label>
              Cidade
              <input
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
              />
            </label>
            <label>
              UF
              <input
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
              />
            </label>
            <label>
              CEP
              <input
                value={address.zip}
                onChange={(e) =>
                  setAddress({ ...address, zip: e.target.value })
                }
              />
            </label>
            <label>
              Bairro
              <input
                value={address.district}
                onChange={(e) =>
                  setAddress({ ...address, district: e.target.value })
                }
              />
            </label>
            <label className="span-2">
              Rua
              <input
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
              />
            </label>
            <label>
              Número
              <input
                value={address.number}
                onChange={(e) =>
                  setAddress({ ...address, number: e.target.value })
                }
              />
            </label>
          </div>
        )}
        {step === 3 && (
          <div className="form-grid">
            <label>
              Nome fictício
              <input
                value={contact.name}
                onChange={(e) =>
                  setContact({ ...contact, name: e.target.value })
                }
                placeholder="Nome para demonstração"
              />
            </label>
            <label>
              E-mail de teste
              <input
                type="email"
                value={contact.email}
                onChange={(e) =>
                  setContact({ ...contact, email: e.target.value })
                }
                placeholder="nome@example.com"
              />
            </label>
            <label>
              Telefone de teste
              <input
                value={contact.phone}
                onChange={(e) =>
                  setContact({ ...contact, phone: e.target.value })
                }
                placeholder="(66) 90000-0000"
              />
            </label>
          </div>
        )}
        {step === 4 && (
          <div className="review-card">
            <Badge tone="warning">Solicitação, não contrato</Badge>
            <h3>{state.plans[planId].name}</h3>
            <p>{money(state.plans[planId].priceCents)}/mês</p>
            <dl>
              <div>
                <dt>Nome</dt>
                <dd>{contact.name}</dd>
              </div>
              <div>
                <dt>Contato</dt>
                <dd>
                  {contact.email} · {contact.phone}
                </dd>
              </div>
              <div>
                <dt>Endereço</dt>
                <dd>
                  {address.street}, {address.number} — {address.district},{" "}
                  {address.city}/{address.state}
                </dd>
              </div>
            </dl>
          </div>
        )}
        {step === 5 && (
          <div className="success-panel">
            <Check />
            <h2>Solicitação enviada</h2>
            <p>
              Protocolo <strong>{sent}</strong>. O registro já está disponível
              no CRM da demonstração.
            </p>
            <Button onClick={() => navigate("/crm/leads")}>Ver no CRM</Button>
          </div>
        )}
        {step < 5 && (
          <div className="wizard-actions">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            <Button
              disabled={!valid}
              onClick={() => (step === 4 ? submit() : setStep(step + 1))}
            >
              {step === 4 ? "Enviar solicitação" : "Continuar"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

const infoContent: Record<
  string,
  {
    eyebrow: string;
    title: string;
    text: string;
    cards: [React.ElementType, string, string][];
  }
> = {
  empresas: {
    eyebrow: "Conectar Empresas",
    title: "Conectividade empresarial sob análise",
    text: "Uma porta de entrada demonstrativa para entender necessidades de operação, sem inventar SLAs ou serviços ainda não homologados.",
    cards: [
      [
        Building2,
        "Diagnóstico inicial",
        "Registre o cenário da empresa para análise comercial.",
      ],
      [
        Network,
        "Projeto responsável",
        "Viabilidade e condições dependem de avaliação técnica.",
      ],
      [
        ShieldCheck,
        "Transparência",
        "Nenhuma contratação é ativada automaticamente.",
      ],
    ],
  },
  sobre: {
    eyebrow: "Sobre",
    title: "Uma marca feita para aproximar",
    text: "A Conectar Brasil nasce com a proposta de tornar a experiência com internet mais simples e humana. Nesta fase, todo conteúdo institucional é provisório e sujeito à validação do proprietário.",
    cards: [
      [
        Sparkles,
        "Identidade própria",
        "Uma experiência digital alinhada à marca oficial.",
      ],
      [
        MapPin,
        "Referência local",
        "Campo Verde - MT é referência provisória, não área garantida.",
      ],
      [
        Network,
        "Visão integrada",
        "Portal, cliente e operação compartilham a mesma jornada.",
      ],
    ],
  },
  contato: {
    eyebrow: "Contato",
    title: "Fale com o atendimento demonstrativo",
    text: "Ainda não há telefone, WhatsApp, endereço físico ou CNPJ oficial configurado. Use os fluxos internos da demonstração.",
    cards: [
      [
        Headphones,
        "Central de ajuda",
        "Consulte respostas sobre planos, cobertura e faturas.",
      ],
      [
        CircleHelp,
        "Suporte no aplicativo",
        "Abra um chamado fictício e acompanhe a resposta.",
      ],
      [
        Building2,
        "Interesse comercial",
        "Envie uma solicitação pelo portal para vê-la no CRM.",
      ],
    ],
  },
  ajuda: {
    eyebrow: "Central de ajuda",
    title: "Respostas claras para a demonstração",
    text: "Entenda os limites e os principais fluxos deste protótipo antes de navegar.",
    cards: [
      [
        Gauge,
        "Velocidades",
        "As três ofertas e valores são estritamente ilustrativos.",
      ],
      [
        MapPin,
        "Cobertura",
        "CEP e consulta não garantem disponibilidade técnica.",
      ],
      [
        ShieldCheck,
        "Privacidade",
        "Use apenas dados sintéticos; não envie documentos pessoais.",
      ],
    ],
  },
  status: {
    eyebrow: "Status demonstrativo",
    title: "Experiência disponível",
    text: "Portal, aplicativo e CRM estão operando localmente neste navegador. Isso não representa telemetria da rede do provedor.",
    cards: [
      [Network, "Portal e app", "Disponíveis neste protótipo."],
      [Gauge, "Conexão do cliente", "Não monitorada nesta demonstração."],
      [ShieldCheck, "Dados", "Persistidos somente neste navegador."],
    ],
  },
};

export function InfoPage({ page }: { page: keyof typeof infoContent }) {
  const content = infoContent[page];
  return (
    <section className="portal-page portal-container">
      <PageTitle eyebrow={content.eyebrow} title={content.title}>
        {content.text}
      </PageTitle>
      <div className="benefit-grid">
        {content.cards.map(([Icon, title, text]) => (
          <article className="benefit-card glass" key={title}>
            <Icon />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="info-cta glass">
        <h2>Experimente a jornada integrada</h2>
        <p>
          Comece por uma solicitação comercial e acompanhe o mesmo registro nas
          áreas internas.
        </p>
        <Link className="button button-primary" to="/contratar">
          Iniciar demonstração <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
