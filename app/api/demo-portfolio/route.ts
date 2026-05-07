import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface DemoPortfolioPayload {
  balance: number
  positions: unknown[]
  activity: unknown[]
  startingBalance: number
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('demo_portfolios')
      .select('balance, positions, activity, starting_balance')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null }, { status: 200 })
      }
      return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
    }

    return NextResponse.json(
      {
        data: {
          balance: Number(data.balance),
          positions: Array.isArray(data.positions) ? data.positions : [],
          activity: Array.isArray(data.activity) ? data.activity : [],
          startingBalance: Number(data.starting_balance),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[demo-portfolio] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = (await request.json()) as Partial<DemoPortfolioPayload>
    const normalized: DemoPortfolioPayload = {
      balance: Number(payload.balance ?? 0),
      positions: Array.isArray(payload.positions) ? payload.positions : [],
      activity: Array.isArray(payload.activity) ? payload.activity : [],
      startingBalance: Number(payload.startingBalance ?? 100000),
    }

    const { error } = await supabase.from('demo_portfolios').upsert(
      {
        user_id: user.id,
        balance: normalized.balance,
        positions: normalized.positions,
        activity: normalized.activity,
        starting_balance: normalized.startingBalance,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )

    if (error) {
      return NextResponse.json({ error: 'Failed to save portfolio' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[demo-portfolio] PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
