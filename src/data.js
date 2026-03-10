const TASKS = [
  "Update documentatie", "Review pull request", "Fix login bug", "Deploy naar staging",
  "Database migratie", "API endpoint toevoegen", "Unit tests schrijven", "Code review doen",
  "Design mock-up maken", "Klant bellen", "Sprint planning", "Retrospective voorbereiden",
  "Dependencies updaten", "Security audit", "Performance optimalisatie", "Error logging instellen",
  "Backup configureren", "SSL certificaat vernieuwen", "Load balancer instellen", "Cache legen",
  "Rapport genereren", "Email beantwoorden", "Meeting voorbereiden", "Factuur versturen",
  "Budget bijwerken", "Offerte maken", "Contract opstellen", "Onboarding document",
  "Test omgeving opzetten", "CI/CD pipeline fixen", "Docker image bouwen", "Kubernetes config",
  "Monitoring instellen", "Alert regels toevoegen", "Dashboard maken", "Data exporteren",
  "Import script schrijven", "Validatie toevoegen", "Formulier bouwen", "Navigatie aanpassen",
  "Zoekfunctie bouwen", "Filter logica", "Sortering implementeren", "Paginering toevoegen",
  "Responsive maken", "Accessibility check", "SEO optimalisatie", "Analytics instellen",
  "A/B test opzetten", "Feedback verwerken", "Bugrapport analyseren", "Hotfix deployen",
  "Rollback voorbereiden", "Feature flag toevoegen", "Configuratie aanpassen", "Env variabelen",
  "Wachtwoord reset flow", "2FA implementeren", "OAuth koppelen", "Webhook toevoegen",
  "Rate limiting", "CORS instellen", "Input sanitizen", "XSS beveiliging",
  "SQL injection check", "Penetratietest", "Audit log bijhouden", "GDPR compliance",
  "Cookie banner", "Privacy policy", "Terms of service", "Licentie controleren",
  "Open source audit", "Dependency vulnerability scan", "Code style handhaven", "Linter instellen",
  "Formatter configureren", "Git hooks toevoegen", "Branch strategie bepalen", "Release notes",
  "Changelog bijwerken", "Versienummer ophogen", "Tag aanmaken", "Package publiceren",
  "Documentatie hosten", "Storybook bijwerken", "Component library", "Design tokens",
  "Kleurpalet vastleggen", "Typografie kiezen", "Icon set toevoegen", "Animaties finetunen",
  "Dark mode testen", "Print stylesheet", "PDF genereren", "Email template bouwen",
  "Notificatie systeem", "Push notificaties", "SMS integratie", "Chat functie",
  "Commentaar sectie", "Like systeem", "Rating component", "Review module",
  "Gebruikersbeheer", "Rollen en rechten", "Admin panel", "Audit trail",
];

export const LIST_NAMES = [
  "Backlog", "Sprint 1", "Sprint 2", "Sprint 3", "In Progress", "Review", "Testing",
  "Done", "Bugs", "Features", "Design", "Backend", "Frontend", "DevOps", "Security",
  "Marketing", "Support", "Research", "Planning", "Finance", "HR", "Legal", "Sales",
  "Ops", "Data", "Mobile", "API", "Database", "Infrastructure", "Monitoring",
  "Q1 Goals", "Q2 Goals", "Q3 Goals", "Q4 Goals", "2026 Roadmap", "Tech Debt",
  "Nice to Have", "On Hold", "Blocked", "Urgent", "Critical", "Low Prio", "Ideas",
  "Experiments", "Archive", "External", "Clients", "Partners", "Team A", "Team B",
];

export const COLORS = [
  "#4a6cf7", "#7c3aed", "#db2777", "#dc2626", "#ea580c",
  "#d97706", "#16a34a", "#0891b2", "#0284c7", "#6366f1",
];

const DESCRIPTIONS = [
  "Check with the team before starting. Make sure all dependencies are in place and the environment is ready.",
  "Blocked by upstream task. Follow up in the next standup to get unblocked.",
  "See ticket #4821 for full context. Estimated 2-4 hours of work.",
  "Low priority but should be done before end of sprint. No external dependencies.",
  "Needs sign-off from design before implementation can start.",
  "Recurring task — run every Monday morning and report results in Slack.",
  "Performance impact unclear. Benchmark before and after to validate the change.",
  "Related to the Q2 roadmap initiative. Coordinate with the backend team.",
  "Already partially done in branch `feature/cleanup`. Pick up from there.",
  "Customer-facing change. Needs QA approval and release note before deploy.",
  "Discuss with stakeholders first. There may be compliance implications.",
  "Simple change, but test coverage must stay above 80% after this.",
  "Introduced in the last sprint retro as a pain point. High team impact.",
  "Depends on the API contract being finalized. Waiting on backend.",
  "Can be paired with the refactor task to save time.",
  "Affects the mobile app as well — coordinate with the mobile team.",
  "Quick win. Should take less than 30 minutes if environment is set up.",
  "Do not merge without a second code review. Security-sensitive area.",
  "Part of the tech debt cleanup initiative for this quarter.",
  "Check if this is already covered by an existing utility before building from scratch.",
];

const taskLabel = (index) => {
  const base = TASKS[index % TASKS.length];
  const suffix = index >= TASKS.length ? ` ${Math.floor(index / TASKS.length) + 1}` : "";
  return base + suffix;
};

const itemDescription = (listIndex, itemIndex) => {
  const seed = listIndex * 97 + itemIndex * 31;
  return seed % 2 === 0 ? DESCRIPTIONS[seed % DESCRIPTIONS.length] : "";
};

export const generateLists = (listCount = 50, itemsPerList = 200) =>
  Array.from({ length: listCount }, (_, listIndex) => ({
    id: `list-${listIndex}`,
    name: LIST_NAMES[listIndex],
    color: COLORS[listIndex % COLORS.length],
    items: Array.from({ length: itemsPerList }, (_, i) => ({
      id: `list-${listIndex}-item-${i}`,
      label: taskLabel(i),
      description: itemDescription(listIndex, i),
    })),
  }));
