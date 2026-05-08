import { CRM } from "@/components/atomic-crm/root/CRM";

// ── CUSTOM: Insights cross-database dataProvider ─────────────────
import { getDataProvider } from "@/components/atomic-crm/providers/supabase";
import { insightsDataProvider } from "@/components/atomic-crm/insights/insightsDataProvider";
import { createWrappedDataProvider } from "@/components/atomic-crm/insights/wrappedDataProvider";

const wrappedDataProvider = createWrappedDataProvider(
  getDataProvider(),
  insightsDataProvider
);
// ── END CUSTOM ───────────────────────────────────────────────────

/**
 * Application entry point
 *
 * Customize Atomic CRM by passing props to the CRM component:
 *  - companySectors
 *  - darkTheme
 *  - dealCategories
 *  - dealPipelineStatuses
 *  - dealStages
 *  - lightTheme
 *  - logo
 *  - noteStatuses
 *  - taskTypes
 *  - title
 * ... as well as all the props accepted by shadcn-admin-kit's <Admin> component.
 *
 * @example
 * const App = () => (
 *    <CRM
 *       logo="./img/logo.png"
 *       title="Acme CRM"
 *    />
 * );
 */
//const App = () => <CRM />;
const App = () => <CRM dataProvider={wrappedDataProvider} />;

export default App;
