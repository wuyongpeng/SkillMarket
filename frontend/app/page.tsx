import { createClient } from '@/lib/supabase/server'
import PageClient from '@/components/PageClient'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <PageClient user={user} />
}
