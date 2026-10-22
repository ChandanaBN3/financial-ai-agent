import { createApp } from './app.js';
import { Repository } from './db/repository.js';
import { LLMPlanner } from './agents/llmPlanner.js';

const PORT = process.env.PORT || 5000;
const app = createApp();

// Seed initial database records
try {
  const repo = new Repository();
  repo.seedInitialDataIfEmpty();
  console.log('✅ SQLite database initialized and seeded with demo records.');
} catch (err) {
  console.error('⚠️ Database initialization warning:', err.message);
}

const server = app.listen(PORT, () => {
  const llmPlanner = new LLMPlanner();
  const mode = llmPlanner.isConfigured() ? 'LLM-Assisted Mode (Gemini API Active)' : 'Local Agent Mode (100% Offline & Deterministic)';

  console.log('================================================================');
  console.log('🚀 MoneyWise: Personal Financial Advisory & Payment Safety');
  console.log(`📡 Backend API running on: http://localhost:${PORT}`);
  console.log(`🤖 Agent Orchestration Mode: ${mode}`);
  console.log(`🇮🇳 Currency: INR (₹) | Locale: en-IN | Timezone: IST`);
  console.log('================================================================');
});

export { app, server };
