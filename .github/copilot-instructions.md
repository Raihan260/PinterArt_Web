Checklist

- [ ] Verify `.github/copilot-instructions.md` exists
- [ ] Clarify project requirements (type, language, frameworks)
- [ ] Scaffold the project (use current directory `.`)
- [ ] Customize the project per user requirements
- [ ] Install required extensions (only if specified)
- [ ] Compile the project and fix errors
- [ ] Create and run tasks (only if needed)
- [ ] Launch the project (ask before debug mode)
- [ ] Ensure documentation is complete (README + this file)

Execution Guidelines

- Track progress with a todo list and mark steps done
- Keep explanations concise; avoid full command outputs
- Use `.` as the working directory for commands
- Avoid media/links unless explicitly requested
- Use VS Code API tool only for VS Code extensions
- Do not suggest reopening the project; it’s already open in VS Code
- Create new folders only when explicitly requested (except `.vscode` for tasks)
- Install only extensions specified by setup info tool
- Assume “Hello World” when project details are not provided
- Confirm assumed features before implementing
- Tasks complete when: project scaffolds and compiles cleanly, README and this file are current, and user has clear launch/debug instructions