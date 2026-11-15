import React from 'react';
import { MapPin, Clock, History, AlertCircle, Building2, ChevronRight, BookOpen, Compass } from 'lucide-react';
import { CampusLocation } from '../../types/location';
import { VerificationBadge } from '../sheet/VerificationBadge';

interface SearchSuggestionsProps {
  query: string;
  results: CampusLocation[];
  recentSearches: string[];
  onSelectLocation: (loc: CampusLocation) => void;
  onSelectRecentQuery: (query: string) => void;
  onClearRecent: () => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  results,
  recentSearches,
  onSelectLocation,
  onSelectRecentQuery,
  onClearRecent,
}) => {
  const isQuerying = query.trim().length > 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden max-h-[70dvh] flex flex-col z-50 animate-in fade-in slide-in-from-top-2">
      {/* Search results list */}
      {isQuerying ? (
        <div className="overflow-y-auto divide-y divide-slate-100/80">
          {results.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">No campus location found</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Try searching for block numbers (e.g. "34", "36"), classrooms ("34-405", "36-201"), hostels ("BH-1", "GH-2"), "UniMall", or "Library".
              </p>
            </div>
          ) : (
            results.map((loc) => {
              const isPending = loc.verificationStatus === 'pending_survey';
              const classroom = loc.selectedClassroom;

              return (
                <div
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className="p-3.5 hover:bg-slate-50 active:bg-slate-100 transition flex items-start justify-between gap-3 cursor-pointer group"
                >
                  <div
                    className={`p-2 rounded-xl flex-shrink-0 mt-0.5 transition-colors ${
                      classroom
                        ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
                        : 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white'
                    }`}
                  >
                    {classroom ? (
                      <BookOpen className="w-4 h-4" />
                    ) : loc.blockNumber ? (
                      <Building2 className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {classroom ? (
                        <>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
                            Classroom · {classroom.floorName}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            Block {classroom.blockNumber}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                            {loc.category.replace('_', ' ')}
                          </span>
                          {loc.blockNumber && (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              Block {loc.blockNumber}
                            </span>
                          )}
                        </>
                      )}
                      <VerificationBadge status={loc.verificationStatus} />
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition truncate">
                      {loc.name}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1 leading-snug">
                      {loc.description}
                    </p>

                    {classroom && (
                      <div className="flex items-center gap-1 text-[11px] text-purple-700 pt-0.5">
                        <Compass className="w-3 h-3 text-purple-600 flex-shrink-0" />
                        <span>Guides to verified building entrance</span>
                      </div>
                    )}

                    {isPending && !classroom && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-700 pt-0.5">
                        <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                        <span>Map pin pending on-ground GPS survey</span>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 transition self-center flex-shrink-0" />
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Empty Query State: Recent Searches & Quick Suggested Hotspots */
        <div className="divide-y divide-slate-100/80 overflow-y-auto">
          {recentSearches.length > 0 && (
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Recent Searches
                </span>
                <button
                  onClick={onClearRecent}
                  className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-1">
                {recentSearches.map((term, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectRecentQuery(term)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 cursor-pointer text-xs font-medium text-slate-700 transition"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick campus landmarks */}
          <div className="p-3 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 block">
              Popular Campus Landmarks
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {results.slice(0, 6).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50 hover:border-brand-200 border border-slate-200/60 transition text-xs font-semibold text-slate-800 line-clamp-1"
                >
                  {loc.shortName || loc.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
