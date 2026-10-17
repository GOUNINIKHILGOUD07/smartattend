import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // 'present', 'absent', 'late', 'neutral', 'brand', 'purple'
  icon: Icon,
  className = ''
}) => {
  const variantMap = {
    present: 'sa-badge-present',
    absent: 'sa-badge-absent',
    late: 'sa-badge-late',
    neutral: 'sa-badge-neutral',
    brand: 'sa-badge-brand',
    purple: 'sa-badge-purple'
  };

  const currentClass = variantMap[variant.toLowerCase()] || 'sa-badge-neutral';

  return (
    <span className={`sa-badge ${currentClass} ${className}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};
