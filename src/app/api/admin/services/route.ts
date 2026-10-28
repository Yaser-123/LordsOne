import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { serviceFormSchema } from '@/lib/utils/validation';

export async function GET() {
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

    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ services: services || [] });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = serviceFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid service configuration', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { data: newService, error } = await supabase
      .from('services')
      .insert(validation.data)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Auto-generate next 7 days default slots for this service
    if (newService) {
      const times = [
        { start: '09:00:00', end: '11:00:00' },
        { start: '11:30:00', end: '13:30:00' },
        { start: '14:00:00', end: '16:00:00' },
        { start: '16:30:00', end: '18:30:00' },
      ];

      const slotsToInsert = [];
      for (let i = 0; i <= 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];

        for (const t of times) {
          slotsToInsert.push({
            service_id: newService.id,
            slot_date: dateStr,
            start_time: t.start,
            end_time: t.end,
            capacity: newService.capacity,
            booked_count: 0,
            is_available: true,
          });
        }
      }

      await supabase.from('service_slots').insert(slotsToInsert);
    }

    return NextResponse.json({ success: true, service: newService }, { status: 201 });
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, is_active, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof is_active === 'boolean') {
      payload.is_active = is_active;
    }

    Object.assign(payload, updates);

    const { data: updatedService, error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, service: updatedService });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
