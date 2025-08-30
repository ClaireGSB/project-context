---
description: Reads PLAN.md at project root, determines the next incomplete step, and creates a plan to implement it. The last step is to verify (typecheck/tests) and mark the step as done in PLAN.md.
---

Carefully read @claude.md, @README.md, and @PLAN.md.

At the top of PLAN.md, review the summary of completed and incomplete steps. Identify the next incomplete step.

Review the detail of the next step further down in PLAN.md.

Generate a step-by-step, detailed implementation plan to complete the next incomplete step.  The user will validate or iterate with you. Then, when the plan is approved, proceed with the implementation.
As the last steps,
- verify the work (e.g. run npm run typecheck) 
- mark the step as "done" in PLAN.md
- Commit your work using the name and short description of the step you just finished as commit message
