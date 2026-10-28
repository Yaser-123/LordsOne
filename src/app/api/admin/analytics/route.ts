import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 1. Fetch total counts across booking states
    const { data: allBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, status, total_price, booking_date, created_at, category:services(category), service:services(title, category), profile:profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (bookingsError) {
      return NextResponse.json({ error: bookingsError.message }, { status: 500 });
    }

    const bookings = allBookings || [];
    const totalBookings = bookings.length;
    const pendingRequests = bookings.filter((b) => b.status === 'pending').length;
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
    const completedBookings = bookings.filter((b) => b.status === 'completed').length;
    const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;

    // 2. Verified Revenue from successful (captured) payments only
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, status, created_at')
      .eq('status', 'captured');

    if (paymentsError) {
      return NextResponse.json({ error: paymentsError.message }, { status: 500 });
    }

    const totalRevenue = (payments || []).reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    // 3. Category distribution
    const categoryCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      // @ts-expect-error category is joined through service
      const cat = b.service?.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));

    // 4. Booking trends (last 7 days)
    const trendsMap: Record<string, { date: string; bookings: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trendsMap[dateStr] = { date: dateStr, bookings: 0, revenue: 0 };
    }

    bookings.forEach((b) => {
      const bDate = b.booking_date || b.created_at.split('T')[0];
      if (trendsMap[bDate]) {
        trendsMap[bDate].bookings += 1;
      }
    });

    (payments || []).forEach((p) => {
      const pDate = p.created_at.split('T')[0];
      if (trendsMap[pDate]) {
        trendsMap[pDate].revenue += Number(p.amount || 0);
      }
    });

    const bookingTrends = Object.values(trendsMap);

    // 5. Recent activity (top 8 bookings)
    const recentActivity = bookings.slice(0, 8);

    // 6. Total active users and active services count
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: servicesCount } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return NextResponse.json({
      metrics: {
        totalBookings,
        pendingRequests,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        totalUsers: usersCount || 0,
        activeServices: servicesCount || 0,
      },
      categoryDistribution,
      bookingTrends,
      recentActivity,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
