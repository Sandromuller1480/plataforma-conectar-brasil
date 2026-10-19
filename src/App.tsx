import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PresentationDock } from "./components/PresentationDock";

const portal = import("./features/portal/Portal");
const client = import("./features/app/ClientApp");
const crm = import("./features/crm/Crm");
const tech = import("./features/tecnico/Technician");
const lazyNamed = <T extends React.ComponentType<any>>(
  loader: Promise<any>,
  name: string,
) => lazy(async () => ({ default: (await loader)[name] as T }));

const HomePage = lazyNamed(portal, "HomePage"),
  PortalLayout = lazyNamed(portal, "PortalLayout"),
  PlansPage = lazyNamed(portal, "PlansPage"),
  CoveragePage = lazyNamed(portal, "CoveragePage"),
  HirePage = lazyNamed(portal, "HirePage"),
  InfoPage = lazyNamed(portal, "InfoPage");
const ClientLayout = lazyNamed(client, "ClientLayout"),
  ClientHome = lazyNamed(client, "ClientHome"),
  ClientPlan = lazyNamed(client, "ClientPlan"),
  InstallationPage = lazyNamed(client, "InstallationPage"),
  InvoicesPage = lazyNamed(client, "InvoicesPage"),
  InvoiceDetail = lazyNamed(client, "InvoiceDetail"),
  SupportPage = lazyNamed(client, "SupportPage"),
  TicketDetail = lazyNamed(client, "TicketDetail"),
  NoticesPage = lazyNamed(client, "NoticesPage"),
  DocumentsPage = lazyNamed(client, "DocumentsPage"),
  ProfilePage = lazyNamed(client, "ProfilePage");
const CrmLayout = lazyNamed(crm, "CrmLayout"),
  DashboardPage = lazyNamed(crm, "DashboardPage"),
  LeadsPage = lazyNamed(crm, "LeadsPage"),
  ClientsPage = lazyNamed(crm, "ClientsPage"),
  ContractsPage = lazyNamed(crm, "ContractsPage"),
  OrdersPage = lazyNamed(crm, "OrdersPage"),
  TicketsPage = lazyNamed(crm, "TicketsPage"),
  FinancePage = lazyNamed(crm, "FinancePage"),
  CatalogPage = lazyNamed(crm, "CatalogPage"),
  NoticesAdminPage = lazyNamed(crm, "NoticesAdminPage"),
  ReportsPage = lazyNamed(crm, "ReportsPage"),
  ContentPage = lazyNamed(crm, "ContentPage"),
  SettingsPage = lazyNamed(crm, "SettingsPage");
const TechnicianPage = lazyNamed(tech, "TechnicianPage");

const Loading = () => (
  <div className="loading-screen">
    <img src="/assets/brand/icone-conectar.png" alt="" />
    <span>Carregando experiência...</span>
  </div>
);
const PortalRoute = ({ children }: { children: React.ReactNode }) => (
  <PortalLayout>{children}</PortalLayout>
);
const ClientRoute = ({ children }: { children: React.ReactNode }) => (
  <ClientLayout>{children}</ClientLayout>
);
const CrmRoute = ({ children }: { children: React.ReactNode }) => (
  <CrmLayout>{children}</CrmLayout>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route
          path="/"
          element={
            <PortalRoute>
              <HomePage />
            </PortalRoute>
          }
        />
        <Route
          path="/planos"
          element={
            <PortalRoute>
              <PlansPage />
            </PortalRoute>
          }
        />
        <Route
          path="/cobertura"
          element={
            <PortalRoute>
              <CoveragePage />
            </PortalRoute>
          }
        />
        <Route
          path="/contratar"
          element={
            <PortalRoute>
              <HirePage />
            </PortalRoute>
          }
        />
        {(["empresas", "sobre", "contato", "ajuda", "status"] as const).map(
          (page) => (
            <Route
              key={page}
              path={`/${page}`}
              element={
                <PortalRoute>
                  <InfoPage page={page} />
                </PortalRoute>
              }
            />
          ),
        )}
        <Route path="/app" element={<Navigate to="/app/inicio" replace />} />
        <Route
          path="/app/inicio"
          element={
            <ClientRoute>
              <ClientHome />
            </ClientRoute>
          }
        />
        <Route
          path="/app/plano"
          element={
            <ClientRoute>
              <ClientPlan />
            </ClientRoute>
          }
        />
        <Route
          path="/app/instalacao"
          element={
            <ClientRoute>
              <InstallationPage />
            </ClientRoute>
          }
        />
        <Route
          path="/app/faturas"
          element={
            <ClientRoute>
              <InvoicesPage />
            </ClientRoute>
          }
        />
        <Route
          path="/app/faturas/:id"
          element={
            <ClientRoute>
              <InvoiceDetail />
            </ClientRoute>
          }
        />
        <Route
          path="/app/suporte"
          element={
            <ClientRoute>
              <SupportPage />
            </ClientRoute>
          }
        />
        <Route
          path="/app/suporte/:id"
          element={
            <ClientRoute>
              <TicketDetail />
            </ClientRoute>
          }
        />
        <Route
          path="/app/avisos"
          element={
            <ClientRoute>
              <NoticesPage />
            </ClientRoute>
          }
        />
        <Route
          path="/app/documentos"
          element={
            <ClientRoute>
              <DocumentsPage />
            </ClientRoute>
          }
        />
        <Route
          path="/app/perfil"
          element={
            <ClientRoute>
              <ProfilePage />
            </ClientRoute>
          }
        />
        <Route path="/crm" element={<Navigate to="/crm/dashboard" replace />} />
        <Route
          path="/crm/dashboard"
          element={
            <CrmRoute>
              <DashboardPage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/leads"
          element={
            <CrmRoute>
              <LeadsPage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/leads/:id"
          element={
            <CrmRoute>
              <LeadsPage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/clientes"
          element={
            <CrmRoute>
              <ClientsPage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/clientes/:id"
          element={
            <CrmRoute>
              <ClientsPage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/contratos"
          element={
            <CrmRoute>
              <ContractsPage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/agenda"
          element={
            <CrmRoute>
              <OrdersPage agenda />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/ordens"
          element={
            <CrmRoute>
              <OrdersPage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/chamados"
          element={
            <CrmRoute>
              <TicketsPage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/financeiro"
          element={
            <CrmRoute>
              <FinancePage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/avisos"
          element={
            <CrmRoute>
              <NoticesAdminPage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/catalogo"
          element={
            <CrmRoute>
              <CatalogPage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/conteudo"
          element={
            <CrmRoute>
              <ContentPage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/relatorios"
          element={
            <CrmRoute>
              <ReportsPage />
            </CrmRoute>
          }
        />
        <Route
          path="/crm/configuracoes"
          element={
            <CrmRoute>
              <SettingsPage />
            </CrmRoute>
          }
        />
        <Route path="/tecnico" element={<TechnicianPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PresentationDock />
    </Suspense>
  );
}
