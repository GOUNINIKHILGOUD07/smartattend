import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'ghost', 'danger'
  size = 'md',        // 'sm', 'md', 'lg'
  icon: Icon,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  title
}) => {
  const variantClass = {
    primary: 'sa-btn-primary',
    secondary: 'sa-btn-secondary',
    ghost: 'sa-btn-ghost',
    danger: 'sa-btn-danger'
  }[variant] || 'sa-btn-primary';

  const sizeClass = {
    sm: 'sa-btn-sm',
    md: '',
    lg: 'sa-btn-lg'
  }[size] || '';

  return (
    <button
      type={type}
      className={`sa-btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      {children}
    </button>
  );
};
