import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState — shown when a list or section has no data.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      <div className="w-14 h-14 rounded-hero bg-surface-2 flex items-center justify-center text-text-3 mb-4">
        {icon}
      </div>
      <h3 className="font-display text-h3 font-semibold text-text mb-1">{title}</h3>
      {description && (
        <p className="text-label text-text-3 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
