export type Id = string;
export type Profile =
  | "Administrador"
  | "Comercial"
  | "Atendimento"
  | "Financeiro"
  | "Técnico"
  | "Cliente";
export type LeadStage =
  | "Novo"
  | "Em contato"
  | "Análise técnica"
  | "Proposta"
  | "Aprovado"
  | "Perdido";
export type ContractStatus =
  | "Em instalação"
  | "Ativo"
  | "Em análise"
  | "Cancelado";
export type InvoiceStatus = "Em aberto" | "Vencida" | "Paga";
export type TicketStatus =
  | "Aberto"
  | "Em atendimento"
  | "Aguardando visita"
  | "Resolvido";

export interface Address {
  id: Id;
  label: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zip: string;
  coverage: "Pré-viável" | "Requer análise" | "Fora da área demonstrativa";
}

export interface Plan {
  id: Id;
  name: string;
  speedMbps: number;
  priceCents: number;
  active: boolean;
  highlight?: boolean;
}

export interface Client {
  id: Id;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
}

export interface Lead {
  id: Id;
  protocol: string;
  name: string;
  email: string;
  phone: string;
  planId: Id;
  address: Address;
  origin: "Portal" | "Aplicativo" | "CRM";
  stage: LeadStage;
  createdAt: string;
  convertedClientId?: Id;
  convertedContractId?: Id;
  lostReason?: string;
}

export interface Contract {
  id: Id;
  clientId: Id;
  planId: Id;
  addressId: Id;
  agreedPriceCents: number;
  status: ContractStatus;
  connectionStatus: "Não monitorada na demonstração";
  createdAt: string;
  installationStep:
    | "Análise"
    | "Agendamento"
    | "Visita"
    | "Ativação"
    | "Concluída";
}

export interface Invoice {
  id: Id;
  contractId: Id;
  dueDate: string;
  amountCents: number;
  status: InvoiceStatus;
  paidAt?: string;
  paymentId?: string;
}

export interface TicketMessage {
  id: Id;
  author: string;
  body: string;
  visibility: "Pública" | "Interna";
  createdAt: string;
}

export interface Ticket {
  id: Id;
  protocol: string;
  contractId: Id;
  category: string;
  description: string;
  priority: "Baixa" | "Normal" | "Alta";
  status: TicketStatus;
  assignee?: string;
  createdAt: string;
  messages: TicketMessage[];
}

export interface WorkOrder {
  id: Id;
  contractId: Id;
  technician: string;
  scheduledAt: string;
  status: "Agendada" | "Em execução" | "Concluída" | "Pendente";
  checklist: { label: string; done: boolean }[];
  notes: string;
}

export interface Notice {
  id: Id;
  title: string;
  body: string;
  audience: "Todos" | "Campo Verde - MT" | Id;
  publishedAt: string;
}

export interface AuditEvent {
  id: Id;
  author: string;
  entity: string;
  entityId: Id;
  action: string;
  createdAt: string;
}

export interface DemoState {
  schemaVersion: 1;
  plans: Record<Id, Plan>;
  clients: Record<Id, Client>;
  leads: Record<Id, Lead>;
  contracts: Record<Id, Contract>;
  invoices: Record<Id, Invoice>;
  tickets: Record<Id, Ticket>;
  workOrders: Record<Id, WorkOrder>;
  notices: Record<Id, Notice>;
  audit: AuditEvent[];
  presentation: {
    profile: Profile;
    clientId: Id;
    contractId: Id;
  };
}

export interface LeadRequest {
  planId: Id;
  name: string;
  email: string;
  phone: string;
  address: Omit<Address, "id">;
}

export interface DemoRepository {
  getState(): DemoState;
  subscribe(listener: (state: DemoState) => void): () => void;
  reset(): void;
  setPresentation(next: Partial<DemoState["presentation"]>): void;
  createLead(request: LeadRequest): Lead;
  moveLead(leadId: Id, stage: LeadStage, lostReason?: string): void;
  convertLead(leadId: Id): Contract;
  payInvoice(invoiceId: Id): Invoice;
  openTicket(contractId: Id, category: string, description: string): Ticket;
  addTicketMessage(
    ticketId: Id,
    body: string,
    visibility: TicketMessage["visibility"],
  ): void;
  updateTicket(
    ticketId: Id,
    patch: Partial<Pick<Ticket, "status" | "assignee" | "priority">>,
  ): void;
  updatePlan(
    planId: Id,
    patch: Partial<Pick<Plan, "name" | "priceCents" | "active">>,
  ): void;
  updateClient(
    clientId: Id,
    patch: Partial<Pick<Client, "email" | "phone">>,
  ): void;
  updateWorkOrder(
    orderId: Id,
    patch: Partial<
      Pick<WorkOrder, "status" | "scheduledAt" | "notes" | "checklist">
    >,
  ): void;
  createServiceRequest(
    contractId: Id,
    category: string,
    description: string,
  ): Ticket;
}
