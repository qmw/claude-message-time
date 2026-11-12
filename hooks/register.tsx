import type { Register } from 'claude-code'

// uuid of an assistant transcript row -> epoch ms when it was appended.
// Kept in $.store so a resumed session still shows the times.
const KEY = 'times'
const KEEP = 3000

const pad = (n: number) => String(n).padStart(2, '0')

function format(ms: number): string {
  try {
    const parts = new Intl.DateTimeFormat('pl-PL', {
      timeZone: 'Europe/Warsaw',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).formatToParts(new Date(ms))
    const p = Object.fromEntries(parts.map(x => [x.type, x.value]))
    return `${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}:${p.second}`
  } catch {
    const d = new Date(ms)
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }
}

export const register: Register = on => {
  let times: Record<string, number> | null = null

  const fromStore = (stored: unknown): Record<string, number> =>
    stored && typeof stored === 'object' ? { ...(stored as Record<string, number>) } : {}

  on('session.append', ($, e, next) => {
    if (e.agentId === undefined && e.message.type === 'assistant') {
      const record = async () => {
        const map = times ??= fromStore(await $.store.get(KEY))
        map[e.uuid] = await $.clock.now()
        const ids = Object.keys(map)
        if (ids.length > KEEP) for (const id of ids.slice(0, ids.length - KEEP)) delete map[id]
        await $.store.set(KEY, map)
      }
      // never hold up the transcript; a missing time just draws nothing
      void record().catch(() => undefined)
    }
    return next(e)
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const map = times ??= fromStore(await $.store.get(KEY))
    const at = map[e.requestId]
    if (at === undefined) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        {await next(e)}
        <Text dimColor size="caption">{format(at)}</Text>
      </Box>
    )
  })
}
