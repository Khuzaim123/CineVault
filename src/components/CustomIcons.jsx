// Custom SVG Icons - All icons use currentColor for CSS color inheritance

export const PlayIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M10 8L16 12L10 16V8Z" fill={color} />
  </svg>
);

export const SearchIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ transform: 'rotate(15deg)' }}>
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M20 20L16.5 16.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const StarIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
      fill={color} 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinejoin="round"
    />
  </svg>
);

export const HeartIcon = ({ size = 24, color = 'currentColor', className = '', filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} className={className}>
    <path 
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const PlusIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="3" stroke={color} strokeWidth="2" fill="none" />
    <path d="M12 8V16M8 12H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CheckIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CloseIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ChevronIcon = ({ size = 24, color = 'currentColor', className = '', direction = 'right' }) => {
  const rotations = { up: -90, right: 0, down: 90, left: 180 };
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
      style={{ transform: `rotate(${rotations[direction]}deg)` }}
    >
      <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const HomeIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FireIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C12 2 14.5 5.5 14.5 8.5C14.5 10.5 13 11.5 13 11.5C13 11.5 16 10 17.5 13C19 16 17 20.5 12 22C7 20.5 5 16 6.5 13C8 10 11 11.5 11 11.5C11 11.5 9.5 10.5 9.5 8.5C9.5 5.5 12 2 12 2Z" fill={color} opacity="0.3" />
    <path d="M12 2C12 2 14.5 5.5 14.5 8.5C14.5 10.5 13 11.5 13 11.5C13 11.5 16 10 17.5 13C19 16 17 20.5 12 22C7 20.5 5 16 6.5 13C8 10 11 11.5 11 11.5C11 11.5 9.5 10.5 9.5 8.5C9.5 5.5 12 2 12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M12 14V18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CinemaIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <path d="M7 5V3M12 5V3M17 5V3M7 19V21M12 19V21M17 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M12 9V12L14 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const TVIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="6" width="16" height="12" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <path d="M8 21H16M12 18V21M7 6L9 3M17 6L15 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const MenuIcon = ({ size = 24, color = 'currentColor', className = '', isOpen = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d={isOpen ? "M18 6L6 18M6 6L18 18" : "M4 6H20M4 12H20M4 18H20"} 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
      style={{ transition: 'd 0.3s ease' }}
    />
  </svg>
);

export const VolumeIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M19.07 4.93C20.9447 6.80527 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const FullscreenIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V8M21 8V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H16M16 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V16M3 16V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const InfoIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <path d="M12 16V12M12 8H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ArrowLeftIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const YouTubeIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22.54 6.42C22.4192 5.94509 22.1756 5.51241 21.835 5.16676C21.4944 4.82112 21.0693 4.57527 20.6 4.45C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.93074 4.58527 2.50563 4.83112 2.16498 5.17676C1.82433 5.52241 1.58077 5.95509 1.46 6.43C1.31855 7.23873 1.23855 8.05894 1.22 8.88C1.22 8.88 1.22 11.56 1.22 14.24C1.23855 15.0611 1.31855 15.8813 1.46 16.69C1.58077 17.1649 1.82433 17.5976 2.16498 17.9432C2.50563 18.2889 2.93074 18.5347 3.4 18.66C5.12 19.12 12 19.12 12 19.12C12 19.12 18.88 19.12 20.6 18.66C21.0693 18.5347 21.4944 18.2889 21.835 17.9432C22.1756 17.5976 22.4192 17.1649 22.54 16.69C22.6815 15.8813 22.7615 15.0611 22.78 14.88C22.78 14.88 22.78 12.2 22.78 9.52C22.7615 8.70106 22.6815 7.88086 22.54 7.07V6.42Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M9.75 12.5L15.5 9.25V15.75L9.75 12.5Z" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const UserIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" fill="none" />
    <path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const BookmarkIcon = ({ size = 24, color = 'currentColor', className = '', filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} className={className}>
    <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LogOutIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17L21 12L16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LockIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <path d="M8 11V7C8 5.67392 8.52678 4.40215 9.46447 3.46447C10.4021 2.52678 11.6739 2 13 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 11V7C16 5.67392 15.4732 4.40215 14.5355 3.46447" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1.5" fill={color} />
  </svg>
);

export const MailIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="3" stroke={color} strokeWidth="2" fill="none" />
    <path d="M2 8L12 13L22 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TrophyIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 21H16M12 17V21M7 4H17V11C17 13.7614 14.7614 16 12 16C9.23858 16 7 13.7614 7 11V4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 6H3C3 6 3 11 7 11" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M17 6H21C21 6 21 11 17 11" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const SparkleIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L13.5 8H20L14.5 12L16.5 18L12 14L7.5 18L9.5 12L4 8H10.5L12 2Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="19" cy="4" r="1.5" fill={color} />
    <circle cx="5" cy="19" r="1" fill={color} />
  </svg>
);

export const RocketIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4.5 16.5C3 17.76 2.5 21 2.5 21C2.5 21 5.74 20.5 7 19C7.69 18.21 7.69 16.97 7 16.26C6.31 15.55 5.07 15.55 4.5 16.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15L9 12C9 12 11 5 18 2C21 1 23 3 22 6C19 13 12 15 12 15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12L7 14M12 15L10 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="16" cy="8" r="1.5" fill={color} />
  </svg>
);

export const ZapIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SmileIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <path d="M8 13C8 13 9.5 15.5 12 15.5C14.5 15.5 16 13 16 13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="9.5" r="1" fill={color} />
    <circle cx="15" cy="9.5" r="1" fill={color} />
  </svg>
);

export const FilmIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="3" stroke={color} strokeWidth="2" fill="none" />
    <path d="M7 2V22M17 2V22M2 12H22M2 7H7M17 7H22M2 17H7M17 17H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);


export const PersonIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" fill="none" />
    <path d="M4 21C4 17.134 7.134 14 11 14H13C16.866 14 20 17.134 20 21" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const PeopleGroupIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="9" cy="7" r="3" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="17" cy="8" r="2.5" stroke={color} strokeWidth="1.8" fill="none" />
    <path d="M2 20C2 17 5 15 9 15C13 15 16 17 16 20" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M17 13C19.5 13 22 14.5 22 17" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </svg>
);

export const FilterIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M6 12H18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 18H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CategoryIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" stroke={color} strokeWidth="2" fill="none" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" stroke={color} strokeWidth="2" fill="none" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" stroke={color} strokeWidth="2" fill="none" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);

export const MaleIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="10" cy="14" r="5" stroke={color} strokeWidth="2" fill="none" />
    <path d="M15 9L20 4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 4H20V8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FemaleIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="9" r="5" stroke={color} strokeWidth="2" fill="none" />
    <path d="M12 14V20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 18H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TrendingUpIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22 7L13.5 15.5L8.5 10.5L2 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 7H22V14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SortIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6H21M6 12H18M10 18H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const AwardIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="9" r="6" stroke={color} strokeWidth="2" fill="none" />
    <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BirthdayIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="10" width="18" height="11" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <path d="M8 10V8C8 6.343 9.343 5 11 5H13C14.657 5 16 6.343 16 8V10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M12 5V3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 15H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const MapPinIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C8.134 2 5 5.134 5 9C5 14.5 12 22 12 22C12 22 19 14.5 19 9C19 5.134 15.866 2 12 2Z" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);
