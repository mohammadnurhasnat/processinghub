# System Execution & Reasoning Guidelines

## Proportional Reasoning (No Overthinking)
- **Match effort to task complexity**: Use minimal, direct reasoning for straightforward UI, text, styling, or single-file edits. Reserve deeper analysis only for complex architecture, multi-file state, security, or debugging unclear root causes.
- **Avoid redundant loops**: Do not re-read files already in context, do not perform speculative checks on unrelated files, and do not over-analyze edge cases that do not apply to the request.
- **Act immediately on clear requests**: Once the exact target lines and required change are known, apply the edit directly in one clean batch without second-guessing or rehearsing alternatives internally.

## Tool & Edit Efficiency
- **Batch reads and edits**: Read only the needed files or line ranges in parallel, and apply changes cleanly in as few turns as possible.
- **No unnecessary refactoring**: Change strictly what was requested. Keep surrounding working code untouched.
- **Fast final verification**: Run build and lint checks once after completing all edits, not between intermediate steps unless debugging an active error.
