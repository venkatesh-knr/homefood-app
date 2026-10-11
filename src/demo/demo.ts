// Opens and closes the demo home. The sample data and the fake client are loaded only when someone asks for the demo,
// so the normal app does not carry them.
import i18n from '../i18n'
import { queryClient } from '../lib/queryClient'
import { setDemoClient } from '../lib/supabase'
import { setDemoActive } from './demoState'

export async function startDemo(): Promise<void> {
  const [{ default: catalogue }, { buildDemoDb }, { createDemoClient }] = await Promise.all([import('./catalogue.json'), import('./demoData'), import('./fakeClient')])
  const t = i18n.t.bind(i18n)
  const db = buildDemoDb(
    catalogue as unknown as Parameters<typeof buildDemoDb>[0],
    {
      homeName: t('demo.data.homeName'),
      helper: t('demo.data.helper'),
      comments: {
        kaviSpicy: t('demo.data.kaviSpicy'),
        ammaSure: t('demo.data.ammaSure'),
        appaGood: t('demo.data.appaGood'),
        appaBiryani: t('demo.data.appaBiryani'),
        kaviBiryani: t('demo.data.kaviBiryani'),
      },
      notes: { saturday: '' },
    },
    new Date(),
  )
  setDemoClient(createDemoClient(db))
  queryClient.clear()
  setDemoActive(true)
}

/** Ends the demo: everything made up is dropped and the app goes back to the sign-in screen. */
export function stopDemo(): void {
  setDemoActive(false)
  setDemoClient(null)
  queryClient.clear()
}
