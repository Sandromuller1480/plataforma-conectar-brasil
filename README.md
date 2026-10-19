# Conectar Brasil — Protótipo Integrado

Protótipo comercial navegável da Conectar Brasil com portal público, aplicativo web do cliente, CRM operacional e visão móvel do técnico. As quatro experiências utilizam um único estado demonstrativo persistido no navegador.

> Todos os nomes, contatos, endereços, preços, protocolos e operações são fictícios. Esta aplicação não realiza cobrança, autenticação, medição de conexão, provisionamento de rede ou envio de mensagens externas.

## Executar localmente

Requisitos: Node.js 22 ou superior e npm 10 ou superior.

```bash
npm install
npm run dev
```

Build e testes:

```bash
npm test
npm run build
npm run preview
```

## Experiências e rotas

- Portal: `/`, `/planos`, `/cobertura`, `/contratar`, `/empresas`, `/sobre`, `/contato`, `/ajuda` e `/status`.
- Cliente: `/app/inicio`, `/app/plano`, `/app/instalacao`, `/app/faturas`, `/app/faturas/:id`, `/app/suporte`, `/app/suporte/:id`, `/app/avisos`, `/app/documentos` e `/app/perfil`.
- CRM: `/crm/dashboard`, `/crm/leads`, `/crm/leads/:id`, `/crm/clientes`, `/crm/clientes/:id`, `/crm/contratos`, `/crm/agenda`, `/crm/ordens`, `/crm/chamados`, `/crm/financeiro`, `/crm/avisos`, `/crm/catalogo`, `/crm/conteudo`, `/crm/relatorios` e `/crm/configuracoes`.
- Técnico: `/tecnico`.

O menu flutuante na parte inferior alterna entre as experiências e oferece a ação **Restaurar demonstração**, sempre com confirmação.

## Dados iniciais

O cenário é criado apenas quando não há estado válido salvo e contém exatamente:

- 3 planos;
- 12 clientes sintéticos;
- 18 leads;
- 14 contratos;
- 8 ordens de serviço;
- 36 faturas;
- 10 chamados;
- 3 avisos.

Há clientes com duas unidades, contratos ativos e em instalação, faturas pagas e vencidas, chamado aguardando visita e endereço fora da área demonstrativa. Contatos usam `example.com` e os endereços são explicitamente de teste.

## Estado compartilhado

`LocalDemoRepository` centraliza todas as leituras e alterações. Os componentes não acessam `localStorage` diretamente. O estado é normalizado por IDs, possui `schemaVersion`, auditoria e recuperação automática de conteúdo inválido.

As alterações:

- sobrevivem ao recarregamento;
- sincronizam entre abas da mesma origem pelo evento `storage`;
- não sincronizam entre navegadores ou dispositivos diferentes;
- podem ser apagadas e recriadas pelo menu de restauração.

Valores monetários são armazenados em centavos inteiros. Vencimentos são datas de calendário e pagamentos usam instante separado com identificador idempotente.

## Perfis demonstrativos

O CRM permite alternar entre Administrador, Comercial, Atendimento, Financeiro, Técnico e Cliente. O seletor serve apenas para apresentação das jornadas e autoria do histórico; não representa autenticação ou autorização segura.

## Cenários de cobertura

A consulta local usa os campos cidade, UF, CEP, bairro, rua e número:

- bairros comuns retornam **Pré-viável**;
- bairro contendo “Jardim” retorna **Requer análise**;
- bairro contendo “Fora” ou rua contendo “Rural” retorna **Fora da área demonstrativa**.

O CEP isolado nunca confirma cobertura ou disponibilidade de porta. Campo Verde - MT é somente referência provisória.

## Roteiro da demonstração

1. No portal, abra `/contratar`, escolha um plano e envie uma solicitação com contato `example.com`.
2. No CRM, abra `/crm/leads`, localize o protocolo, avance o funil e converta o lead. Uma segunda conversão reutiliza o contrato já criado.
3. Em `/crm/agenda` e `/crm/ordens`, reagende a visita, conclua o checklist e finalize a instalação. O aplicativo reflete o contrato.
4. No aplicativo, selecione um cliente e contrato, abra um chamado e consulte o mesmo protocolo em `/crm/chamados`.
5. No CRM, adicione uma nota interna e uma resposta pública. Somente a resposta pública aparece no aplicativo.
6. Em `/app/faturas`, simule o pagamento e confirme os indicadores de `/crm/financeiro`. Repetir a ação não duplica a baixa.
7. Em `/crm/catalogo`, altere o preço de um plano. O portal usa o novo preço; contratos existentes mantêm o valor acordado.
8. Troque clientes, contratos e perfis, recarregue a página e finalmente restaure a demonstração.

## Estrutura

```text
src/
  components/       componentes e navegação de apresentação
  data/demo/         criação determinística do cenário inicial
  domain/            entidades e contratos tipados
  features/app/      aplicativo web do cliente
  features/crm/      CRM e módulos administrativos
  features/portal/   portal comercial público
  features/tecnico/  visão móvel de ordens
  services/          repositório, persistência e contexto React
```

As áreas maiores são carregadas sob demanda. `vercel.json` encaminha rotas profundas para `index.html`, permitindo abrir e atualizar URLs de app e CRM diretamente na Vercel.

## Verificação realizada

Em 18/10/2026:

- `npm test`: 1 arquivo e 6 testes aprovados;
- conversão única de lead: aprovada;
- pagamento idempotente: aprovado;
- isolamento de notas internas: aprovado;
- preservação de preço contratado: aprovada;
- persistência, recuperação de schema inválido e restauração: aprovadas;
- contagens iniciais exigidas: aprovadas;
- `npm run build`: TypeScript e build de produção aprovados.

O CSS possui breakpoints específicos para celular, tablet e desktop, com navegação sem dependência de hover, tabelas em contêiner próprio, foco visível, alvos de toque mínimos e respeito a movimento reduzido.

## Limitações desta fase

- Sem Supabase, backend, login real ou compartilhamento entre dispositivos.
- Sem Pix, boleto, gateway de pagamento, emissão fiscal ou bloqueio de conexão.
- Sem WhatsApp, e-mail, push, geolocalização, mapas ou APIs externas.
- Sem telemetria, acesso a roteadores, provisionamento ou medição de velocidade.
- Anexos exibem validação local, mas seus bytes não são persistidos.
- Documentos são referências demonstrativas sem valor fiscal ou jurídico.

## Evolução para produção

A versão real exige uma fase própria de arquitetura e homologação, não apenas a troca de uma URL de banco. O caminho previsto inclui Supabase Auth, PostgreSQL, migrações, RLS por usuário e função, armazenamento privado de documentos, backend para regras privilegiadas, auditoria imutável, backup e restauração, observabilidade e ambientes separados.

Também será necessário definir a fonte oficial de cada dado e integrar, quando confirmados pelo provedor, ERP, cobrança, webhooks idempotentes, canais de atendimento e infraestrutura de rede. A entrada em produção depende de migração validada, deduplicação, políticas de privacidade, testes de segurança e homologação operacional.

## Publicação

O projeto está pronto para importação na Vercel como aplicação Vite. O comando de build é `npm run build` e o diretório de saída é `dist`.
