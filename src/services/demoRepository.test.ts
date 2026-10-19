import { beforeEach, describe, expect, it } from "vitest";
import {
  LocalDemoRepository,
  STORAGE_KEY,
  publicTicketMessages,
} from "./demoRepository";

describe("LocalDemoRepository", () => {
  beforeEach(() => localStorage.clear());

  it("inicializa as contagens exigidas e restaura o cenário completo", () => {
    const repository = new LocalDemoRepository(localStorage);
    const state = repository.getState();
    expect(Object.keys(state.plans)).toHaveLength(3);
    expect(Object.keys(state.clients)).toHaveLength(12);
    expect(Object.keys(state.leads)).toHaveLength(18);
    expect(Object.keys(state.contracts)).toHaveLength(14);
    expect(Object.keys(state.workOrders)).toHaveLength(8);
    expect(Object.keys(state.invoices)).toHaveLength(36);
    expect(Object.keys(state.tickets)).toHaveLength(10);
    expect(Object.keys(state.notices)).toHaveLength(3);
    repository.createServiceRequest(
      "contract-01",
      "Teste",
      "Solicitação temporária da suíte.",
    );
    repository.reset();
    expect(Object.keys(repository.getState().tickets)).toHaveLength(10);
  });

  it("converte um lead somente uma vez", () => {
    const repository = new LocalDemoRepository(localStorage);
    const first = repository.convertLead("lead-01");
    const second = repository.convertLead("lead-01");
    expect(second.id).toBe(first.id);
    expect(Object.keys(repository.getState().contracts)).toHaveLength(15);
    expect(Object.keys(repository.getState().clients)).toHaveLength(13);
  });

  it("registra pagamento idempotente sem duplicar a baixa", () => {
    const repository = new LocalDemoRepository(localStorage);
    const invoice = Object.values(repository.getState().invoices).find(
      (item) => item.status !== "Paga",
    )!;
    const first = repository.payInvoice(invoice.id);
    const second = repository.payInvoice(invoice.id);
    expect(second.paymentId).toBe(first.paymentId);
    expect(
      repository
        .getState()
        .audit.filter((event) => event.entityId === invoice.id),
    ).toHaveLength(1);
  });

  it("não expõe notas internas na seleção de mensagens públicas", () => {
    const repository = new LocalDemoRepository(localStorage);
    const ticket = repository.getState().tickets["ticket-01"];
    repository.addTicketMessage(ticket.id, "Resposta visível", "Pública");
    repository.addTicketMessage(ticket.id, "Segredo operacional", "Interna");
    const messages = publicTicketMessages(
      repository.getState().tickets[ticket.id],
    );
    expect(
      messages.some((message) => message.body === "Resposta visível"),
    ).toBe(true);
    expect(
      messages.some((message) => message.body === "Segredo operacional"),
    ).toBe(false);
  });

  it("preserva o preço contratado ao alterar o catálogo", () => {
    const repository = new LocalDemoRepository(localStorage);
    const contract = repository.getState().contracts["contract-01"];
    const agreedPrice = contract.agreedPriceCents;
    repository.updatePlan(contract.planId, { priceCents: agreedPrice + 5000 });
    expect(repository.getState().plans[contract.planId].priceCents).toBe(
      agreedPrice + 5000,
    );
    expect(repository.getState().contracts[contract.id].agreedPriceCents).toBe(
      agreedPrice,
    );
  });

  it("recupera estado persistido e descarta schema inválido", () => {
    const first = new LocalDemoRepository(localStorage);
    first.updateClient("client-01", { email: "alterado@example.com" });
    const second = new LocalDemoRepository(localStorage);
    expect(second.getState().clients["client-01"].email).toBe(
      "alterado@example.com",
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99 }));
    const recovered = new LocalDemoRepository(localStorage);
    expect(recovered.getState().schemaVersion).toBe(1);
    expect(recovered.getState().clients["client-01"].email).toBe(
      "cliente1@example.com",
    );
  });
});
