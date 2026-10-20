---
tags:
  - demo
  - report
author: Demo author
status: draft
---
This paragraph comes before the first heading. It appears in the picker as **Content before the first heading**, so you can include or leave out the intro on its own.

# Quarterly project report

A realistic note with mixed content, to check that the selective export looks the same as Obsidian's built-in export.

## Summary

The project is **on track**. Two milestones were delivered and one slipped by a week.[^slip]

> [!note] Key takeaway
> Delivery is steady, but the integration test suite needs more investment.

[^slip]: The slip was caused by a dependency upgrade.

## Milestones

| Milestone           | Due        | Status    |
| ------------------- | ---------- | --------- |
| Design sign-off     | 2026-07-01 | Done      |
| Beta release        | 2026-08-15 | Done      |
| General release     | 2026-09-30 | Late      |

### Beta release

The beta reached 120 testers. See [[Embedded snippet]] for the raw notes.

### General release

Moved by one week to fix an upgrade regression.

## Technical notes

### Architecture

![[diagram.svg]]

The service is split into an API layer and a worker pool.

```ts
export function schedule(job: Job): void {
	// # This is a comment, not a heading
	queue.push(job);
}
```

### Performance

Throughput scales roughly as $T(n) = k \cdot n^{0.9}$ for $n$ workers.

$$
\text{latency}_{p99} = 180\,\text{ms}
$$

## Embedded content

The whole snippet note:

![[Embedded snippet]]

A single section of it:

![[Embedded snippet#Part B]]

## Risks

- [ ] Hiring for the platform team
- [x] Vendor contract renewal
- [ ] Test suite flakiness

## Appendix

### Glossary

**SLO**
: Service level objective.

### Change log

1. Initial draft.
2. Added risk list.
