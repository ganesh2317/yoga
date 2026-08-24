import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Play, Info, Sparkles, X } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { TopBar } from '../components/TopBar';
import { PoseReferenceIllustration } from '../components/PoseReferenceIllustration';
import { YOGA_POSES } from '../data/poses';
import type { PoseCategory, YogaPose } from '../types';

const CATEGORIES: PoseCategory[] = ['All', 'Standing', 'Seated', 'Backbend', 'Inversion'];

export const LibraryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PoseCategory>('All');
  const [selectedPoseModal, setSelectedPoseModal] = useState<YogaPose | null>(null);

  const filteredPoses = YOGA_POSES.filter((pose) => {
    const matchesSearch =
      pose.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pose.sanskritName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pose.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || pose.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 max-w-md mx-auto relative z-10 space-y-4">
      <TopBar title="Pose Library" />

      <div className="space-y-3">
        <h2 className="font-serif font-extrabold text-3xl text-[#F4F1EC] tracking-tight">
          Select Your Pose
        </h2>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#635E58] stroke-[1.5px]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pose or Sanskrit name..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F4F1EC]/[0.04] border border-[#F4F1EC]/12 text-[#F4F1EC] placeholder:text-[#635E58] focus:outline-none focus:border-[#C9A66B] focus:ring-1 focus:ring-[#C9A66B] transition-all backdrop-blur-xl text-sm"
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-[#3F6B4F] text-[#F4F1EC] shadow-md shadow-[#3F6B4F]/25 border border-[#88C49D]/40'
                  : 'bg-[#F4F1EC]/[0.04] text-[#A8A29B] hover:text-[#F4F1EC] border border-[#F4F1EC]/10 hover:bg-[#F4F1EC]/8'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Pose List Cards */}
      <div className="space-y-3">
        {filteredPoses.length === 0 ? (
          <GlassCard className="p-8 text-center space-y-3">
            <Info className="w-10 h-10 text-[#635E58] mx-auto stroke-[1.5px]" />
            <h3 className="font-serif font-bold text-lg text-[#F4F1EC]">
              No Poses Found
            </h3>
            <p className="text-xs text-[#A8A29B]">
              Try tweaking your search filter or selecting "All" category.
            </p>
          </GlassCard>
        ) : (
          filteredPoses.map((pose) => (
            <GlassCard
              key={pose.id}
              variant="interactive"
              className="p-4 flex items-center justify-between gap-4"
              onClick={() => setSelectedPoseModal(pose)}
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* SVG Pose Reference Silhouette */}
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 p-2 shrink-0 flex items-center justify-center">
                  <PoseReferenceIllustration poseId={pose.id} />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={pose.difficulty} size="sm" />
                    <span className="text-[11px] text-[#635E58] truncate">
                      {pose.category}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[#F4F1EC] truncate leading-tight">
                    {pose.name}
                  </h3>

                  <p className="text-xs text-[#C9A66B] font-medium italic truncate">
                    {pose.sanskritName}
                  </p>
                </div>
              </div>

              <GlassButton
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/live/${pose.id}`);
                }}
                variant="primary"
                size="sm"
                className="shrink-0 rounded-xl"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start</span>
              </GlassButton>
            </GlassCard>
          ))
        )}
      </div>

      {/* Selected Pose Detail Modal */}
      {selectedPoseModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <GlassCard variant="focal" className="w-full max-w-md p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 p-2 shrink-0 flex items-center justify-center">
                  <PoseReferenceIllustration poseId={selectedPoseModal.id} />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-2xl text-[#F4F1EC]">
                    {selectedPoseModal.name}
                  </h3>
                  <p className="text-xs text-[#C9A66B] font-semibold italic">
                    {selectedPoseModal.sanskritName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPoseModal(null)}
                className="p-1.5 rounded-full text-[#635E58] hover:text-[#F4F1EC] hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={selectedPoseModal.difficulty} />
              <span className="text-xs text-[#A8A29B] font-medium">
                Category: {selectedPoseModal.category}
              </span>
              <span className="text-xs text-[#635E58] ml-auto">
                ~{selectedPoseModal.estimatedCaloriesPerMin} kcal/min
              </span>
            </div>

            <p className="text-xs text-[#A8A29B] leading-relaxed">
              {selectedPoseModal.description}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#635E58] uppercase tracking-widest">
                Key Benefits
              </h4>
              <ul className="grid grid-cols-2 gap-2">
                {selectedPoseModal.benefits.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-1.5 text-xs text-[#F4F1EC] bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A66B] shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <GlassButton
                onClick={() => setSelectedPoseModal(null)}
                variant="secondary"
                fullWidth
              >
                Close
              </GlassButton>
              <GlassButton
                onClick={() => navigate(`/live/${selectedPoseModal.id}`)}
                variant="primary"
                fullWidth
                leftIcon={<Play className="w-4 h-4 fill-current" />}
              >
                Start Session
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
