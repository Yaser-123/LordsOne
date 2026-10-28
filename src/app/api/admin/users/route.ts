import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    let query = supabase
      .from('profiles')
      .select('*, bookings(count)')
      .order('created_at', { ascending: false });

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,roll_number.ilike.%${search}%,department.ilike.%${search}%`
      );
    }

    const { data: users, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminProfile || (adminProfile.role !== 'admin' && adminProfile.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { target_user_id, role, account_status } = body;

    if (!target_user_id) {
      return NextResponse.json({ error: 'target_user_id is required' }, { status: 400 });
    }

    // Prevent self-lockout: an admin cannot demote or suspend themselves
    if (target_user_id === user.id) {
      if (role && role !== adminProfile.role) {
        return NextResponse.json(
          { error: 'Cannot modify your own administrative role. Have another administrator perform this action.' },
          { status: 400 }
        );
      }
      if (account_status && account_status !== 'active') {
        return NextResponse.json(
          { error: 'Cannot deactivate or suspend your own administrator account.' },
          { status: 400 }
        );
      }
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (role) updates.role = role;
    if (account_status) updates.account_status = account_status;

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', target_user_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Record audit log
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'admin_user_update',
      entity_type: 'user_profile',
      entity_id: target_user_id,
      details: updates,
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
