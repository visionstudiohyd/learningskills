import { ListChecks } from 'lucide-react';
import { queryRaw } from '@/lib/db';
import { formatDate, timeAgo } from '@/lib/utils';
import Icon from '@/components/ui/Icon';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Activity Log' };

/** Icon and tone per audit action, so the log is scannable. */
const ACTION_STYLES = {
  login: { icon: 'LogOut', tone: 'bg-brand-50 text-brand-700' },
  logout: { icon: 'LogOut', tone: 'bg-ink-100 text-ink-600' },
  create: { icon: 'Plus', tone: 'bg-emerald-50 text-emerald-700' },
  update: { icon: 'Pencil', tone: 'bg-accent-50 text-accent-700' },
  delete: { icon: 'Trash2', tone: 'bg-rose-50 text-rose-700' },
  toggle: { icon: 'Signal', tone: 'bg-brand-50 text-brand-700' },
  reorder: { icon: 'ArrowDown', tone: 'bg-ink-100 text-ink-600' },
  upload: { icon: 'Upload', tone: 'bg-teal-50 text-teal-700' },
  export: { icon: 'Download', tone: 'bg-ink-100 text-ink-600' },
  settings: { icon: 'Settings', tone: 'bg-brand-50 text-brand-700' },
};

export default async function ActivityPage() {
  const rows = await queryRaw(
    `SELECT id, actor_name, action, entity_type, entity_id, description, ip_address, created_at
       FROM activity_log
      ORDER BY created_at DESC, id DESC
      LIMIT 200`
  ).catch(() => []);

  /* Group by calendar day so the log reads as a diary rather than a flat feed. */
  const groups = [];
  for (const row of rows) {
    const key = new Date(row.created_at).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(row);
    else groups.push({ key, date: row.created_at, items: [row] });
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="font-display text-xl font-bold text-ink-950">Activity log</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Who changed what, and when. The most recent 200 entries — useful when more than one person manages the site.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
            <ListChecks className="h-7 w-7" strokeWidth={1.8} />
          </span>
          <h3 className="mt-4 font-display text-base font-bold text-ink-900">Nothing logged yet</h3>
          <p className="mt-2 max-w-sm text-sm text-ink-500">
            Changes made from the dashboard will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.key}>
              <h3 className="sticky top-16 z-10 -mx-1 bg-ink-100/95 px-1 py-2 font-display text-xs font-bold uppercase tracking-[0.12em] text-ink-500 backdrop-blur">
                {formatDate(group.date)}
              </h3>

              <ul className="mt-2 overflow-hidden rounded-2xl border border-ink-200 bg-white">
                {group.items.map((item) => {
                  const style = ACTION_STYLES[item.action] || { icon: 'Info', tone: 'bg-ink-100 text-ink-600' };
                  return (
                    <li key={item.id} className="flex items-start gap-3 border-b border-ink-200 px-4 py-3 last:border-b-0">
                      <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${style.tone}`}>
                        <Icon name={style.icon} className="h-4 w-4" strokeWidth={2.2} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-ink-800">
                          {item.description || `${item.action} on ${item.entity_type || 'record'}`}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-ink-400">
                          <span className="font-medium text-ink-600">{item.actor_name || 'System'}</span>
                          <span>{timeAgo(item.created_at)}</span>
                          {item.entity_type && <span className="font-mono">{item.entity_type}</span>}
                          {item.ip_address && <span className="font-mono">{item.ip_address}</span>}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
