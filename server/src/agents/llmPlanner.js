import { ALLOWED_TOOLS } from '../config/constants.js';

/**
 * Optional LLM-Assisted Planning and Synthesis Engine
 * Connects to Google Gemini API only if GEMINI_API_KEY is explicitly configured.
 * Strictly bounded to allowlisted tools and verified outputs.
 */
export class LLMPlanner {
  constructor(apiKey = process.env.GEMINI_API_KEY) {
    this.apiKey = apiKey ? apiKey.trim() : null;
    this.model = 'gemini-2.5-flash';
    this.timeoutMs = 6000;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  /**
   * Propose a bounded execution plan for a user prompt
   */
  async proposePlan(taskPrompt, availableContext = {}) {
    if (!this.isConfigured()) {
      return {
        success: false,
        fallback_to_local: true,
        reason: 'GEMINI_API_KEY not configured. Defaulting to deterministic local orchestration.'
      };
    }

    const systemPrompt = `You are a bounded AI Orchestrator for an Indian Financial Advisory and Fraud Detection System.
Given the user task, propose an execution plan using ONLY these allowed tools:
${JSON.stringify(ALLOWED_TOOLS)}

Output MUST be a single raw JSON object with this exact schema:
{
  "workflow_type": "FINANCIAL_ADVISORY" | "TRANSACTION_RISK" | "COMBINED_HEALTH" | "FINANCIAL_EDUCATION" | "TOOL_FAILURE_DEMO",
  "plan_description": "short summary of plan",
  "steps": [
    {
      "step_id": 1,
      "agent": "Financial Advisory Agent" | "Fraud Detection Agent" | "Financial Health / Analysis Agent" | "Explanation and Reporting Agent",
      "tool": "one of the allowed tools",
      "rationale": "why this tool is needed"
    }
  ]
}
Do not write markdown, code blocks, backticks, or preamble. Return ONLY valid JSON.`;

    try {
      const response = await this.callGeminiAPI(systemPrompt, `User task: "${taskPrompt}"\nContext: ${JSON.stringify(availableContext)}`);
      const parsedPlan = this.parseAndValidatePlan(response);
      return {
        success: true,
        mode: 'LLM_ASSISTED',
        plan: parsedPlan
      };
    } catch (err) {
      return {
        success: false,
        fallback_to_local: true,
        reason: `LLM API planning failed: ${err.message}. Seamlessly reverting to local agent mode.`
      };
    }
  }

  /**
   * Synthesize final user-facing explanation from verified tool outputs
   */
  async synthesizeExplanation(taskPrompt, executionTrace, structuredFindings) {
    if (!this.isConfigured()) {
      return {
        success: false,
        fallback_to_local: true,
        reason: 'GEMINI_API_KEY not configured. Using deterministic explanation template.'
      };
    }

    const prompt = `You are the Explanation and Reporting Agent for an Indian FinTech system.
You MUST summarize the following ACTUAL structured tool results for the user's task.
CRITICAL RULES:
- Ground your answer ONLY in the provided verified tool outputs.
- Never invent numbers, interest rates, or government rules.
- Format all currency in Indian Rupees (₹).
- Explicitly state assumptions, warnings, and next steps.

User Task: "${taskPrompt}"
Verified Execution Trace:
${JSON.stringify(executionTrace, null, 2)}
Structured Findings:
${JSON.stringify(structuredFindings, null, 2)}

Provide a concise, encouraging, non-expert friendly explanation in markdown format.`;

    try {
      const text = await this.callGeminiAPI('You are a grounded financial explainer.', prompt);
      return {
        success: true,
        mode: 'LLM_ASSISTED',
        explanation: text.trim()
      };
    } catch (err) {
      return {
        success: false,
        fallback_to_local: true,
        reason: `LLM synthesis unavailable: ${err.message}. Defaulting to deterministic template.`
      };
    }
  }

  async callGeminiAPI(systemInstruction, userContent) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\n${userContent}` }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!resp.ok) {
        throw new Error(`Gemini API returned HTTP status ${resp.status}`);
      }

      const data = await resp.json();
      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidate) throw new Error('Empty response received from Gemini API');
      return candidate;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  parseAndValidatePlan(rawText) {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    clean = clean.trim();

    const plan = JSON.parse(clean);

    if (!Array.isArray(plan.steps)) {
      throw new Error('Proposed plan must contain an array of steps.');
    }

    // Strict allowlist security check on every LLM-proposed tool
    for (const step of plan.steps) {
      if (step.tool && !ALLOWED_TOOLS.includes(step.tool)) {
        throw new Error(`LLM proposed disallowed tool: ${step.tool}`);
      }
    }

    return plan;
  }
}
