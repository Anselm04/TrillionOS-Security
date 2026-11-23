import test from 'node:test';
import assert from 'node:assert/strict';
import {authorizeAgentTask} from './agent-policy.mjs';
const time=1000;
function input(){return {
  principal:{tenantId:'tenant-a',actorId:'user-1',active:true},
  delegation:{tenantId:'tenant-a',actorId:'user-1',runId:'run-1',approved:true,revoked:false,
    expiresAt:2000,capabilities:['github.read','github.write'],approvalId:'approve-1'},
  task:{tenantId:'tenant-a',runId:'run-1',capabilityId:'github.read',operation:'read',maxRuntimeMs:10000,maxMemoryMiB:128},
  capability:{id:'github.read',operation:'read'}
}}
test('admit explicitly approved tenant-scoped read under resource limits',()=>{
  assert.equal(authorizeAgentTask(input(),time).allowed,true);
});
test('deny missing request, tenant mismatch and revoked delegation',()=>{
  assert.equal(authorizeAgentTask(null,time).allowed,false);
  const wrong=input();wrong.task.tenantId='tenant-b';
  assert.equal(authorizeAgentTask(wrong,time).reason,'scope_mismatch');
  const revoked=input();revoked.delegation.revoked=true;
  assert.equal(authorizeAgentTask(revoked,time).reason,'not_authorized');
});
test('deny expired delegation and capabilities not granted',()=>{
  assert.equal(authorizeAgentTask(input(),2000).reason,'delegation_expired');
  const bad=input();bad.task.capabilityId='github.delete';
  assert.equal(authorizeAgentTask(bad,time).allowed,false);
});
test('require distinct write approval and resource caps',()=>{
  const write=input();write.task.operation='write';write.task.capabilityId='github.write';
  write.capability.operation='write';write.capability.id='github.write';
  assert.equal(authorizeAgentTask(write,time).reason,'write_approval_required');
  write.task.approvalId='approve-1';
  assert.equal(authorizeAgentTask(write,time).allowed,true);
  write.task.maxMemoryMiB=8192;
  assert.equal(authorizeAgentTask(write,time).reason,'resource_cap_invalid');
});
