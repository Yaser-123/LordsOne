import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Optional defense-in-depth secret check if configured in environment
    const requiredSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (requiredSecret) {
      const providedSecret = request.headers.get('x-bootstrap-secret');
      if (providedSecret !== requiredSecret) {
        return NextResponse.json({ error: 'Invalid or missing bootstrap secret' }, { status: 403 });
      }
    }

    // 1. Check if any admin already exists in the system
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'superadmin']);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // If an administrator already exists, lock this route permanently
    if (count && count > 0) {
      return NextResponse.json(
        {
          error: 'Administrator already provisioned. Initial setup bootstrap is permanently closed.',
          bootstrapped: true,
        },
        { status: 403 }
      );
    }

    // 2. Elevate the current authenticated user to superadmin
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'superadmin',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 3. Record audit log
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'system_bootstrap_superadmin',
      entity_type: 'profile',
      entity_id: user.id,
      details: {
        email: user.email,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Initial administrator successfully initialized.',
      profile: updatedProfile,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
