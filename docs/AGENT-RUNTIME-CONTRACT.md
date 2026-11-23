# Agent task admission contract — implementation tranche 1

This public repository now includes a small pure-JavaScript **admission policy** at `runtime/agent-policy.mjs` with offline tests. It is not a seL4-based execution environment, process sandbox, network isolator, credential broker or formal-verification claim.

## Contract inputs
- Server-verified principal: tenant, actor and active membership.
- Server-sourced delegation: bound tenant, actor, run, capability set, expiry, revocation and authorization evidence.
- Requested task: tenant, run, capability, operation, resource limits and write approval.
- Trusted capability record: stable ID and operation.

The evaluator denies by default and returns an immutable admission decision. **Callers must obtain all fields from their trusted Identity/Universal Connect service**, never from user-controlled form data. Every privileged side effect must re-evaluate authorization as close to execution as practical. A positive admission decision is insufficient to execute untrusted code without independently verified isolation controls.

## Test
`node --test runtime/agent-policy.test.mjs`

## Next mandatory work
Enforced isolated runtime; network egress allowlisting; short-lived credential brokerage; supervisor quotas; revocation cancellation; attested artifact provenance; cross-tenant adversarial testing and reproducible seL4-backed test builds. Private security-sensitive implementation remains private; no deployment claims.
