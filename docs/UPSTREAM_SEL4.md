# Upstream seL4 Foundation

TrillionOS-Security uses the official upstream seL4 project as its microkernel foundation.

The upstream source is intentionally kept separate from Trillion-owned source code. The repository records an exact release and commit in `sel4/manifest.lock`, and the verification workflow fetches that source directly from the official `seL4/seL4` repository.

Current pin:

- seL4 release: `16.0.0`
- kernel commit: `6e7c3b733d296cfd88d5fbf635c96e447a882374`
- official repository: `https://github.com/seL4/seL4.git`

The purpose of this separation is to preserve a clean upstream boundary, avoid silently modifying the kernel, make provenance auditable, and keep Trillion-owned security software independent.

## Important assurance boundary

Using upstream seL4 does not by itself make the complete TrillionOS-Security platform formally verified or certified.

Formal verification and certification claims are configuration- and scope-specific. Trillion-owned services, policies, integration code, and deployed products require their own evidence and review.

## Third-party licensing

seL4 remains governed by its upstream licence and notices. Trillion-owned source code is separate and is not intended to relicense upstream seL4.
