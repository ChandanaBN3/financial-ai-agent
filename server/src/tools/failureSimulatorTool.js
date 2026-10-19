/**
 * Controlled Tool Failure Simulator
 * Used to test, verify, and demonstrate truthful error handling in the multi-agent workflow.
 */
export function simulateToolFailure(params = {}) {
  const reason = params.reason || 'Simulated upstream service timeout or invalid resource constraint.';
  const code = params.error_code || 'SIMULATED_TOOL_EXCEPTION';

  // Intentionally return a structured deterministic tool failure
  return {
    success: false,
    error: `Controlled Tool Failure: ${reason}`,
    error_code: code,
    failed_at: new Date().toISOString(),
    is_simulated: true,
    advice: 'Verify tool input arguments, check service connectivity, or review system constraints.'
  };
}
