import type { PrismaClient } from '../deps.js'

const DAY = 24 * 60 * 60 * 1000
export const IP_RETENTION_DAYS = 90
const ACTIVITY_RETENTION_DAYS = 400

/** Drops what the privacy policy promises not to keep: addresses after 90 days, activity after 400. */
export async function cleanupOldData(prisma: PrismaClient, now = new Date()) {
  await prisma.session.updateMany({
    where: { ipPrefix: { not: null }, createdAt: { lt: new Date(now.getTime() - IP_RETENTION_DAYS * DAY) } },
    data: { ipPrefix: null },
  })
  await prisma.userActivity.deleteMany({ where: { day: { lt: new Date(now.getTime() - ACTIVITY_RETENTION_DAYS * DAY) } } })
}

/** Runs the cleanup now and then once a day while the server is up. */
export function scheduleCleanup(prisma: PrismaClient, log: { warn(obj: unknown, msg?: string): void }) {
  const run = () => cleanupOldData(prisma).catch((err: unknown) => log.warn({ err }, 'Data cleanup failed'))
  void run()
  const timer = setInterval(run, DAY)
  timer.unref()
  return () => clearInterval(timer)
}
