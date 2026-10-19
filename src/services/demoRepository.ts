import { createDemoState } from "../data/demo/seed";
import type {
  Client,
  Contract,
  DemoRepository,
  DemoState,
  Id,
  Lead,
  LeadRequest,
  LeadStage,
  Plan,
  Ticket,
  TicketMessage,
  WorkOrder,
} from "../domain/types";

export const STORAGE_KEY = "conectar-brasil-demo-v1";
export const publicTicketMessages = (ticket: Ticket) =>
  ticket.messages.filter((message) => message.visibility === "Pública");
const now = () => new Date().toISOString();
const id = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export class LocalDemoRepository implements DemoRepository {
  private state: DemoState;
  private listeners = new Set<(state: DemoState) => void>();

  constructor(
    private storage: Pick<
      Storage,
      "getItem" | "setItem" | "removeItem"
    > = window.localStorage,
  ) {
    this.state = this.load();
    window.addEventListener?.("storage", this.onStorage);
  }

  private load(): DemoState {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return createDemoState();
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed.schemaVersion !== 1 || !parsed.clients || !parsed.contracts)
        throw new Error("Estado inválido");
      return parsed;
    } catch {
      this.storage.removeItem(STORAGE_KEY);
      return createDemoState();
    }
  }

  private onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      this.state = this.load();
      this.emit(false);
    }
  };

  private emit(persist = true) {
    if (persist) this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.listeners.forEach((listener) => listener(this.state));
  }

  private mutate(mutator: (draft: DemoState) => void) {
    this.state = structuredClone(this.state);
    mutator(this.state);
    this.emit();
  }

  private audit(
    entity: string,
    entityId: Id,
    action: string,
    author: string = this.state.presentation.profile,
  ) {
    this.state.audit.unshift({
      id: id("audit"),
      author,
      entity,
      entityId,
      action,
      createdAt: now(),
    });
  }

  getState = () => this.state;
  subscribe = (listener: (state: DemoState) => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  reset() {
    this.state = createDemoState();
    this.emit();
  }

  setPresentation(next: Partial<DemoState["presentation"]>) {
    this.mutate((state) => {
      state.presentation = { ...state.presentation, ...next };
      if (next.clientId) {
        const contract = Object.values(state.contracts).find(
          (item) => item.clientId === next.clientId,
        );
        if (contract) state.presentation.contractId = contract.id;
      }
    });
  }

  createLead(request: LeadRequest): Lead {
    const leadId = id("lead");
    const lead: Lead = {
      ...request,
      id: leadId,
      protocol: `DEMO-${Date.now().toString().slice(-7)}`,
      address: { ...request.address, id: id("address") },
      origin: "Portal",
      stage: "Novo",
      createdAt: now(),
    };
    this.mutate((state) => {
      state.leads[lead.id] = lead;
      this.audit(
        "Lead",
        lead.id,
        "Solicitação criada no portal",
        "Visitante demo",
      );
    });
    return lead;
  }

  moveLead(leadId: Id, stage: LeadStage, lostReason?: string) {
    if (stage === "Perdido" && !lostReason?.trim())
      throw new Error("Informe o motivo da perda.");
    this.mutate((state) => {
      const lead = state.leads[leadId];
      if (!lead) throw new Error("Lead não encontrado.");
      lead.stage = stage;
      lead.lostReason = stage === "Perdido" ? lostReason : undefined;
      this.audit("Lead", leadId, `Etapa alterada para ${stage}`);
    });
  }

  convertLead(leadId: Id): Contract {
    const existing = this.state.leads[leadId];
    if (!existing) throw new Error("Lead não encontrado.");
    if (existing.convertedContractId)
      return this.state.contracts[existing.convertedContractId];
    let contract!: Contract;
    this.mutate((state) => {
      const lead = state.leads[leadId];
      const clientId = id("client");
      const contractId = id("contract");
      const addressId = id("address");
      const client: Client = {
        id: clientId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        addresses: [{ ...lead.address, id: addressId }],
      };
      const plan = state.plans[lead.planId];
      contract = {
        id: contractId,
        clientId,
        planId: plan.id,
        addressId,
        agreedPriceCents: plan.priceCents,
        status: "Em instalação",
        connectionStatus: "Não monitorada na demonstração",
        createdAt: now(),
        installationStep: "Análise",
      };
      state.clients[clientId] = client;
      state.contracts[contractId] = contract;
      lead.convertedClientId = clientId;
      lead.convertedContractId = contractId;
      lead.stage = "Aprovado";
      this.audit("Lead", leadId, "Convertido em cliente e contrato");
    });
    return contract;
  }

  payInvoice(invoiceId: Id) {
    const current = this.state.invoices[invoiceId];
    if (!current) throw new Error("Fatura não encontrada.");
    if (current.status === "Paga") return current;
    this.mutate((state) => {
      const invoice = state.invoices[invoiceId];
      invoice.status = "Paga";
      invoice.paidAt = now();
      invoice.paymentId = id("PAY-DEMO");
      this.audit("Fatura", invoiceId, "Pagamento demonstrativo registrado");
    });
    return this.state.invoices[invoiceId];
  }

  openTicket(contractId: Id, category: string, description: string): Ticket {
    if (!description.trim()) throw new Error("Descreva a solicitação.");
    const ticket: Ticket = {
      id: id("ticket"),
      protocol: `SUP-DEMO-${Date.now().toString().slice(-6)}`,
      contractId,
      category,
      description,
      priority: "Normal",
      status: "Aberto",
      createdAt: now(),
      messages: [],
    };
    this.mutate((state) => {
      state.tickets[ticket.id] = ticket;
      this.audit("Chamado", ticket.id, "Chamado aberto", "Cliente demo");
    });
    return ticket;
  }

  createServiceRequest(contractId: Id, category: string, description: string) {
    return this.openTicket(contractId, category, description);
  }

  addTicketMessage(
    ticketId: Id,
    body: string,
    visibility: TicketMessage["visibility"],
  ) {
    if (!body.trim()) return;
    this.mutate((state) => {
      const ticket = state.tickets[ticketId];
      if (!ticket) throw new Error("Chamado não encontrado.");
      ticket.messages.push({
        id: id("message"),
        author: state.presentation.profile,
        body,
        visibility,
        createdAt: now(),
      });
      this.audit(
        "Chamado",
        ticketId,
        `${visibility === "Pública" ? "Resposta pública" : "Nota interna"} adicionada`,
      );
    });
  }

  updateTicket(
    ticketId: Id,
    patch: Partial<Pick<Ticket, "status" | "assignee" | "priority">>,
  ) {
    this.mutate((state) => {
      Object.assign(state.tickets[ticketId], patch);
      this.audit("Chamado", ticketId, "Chamado atualizado");
    });
  }

  updatePlan(
    planId: Id,
    patch: Partial<Pick<Plan, "name" | "priceCents" | "active">>,
  ) {
    this.mutate((state) => {
      Object.assign(state.plans[planId], patch);
      this.audit("Plano", planId, "Catálogo atualizado");
    });
  }

  updateClient(clientId: Id, patch: Partial<Pick<Client, "email" | "phone">>) {
    this.mutate((state) => {
      Object.assign(state.clients[clientId], patch);
      this.audit("Cliente", clientId, "Contato atualizado", "Cliente demo");
    });
  }

  updateWorkOrder(
    orderId: Id,
    patch: Partial<
      Pick<WorkOrder, "status" | "scheduledAt" | "notes" | "checklist">
    >,
  ) {
    if (patch.scheduledAt) {
      const order = this.state.workOrders[orderId];
      const conflict = Object.values(this.state.workOrders).some(
        (item) =>
          item.id !== orderId &&
          item.technician === order.technician &&
          item.scheduledAt === patch.scheduledAt &&
          item.status !== "Concluída",
      );
      if (conflict)
        throw new Error("O técnico já possui uma ordem nesse horário.");
    }
    this.mutate((state) => {
      const order = state.workOrders[orderId];
      if (
        patch.status === "Concluída" &&
        order.checklist.some((entry) => !entry.done)
      )
        throw new Error("Conclua todo o checklist antes de finalizar.");
      Object.assign(order, patch);
      const contract = state.contracts[order.contractId];
      if (patch.status === "Concluída") {
        contract.status = "Ativo";
        contract.installationStep = "Concluída";
      } else if (patch.scheduledAt) contract.installationStep = "Agendamento";
      this.audit("Ordem de serviço", orderId, "Ordem atualizada");
    });
  }
}
