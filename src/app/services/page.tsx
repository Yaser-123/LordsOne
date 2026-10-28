'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ServiceCard } from '@/components/services/ServiceCard';
import { CategoryFilter } from '@/components/services/CategoryFilter';
import { Service } from '@/types/database';
import { Search, SlidersHorizontal, AlertCircle, Compass } from 'lucide-react';

export default function ServicesDiscoveryPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState('title_asc');

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (search) params.set('search', search);
        if (priceFilter === 'free') params.set('free', 'true');
        params.set('sort', sortBy);

        const res = await fetch(`/api/services?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load services');
        const data = await res.json();
        setServices(data.services || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchServices();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCategory, search, priceFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-10 lg:py-14 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Facility Discovery Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Campus Facilities & Services
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Discover academic research laboratories, sports complexes, seminar auditoriums, and specialized engineering equipment at LIET Hyderabad.
          </p>
        </div>
      </section>

      {/* Main Content & Filters */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Category Pill Bar */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Search, Price, and Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by facility name, block, or keywords..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-xs"
            />
          </div>

          {/* Filter Badges & Sort Dropdown */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0">
            {/* Price Filter */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPriceFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  priceFilter === 'all'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setPriceFilter('free')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  priceFilter === 'free'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Free
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="title_asc">Name (A-Z)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="capacity_desc">Highest Capacity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-navy-900">{services.length}</strong> active campus services
          </span>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-brand-600 font-bold hover:underline"
            >
              Reset category filter
            </button>
          )}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 animate-pulse shadow-xs"
              >
                <div className="aspect-[16/10] bg-slate-200 rounded-lg" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-10 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-navy-900 text-sm">No campus facilities found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No active services matched your current category, search query, or pricing filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {services.map((svc) => (
              <ServiceCard key={svc.id} service={svc} hrefPrefix="/services" />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
