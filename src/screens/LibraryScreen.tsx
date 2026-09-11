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
  });

  const getRequiredLevel = (poseId: string): number => {
    const lvl = JOURNEY_LEVELS.find((l) => l.targetPoseIds.includes(poseId));
    return lvl ? lvl.level : 1;
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28">
      <TopBar />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="accent">
            Asana Directory
          </Badge>
          <h1 className="text-3xl font-display font-bold text-text-primary mt-1">
            Pose Library
          </h1>
          <p className="text-sm text-text-muted">
            Explore 21 foundational and advanced yoga postures with real-time AI guidance.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search poses or Sanskrit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-1 border border-surface-border rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Segmented Filter */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPoses.map((pose) => {
            const unlocked = isPoseUnlocked(pose.id);
            const reqLevel = getRequiredLevel(pose.id);

            return (
              <Surface
                key={pose.id}
                variant="raised"
                className={`p-5 flex flex-col justify-between space-y-4 transition-all duration-200 ${
                  unlocked
                    ? 'hover:border-primary-500/40 hover:shadow-lg'
                    : 'opacity-70 bg-surface-1/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={unlocked ? 'accent' : 'default'}>
                      {pose.category}
                    </Badge>
                    <Badge variant="default">
                      {pose.difficulty}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-text-primary leading-snug">
                      {pose.name}
                    </h3>
                    <p className="text-xs text-text-muted italic font-medium">
                      {pose.sanskritName}
                    </p>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {pose.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">
                    ~{pose.estimatedCaloriesPerMin} kcal/min
                  </span>

                  {unlocked ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/live/${pose.id}`)}
                    >
                      <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                      Practise
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-1 text-xs text-text-muted font-medium bg-surface-2 px-2.5 py-1 rounded-lg border border-surface-border">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Level {reqLevel}</span>
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
