// netlify/functions/scheduled-rebuild.mjs
//
// Rebuilds production every 72 hours so /data-and-publications/ picks up
// newly tagged Research Hub and publist items — scripts/fetch-dap-data.mjs
// refetches them on every build. Each rebuild also publishes any Strapi
// edits made since the last deploy.
//
// Schedule: 09:00 UTC (4 AM CDT / 3 AM CST) on every third day of the month
// (1st, 4th, … 28th, 31st). Cron has no true "every 72 hours" — the day step
// restarts each month — so runs are 72 h apart except across a month
// boundary, where the gap is shorter (31st → 1st), never longer.
//
// Needs SCHEDULED_REBUILD_HOOK_URL: a Netlify build hook for `main`, set under
// Site configuration → Environment variables with the Functions scope. It
// stays out of this file because the repo is public and anyone holding a
// build hook URL can trigger builds. Scheduled functions run only on the
// published production deploy; to fire one by hand, use Logs → Functions →
// scheduled-rebuild → Run now.

export default async () => {
  const hook = Netlify.env.get('SCHEDULED_REBUILD_HOOK_URL');
  if (!hook) throw new Error('SCHEDULED_REBUILD_HOOK_URL is not set — no rebuild triggered');

  const res = await fetch(hook, { method: 'POST' });
  if (!res.ok) throw new Error(`Build hook returned HTTP ${res.status} — no rebuild triggered`);
  console.log('Scheduled rebuild triggered');
};

export const config = {
  schedule: '0 9 */3 * *',
};
