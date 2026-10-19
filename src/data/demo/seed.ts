import type {
  Address,
  Client,
  Contract,
  DemoState,
  Invoice,
  Lead,
  Notice,
  Plan,
  Ticket,
  WorkOrder,
} from "../../domain/types";

const DAY = 86_400_000;
const date = (offset = 0) =>
  new Date(Date.now() + offset * DAY).toISOString().slice(0, 10);
const timestamp = (offset = 0) =>
  new Date(Date.now() + offset * DAY).toISOString();
const record = <T extends { id: string }>(items: T[]) =>
  Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;

const planList: Plan[] = [
  {
    id: "plan-300",
    name: "Conectar Essencial Demo",
    speedMbps: 300,
    priceCents: 8990,
    active: true,
  },
  {
    id: "plan-500",
    name: "Conectar Família Demo",
    speedMbps: 500,
    priceCents: 10990,
    active: true,
    highlight: true,
  },
  {
    id: "plan-800",
    name: "Conectar Performance Demo",
    speedMbps: 800,
    priceCents: 13990,
    active: true,
  },
];

const names = [
  "Ana Horizonte",
  "Bruno Ipê",
  "Carla Aurora",
  "Diego Cerrado",
  "Elisa Nascente",
  "Fábio Vereda",
  "Giovana Sol",
  "Heitor Campo",
  "Iara Cristal",
  "João Estrela",
  "Lia Primavera",
  "Marcos Vale",
];

const clientList: Client[] = names.map((name, index) => {
  const id = `client-${String(index + 1).padStart(2, "0")}`;
  const baseAddress: Address = {
    id: `address-${String(index + 1).padStart(2, "0")}-a`,
    label: index === 0 ? "Casa" : "Unidade principal",
    street: `Rua de Teste ${String.fromCharCode(65 + index)}`,
    number: String(100 + index),
    district:
      index % 3 === 0
        ? "Centro Demo"
        : index % 3 === 1
          ? "Jardim Piloto"
          : "Vila Cenário",
    city: "Campo Verde",
    state: "MT",
    zip: `78840-${String(index).padStart(3, "0")}`,
    coverage:
      index === 11
        ? "Fora da área demonstrativa"
        : index % 4 === 0
          ? "Requer análise"
          : "Pré-viável",
  };
  const addresses =
    index < 2
      ? [
          baseAddress,
          {
            ...baseAddress,
            id: `${baseAddress.id.slice(0, -1)}b`,
            label: "Segunda unidade",
            street: `Avenida Demonstração ${index + 1}`,
            number: "200",
          },
        ]
      : [baseAddress];
  return {
    id,
    name,
    email: `cliente${index + 1}@example.com`,
    phone: `(66) 90000-${String(index + 1).padStart(4, "0")}`,
    addresses,
  };
});

const contractList: Contract[] = Array.from({ length: 14 }, (_, index) => {
  const client = clientList[index % clientList.length];
  const address = client.addresses[index >= 12 ? 1 : 0] ?? client.addresses[0];
  const plan = planList[index % planList.length];
  const installing = index === 2 || index === 5;
  return {
    id: `contract-${String(index + 1).padStart(2, "0")}`,
    clientId: client.id,
    planId: plan.id,
    addressId: address.id,
    agreedPriceCents: plan.priceCents,
    status: installing ? "Em instalação" : "Ativo",
    connectionStatus: "Não monitorada na demonstração",
    createdAt: timestamp(-120 + index * 4),
    installationStep: installing
      ? index === 2
        ? "Agendamento"
        : "Visita"
      : "Concluída",
  };
});

const leadNames = [
  "Nina Demo",
  "Otávio Exemplo",
  "Paula Cenário",
  "Rafael Modelo",
  "Sara Amostra",
  "Tiago Piloto",
  "Úrsula Teste",
  "Vitor Protótipo",
  "Wesley Simulado",
  "Yara Exemplo",
  "Alice Modelo",
  "Bento Demo",
  "Cecília Teste",
  "Davi Amostra",
  "Eva Piloto",
  "Flávio Cenário",
  "Gabi Simulada",
  "Hugo Protótipo",
];
const stages: Lead["stage"][] = [
  "Novo",
  "Em contato",
  "Análise técnica",
  "Proposta",
  "Aprovado",
  "Perdido",
];
const leadList: Lead[] = leadNames.map((name, index) => ({
  id: `lead-${String(index + 1).padStart(2, "0")}`,
  protocol: `DEMO-L${String(index + 1).padStart(4, "0")}`,
  name,
  email: `lead${index + 1}@example.com`,
  phone: `(66) 91000-${String(index + 1).padStart(4, "0")}`,
  planId: planList[index % 3].id,
  address: {
    id: `lead-address-${index + 1}`,
    label: "Endereço informado",
    street: `Rua Prospect ${index + 1}`,
    number: String(index + 10),
    district: index % 2 ? "Jardim Piloto" : "Centro Demo",
    city: "Campo Verde",
    state: "MT",
    zip: `78840-${String(300 + index)}`,
    coverage:
      index === 17
        ? "Fora da área demonstrativa"
        : index % 3
          ? "Pré-viável"
          : "Requer análise",
  },
  origin: index % 4 === 0 ? "CRM" : "Portal",
  stage: stages[index % stages.length],
  createdAt: timestamp(-index),
  lostReason:
    stages[index % stages.length] === "Perdido"
      ? "Fora da área demonstrativa"
      : undefined,
}));

const invoiceList: Invoice[] = Array.from({ length: 36 }, (_, index) => {
  const contract = contractList[index % contractList.length];
  const cycle = Math.floor(index / contractList.length);
  const dueOffset =
    cycle === 0
      ? -12 - (index % 4)
      : cycle === 1
        ? 5 + (index % 8)
        : 28 + (index % 10);
  const paid = cycle === 0 && index % 3 !== 0;
  return {
    id: `invoice-${String(index + 1).padStart(3, "0")}`,
    contractId: contract.id,
    dueDate: date(dueOffset),
    amountCents: contract.agreedPriceCents,
    status: paid ? "Paga" : dueOffset < 0 ? "Vencida" : "Em aberto",
    paidAt: paid ? timestamp(dueOffset - 1) : undefined,
    paymentId: paid ? `PAY-DEMO-${index + 1}` : undefined,
  };
});

const ticketList: Ticket[] = Array.from({ length: 10 }, (_, index) => ({
  id: `ticket-${String(index + 1).padStart(2, "0")}`,
  protocol: `SUP-DEMO-${String(index + 1).padStart(4, "0")}`,
  contractId: contractList[index].id,
  category:
    index % 3 === 0
      ? "Instalação"
      : index % 3 === 1
        ? "Financeiro"
        : "Conectividade demonstrativa",
  description: `Solicitação sintética ${index + 1} para validação da jornada.`,
  priority: index === 2 ? "Alta" : "Normal",
  status:
    index === 2
      ? "Aguardando visita"
      : index % 4 === 0
        ? "Resolvido"
        : "Em atendimento",
  assignee: index % 2 ? "Equipe Atendimento" : undefined,
  createdAt: timestamp(-10 + index),
  messages: [
    {
      id: `message-${index + 1}-1`,
      author: "Cliente demo",
      body: "Preciso de ajuda com esta solicitação demonstrativa.",
      visibility: "Pública",
      createdAt: timestamp(-10 + index),
    },
    {
      id: `message-${index + 1}-2`,
      author: "Equipe interna",
      body: "Nota interna reservada ao CRM.",
      visibility: "Interna",
      createdAt: timestamp(-9 + index),
    },
  ],
}));

const workOrderList: WorkOrder[] = Array.from({ length: 8 }, (_, index) => ({
  id: `order-${String(index + 1).padStart(2, "0")}`,
  contractId: contractList[index].id,
  technician: index % 2 ? "Técnica Marina Demo" : "Técnico Lucas Demo",
  scheduledAt:
    new Date(Date.now() + (index + 1) * DAY).toISOString().slice(0, 10) +
    `T${index % 2 ? "14" : "09"}:00:00`,
  status: index === 1 ? "Em execução" : "Agendada",
  checklist: [
    { label: "Confirmar endereço de teste", done: index === 1 },
    { label: "Registrar sinal demonstrativo", done: false },
    { label: "Validar aceite simulado", done: false },
  ],
  notes: "",
}));

const noticeList: Notice[] = [
  {
    id: "notice-01",
    title: "Ambiente demonstrativo",
    body: "Os dados e ações desta plataforma são simulados.",
    audience: "Todos",
    publishedAt: timestamp(-2),
  },
  {
    id: "notice-02",
    title: "Agenda de instalação",
    body: "Visitas de demonstração podem ser reagendadas pelo CRM.",
    audience: "Campo Verde - MT",
    publishedAt: timestamp(-1),
  },
  {
    id: "notice-03",
    title: "Atualização do portal",
    body: "Novas ofertas ilustrativas já estão disponíveis.",
    audience: contractList[0].id,
    publishedAt: timestamp(),
  },
];

export function createDemoState(): DemoState {
  return {
    schemaVersion: 1,
    plans: record(planList.map((item) => ({ ...item }))),
    clients: record(
      clientList.map((item) => ({
        ...item,
        addresses: item.addresses.map((address) => ({ ...address })),
      })),
    ),
    leads: record(
      leadList.map((item) => ({ ...item, address: { ...item.address } })),
    ),
    contracts: record(contractList.map((item) => ({ ...item }))),
    invoices: record(invoiceList.map((item) => ({ ...item }))),
    tickets: record(
      ticketList.map((item) => ({
        ...item,
        messages: item.messages.map((message) => ({ ...message })),
      })),
    ),
    workOrders: record(
      workOrderList.map((item) => ({
        ...item,
        checklist: item.checklist.map((entry) => ({ ...entry })),
      })),
    ),
    notices: record(noticeList.map((item) => ({ ...item }))),
    audit: [],
    presentation: {
      profile: "Administrador",
      clientId: "client-01",
      contractId: "contract-01",
    },
  };
}
