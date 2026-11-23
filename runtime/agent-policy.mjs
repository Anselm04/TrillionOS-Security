/**
 * Explicit deny-by-default admission contract. This is NOT an isolation runtime.
 * No secrets or proprietary policy rules are stored in this public repository.
 */
const safeId = value => typeof value === 'string' && /^[a-zA-Z0-9][\w.:-]{0,127}$/.test(value);
const operations = new Set(['read','write','execute']);
export function authorizeAgentTask(input, now = Date.now()) {
  const deny = reason => Object.freeze({allowed:false,reason});
  if (!input || typeof input !== 'object') return deny('invalid_request');
  const {principal,delegation,task,capability}=input;
  if (![principal,delegation,task,capability].every(x => x && typeof x === 'object')) return deny('missing_security_context');
  if (![principal.tenantId,principal.actorId,delegation.tenantId,delegation.actorId,
    delegation.runId,task.tenantId,task.runId,task.capabilityId,capability.id].every(safeId))
    return deny('invalid_identity');
  if (principal.tenantId!==delegation.tenantId || principal.tenantId!==task.tenantId ||
      principal.actorId!==delegation.actorId || task.runId!==delegation.runId)
    return deny('scope_mismatch');
  if (principal.active!==true || delegation.revoked===true || delegation.approved!==true)
    return deny('not_authorized');
  if (!Number.isSafeInteger(delegation.expiresAt) || !Number.isSafeInteger(now) ||
      now>=delegation.expiresAt) return deny('delegation_expired');
  if (!operations.has(task.operation) || !operations.has(capability.operation))
    return deny('invalid_operation');
  if (task.operation!==capability.operation || task.capabilityId!==capability.id ||
      !Array.isArray(delegation.capabilities) ||
      !delegation.capabilities.includes(capability.id)) return deny('capability_denied');
  if (!Number.isSafeInteger(task.maxRuntimeMs) || task.maxRuntimeMs<1 ||
      task.maxRuntimeMs>300000 || !Number.isSafeInteger(task.maxMemoryMiB) ||
      task.maxMemoryMiB<16 || task.maxMemoryMiB>4096) return deny('resource_cap_invalid');
  if (task.operation!=='read' && !safeId(task.approvalId))
    return deny('write_approval_required');
  if (task.operation!=='read' && task.approvalId!==delegation.approvalId)
    return deny('write_approval_mismatch');
  return Object.freeze({allowed:true,reason:'policy_admitted',tenantId:principal.tenantId,
    runId:task.runId,capabilityId:capability.id,
    maxRuntimeMs:task.maxRuntimeMs,maxMemoryMiB:task.maxMemoryMiB});
}
