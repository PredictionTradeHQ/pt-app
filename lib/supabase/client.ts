import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const configurationError = new Error(
      'Supabase no esta configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )

    return {
      auth: {
        async getUser() {
          return { data: { user: null }, error: configurationError }
        },
        onAuthStateChange() {
          return {
            data: {
              subscription: {
                unsubscribe() {},
              },
            },
          }
        },
        async signOut() {
          return { error: configurationError }
        },
        async signInWithPassword() {
          return { data: { user: null, session: null }, error: configurationError }
        },
        async signUp() {
          return { data: { user: null, session: null }, error: configurationError }
        },
      },
    } as any
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
  )
}
