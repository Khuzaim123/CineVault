const SkeletonCard = () => {
  return (
    <div
      className="relative aspect-[2/3] bg-surface rounded-lg overflow-hidden animate-pulse flex-shrink-0 movie-card-width"
      style={{ minWidth: '130px' }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
        style={{ backgroundSize: '200% 100%' }}
      />
    </div>
  );
};

export default SkeletonCard;
