# message-time

A Claude Code mod that shows the date and time under each of Claude's messages, in small dim text (Polish time, `DD.MM.YYYY HH:MM:SS`). The terminal draws it dim; the desktop and mobile apps draw it at caption size. Times are recorded when a message is added to the transcript and kept across resumed sessions; messages from before the mod was installed have no time.

## Install

At the prompt of a terminal session:

```
/plugin install message-time --marketplace qmw/claude-message-time
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install message-time --marketplace qmw/claude-message-time
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `qmw/claude-message-time`, then Add plugin.
