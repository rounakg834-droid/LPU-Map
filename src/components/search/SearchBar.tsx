import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Bookmark, Menu } from 'lucide-react';
import { CampusLocation, LocationCategory } from '../../types/location';
import { SearchSuggestions } from './SearchSuggestions';
import { CategoryPills } from './CategoryPills';
import { searchService } from '../../services/searchService';
import { storageService } from '../../services/storageService';
import { googleMapsService } from '../../services/googleMapsService';

interface SearchBarProps {
  onSelectLocation: (location: CampusLocation) => void;
  onOpenSavedModal: () => void;
  onOpenMenu: () => void;
  savedCount: number;
  selectedCategory: LocationCategory | 'all';
  onSelectCategory: (cat: LocationCategory | 'all') => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectLocation,
  onOpenSavedModal,
  onOpenMenu,
  savedCount,
  selectedCategory,
  onSelectCategory,
}) => {
  const [query, setQuery] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [results, setResults] = useState<CampusLocation[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    setRecentSearches(storageService.getRecentSearches());
  }, []);

  // Update search results on query or category change (Campus Directory + Google Places Platform)
  useEffect(() => {
    let isCancelled = false;

    const runSearch = async () => {
      const matched = searchService.search(query, {
        category: selectedCategory,
      });
      setResults(matched);

      // Enrich with Google Places if configured and search term is non-trivial
      if (query.trim().length >= 2 && googleMapsService.isConfigured()) {
        try {
          const googlePlaces = await googleMapsService.searchPlaces(query);
          if (!isCancelled && googlePlaces.length > 0) {
            const merged = searchService.mergeGooglePlaces(matched, googlePlaces);
            setResults(merged);
          }
        } catch {
          // Gracefully retain local campus results
        }
      }
    };

    runSearch();
    return () => {
      isCancelled = true;
    };
  }, [query, selectedCategory]);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleSelectLocation = (loc: CampusLocation) => {
    if (query.trim()) {
      storageService.addRecentSearch(query.trim());
      setRecentSearches(storageService.getRecentSearches());
    }
    setQuery(loc.shortName || loc.name);
    setIsFocused(false);
    onSelectLocation(loc);
  };

  const handleSelectRecentQuery = (term: string) => {
    setQuery(term);
    setIsFocused(true);
    inputRef.current?.focus();
  };

  const handleClearRecent = () => {
    storageService.clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <div
      ref={containerRef}
      className="fixed top-0 inset-x-0 z-30 pt-safe-top px-3 sm:px-6 pt-2 sm:pt-3 pointer-events-none flex flex-col items-center"
    >
      <div className="w-full max-w-lg pointer-events-auto space-y-1.5 sm:space-y-2">
        {/* Floating Search Input Card */}
        <div className="relative flex items-center bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-black/[0.06] dark:border-white/[0.08] transition-all duration-200 focus-within:ring-2 focus-within:ring-slate-900/10 dark:focus-within:ring-white/20">
          {/* Hamburger Menu Button */}
          <button
            onClick={onOpenMenu}
            className="p-2 sm:p-2.5 ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition active:scale-95 flex items-center justify-center"
            aria-label="Open navigation menu"
            title="Campus menu & Admin portal"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="pl-1 pr-1.5 text-slate-400 flex items-center justify-center">
            <Search className="w-4 h-4 text-slate-400" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search blocks, rooms (e.g. 34-405), UniMall, hostels..."
            className="w-full py-2.5 sm:py-3 pr-2 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            aria-label="Search LPU campus locations"
          />

          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition active:scale-95"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Bookmarked / Saved Places Button */}
          <button
            onClick={onOpenSavedModal}
            className="relative p-2 mr-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition active:scale-95"
            aria-label="Saved places"
            title="Saved campus places"
          >
            <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${savedCount > 0 ? 'text-amber-500 fill-amber-500' : ''}`} />
            {savedCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Autocomplete / Suggestions Dropdown */}
          {isFocused && (
            <SearchSuggestions
              query={query}
              results={results}
              recentSearches={recentSearches}
              onSelectLocation={handleSelectLocation}
              onSelectRecentQuery={handleSelectRecentQuery}
              onClearRecent={handleClearRecent}
            />
          )}
        </div>

        {/* Category Filter Pills Bar (Never overlaps search bar, neatly spaced) */}
        {!isFocused && (
          <CategoryPills
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
          />
        )}
      </div>
    </div>
  );
};
