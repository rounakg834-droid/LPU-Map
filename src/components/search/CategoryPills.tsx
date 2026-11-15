import React, { useRef } from 'react';
import { CATEGORIES } from '../../data/locations';
import { LocationCategory } from '../../types/location';
import {
  GraduationCap,
  Home,
  Building,
  BookOpen,
  ShoppingBag,
  Theater,
  Utensils,
  HeartPulse,
  Trophy,
  SquareParking,
  DoorOpen,
  Briefcase,
  Layers,
} from 'lucide-react';

interface CategoryPillsProps {
  selectedCategory: LocationCategory | 'all';
  onSelectCategory: (category: LocationCategory | 'all') => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (category: LocationCategory | 'all', className = 'w-3 h-3') => {
    switch (category) {
      case 'all':
        return <Layers className={className} />;
      case 'academic':
        return <GraduationCap className={className} />;
      case 'hostel_boys':
        return <Home className={className} />;
      case 'hostel_girls':
        return <Building className={className} />;
      case 'library':
        return <BookOpen className={className} />;
      case 'commercial':
        return <ShoppingBag className={className} />;
      case 'auditorium_events':
        return <Theater className={className} />;
      case 'cafeteria':
        return <Utensils className={className} />;
      case 'medical':
        return <HeartPulse className={className} />;
      case 'sports':
        return <Trophy className={className} />;
      case 'parking':
        return <SquareParking className={className} />;
      case 'gate':
        return <DoorOpen className={className} />;
      case 'administration':
        return <Briefcase className={className} />;
    }
  };

  return (
    <div className="w-full relative select-none">
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain touch-pan-x flex items-center gap-1.5 py-1 px-1"
      >
        {/* "All" category pill */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95 flex-shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-semibold'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl text-slate-700 dark:text-slate-200 border border-black/[0.05] dark:border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-white/95'
          }`}
        >
          {getCategoryIcon('all')}
          <span>All Campus</span>
        </button>

        {/* Dynamic categories */}
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95 flex-shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-semibold'
                  : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl text-slate-700 dark:text-slate-200 border border-black/[0.05] dark:border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-white/95'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
