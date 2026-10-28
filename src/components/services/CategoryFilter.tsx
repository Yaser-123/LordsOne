'use client';

import React from 'react';
import { CATEGORY_META } from '@/lib/utils/utils';
import { ServiceCategory } from '@/types/database';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Services' },
    ...Object.entries(CATEGORY_META).map(([key, val]) => ({
      key,
      label: val.label,
    })),
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((c) => {
        const isSelected = selectedCategory === c.key;
        return (
          <button
            key={c.key}
            onClick={() => onSelectCategory(c.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              isSelected
                ? 'bg-navy-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-navy-900'
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
