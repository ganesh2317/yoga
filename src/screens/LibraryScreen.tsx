import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Lock, Play, BookOpen } from 'lucide-react';
import { YOGA_POSES } from '../data/poses';
import { JOURNEY_LEVELS } from '../data/journey';
import { useJourneyStore } from '../store/useJourneyStore';
import { TopBar } from '../components/TopBar';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Segmented } from '../components/ui/Segmented';
import { EmptyState } from '../components/ui/EmptyState';
import { showToast } from '../components/ui/Toast';
import type { PoseFilter } from '../types';

const CATEGORIES: PoseFilter[] = [
  'All',
  'Standing',
  'Balance',
  'Backbend',
  'Inversion',
  'Seated',
  'Twist',
];

const getPoseLevelInfo = (poseId: string) => {
  const lvl = JOURNEY_LEVELS.find((l) => l.targetPoseIds.includes(poseId));
  if (lvl) {
    return {
      level: lvl.level,
      tier: lvl.tier,
      title: lvl.title,
    };
  }
  return {
    level: 1,
    tier: 'Foundation' as const,
    title: 'Grounding Basics',
  };
};

export const LibraryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PoseFilter>('All');
  const { isPoseUnlocked } = useJourneyStore();

  const filteredPoses = YOGA_POSES.filter((pose) => {
    const matchesCategory =
      selectedCategory === 'All' || pose.category === selectedCategory;
    const matchesSearch =
      pose.name.toLowerCase().includes(search.toLowerCase()) ||
      pose.sanskritName.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    const levelA = getPoseLevelInfo(a.id).level;
    const levelB = getPoseLevelInfo(b.id).level;
    return levelA - levelB;
  });

  return (
    <div className="min-h-screen bg-background text-text p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28">
      <TopBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">
              Asana Directory
            </Badge>
            <span className="text-caption text-text-3 font-medium">
              {filteredPoses.length} {filteredPoses.length === 1 ? 'posture' : 'postures'}
            </span>
          </div>
          <h1 className="text-display font-display font-bold text-text tracking-tight">
            Pose Library
          </h1>
          <p className="text-label text-text-2 max-w-xl">
            Explore 21 foundational and advanced yoga postures with real-time AI guidance.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-text-3 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search poses or Sanskrit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-control pl-9 pr-4 py-2 text-label text-text placeholder:text-text-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            aria-label="Search poses"
          />
        </div>
      </div>

      {/* Category Segmented Filter */}
      <div className="w-full overflow-x-auto pb-1 pt-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none flex items-center">
        <Segmented
          options={CATEGORIES.map((cat) => ({ label: cat, value: cat }))}
          value={selectedCategory}
          onChange={(val) => setSelectedCategory(val as PoseFilter)}
        />
      </div>

      {/* Poses Grid */}
      {filteredPoses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-6 h-6" />}
          title="No poses found"
          description={`No postures match "${search}" in category "${selectedCategory}".`}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
            >
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 items-stretch">
          {filteredPoses.map((pose) => {
            const unlocked = isPoseUnlocked(pose.id);
            const levelInfo = getPoseLevelInfo(pose.id);

            return (
              <Surface
                key={pose.id}
                variant="raised"
                className={`p-5 flex flex-col justify-between h-full rounded-card border transition-all duration-200 relative group ${
                  unlocked
                    ? 'hover:border-accent/40 hover:shadow-2'
                    : 'opacity-75 bg-surface-2/30 border-border/60 hover:border-border cursor-pointer'
                }`}
                onClick={
                  unlocked
                    ? undefined
                    : () =>
                        showToast(
                          `Reach Level ${levelInfo.level} (${levelInfo.title}) in your Journey to unlock ${pose.name}.`,
                          'info'
                        )
                }
              >
                {/* Upper Content Zone */}
                <div className="space-y-3">
                  {/* Badges Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Consistent Journey Level Tag */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-caption font-semibold transition-colors ${
                          unlocked
                            ? 'bg-accent-soft text-accent border border-accent/20'
                            : 'bg-surface-2 text-text-3 border border-border'
                        }`}
                      >
                        {!unlocked && <Lock className="w-3 h-3 text-text-3 shrink-0" />}
                        <span>Level {levelInfo.level}</span>
                      </span>

                      {/* Category Tag */}
                      <Badge variant="default" size="sm" className="font-medium">
                        {pose.category}
                      </Badge>
                    </div>

                    {/* Difficulty Tag */}
                    <span className="text-[11px] font-medium text-text-3 px-2 py-0.5 rounded-pill bg-surface-2/80 border border-border/60 shrink-0">
                      {pose.difficulty}
                    </span>
                  </div>

                  {/* Pose Names */}
                  <div>
                    <h3 className="font-display font-bold text-h3 text-text leading-snug line-clamp-1">
                      {pose.name}
                    </h3>
                    <p className="text-caption text-text-3 italic font-medium line-clamp-1 mt-0.5">
                      {pose.sanskritName}
                    </p>
                  </div>

                  {/* Description with consistent height & clamp */}
                  <p className="text-caption text-text-2 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                    {pose.description}
                  </p>
                </div>

                {/* Fixed Bottom Action & Meta Zone */}
                <div className="pt-3.5 mt-4 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-text-3 tabular-nums shrink-0">
                    ~{pose.estimatedCaloriesPerMin} kcal/min
                  </span>

                  {unlocked ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/live/${pose.id}`)}
                      className="shrink-0 font-medium"
                    >
                      <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                      Practice
                    </Button>
                  ) : (
                    <div
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-control bg-surface-2/90 border border-border text-text-3 text-caption font-medium select-none shrink-0"
                      title={`Unlocks at Level ${levelInfo.level}`}
                    >
                      <Lock className="w-3.5 h-3.5 text-text-3 shrink-0" />
                      <span>Unlocks at Lvl {levelInfo.level}</span>
                    </div>
                  )}
                </div>
              </Surface>
            );
          })}
        </div>
      )}
    </div>
  );
};

