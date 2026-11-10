import React from 'react';

export type CardElevation = 'flat' | 'subtle' | 'card' | 'elevated';
export type CardRadius = 'md' | 'xl' | '2xl';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: CardElevation;
  radius?: CardRadius;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 'card',
  radius = 'xl',
  hoverable = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-white border border-surface-border transition-all duration-200 overflow-hidden';

  const elevationStyles: Record<CardElevation, string> = {
    flat: '',
    subtle: 'shadow-subtle',
    card: 'shadow-card',
    elevated: 'shadow-elevated',
  };

  const radiusStyles: Record<CardRadius, string> = {
    md: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  };

  const hoverStyle = hoverable ? 'hover:shadow-elevated hover:border-surface-border-dark cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${elevationStyles[elevation]} ${radiusStyles[radius]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-6 pb-4 border-b border-slate-100 ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-6 pt-4 border-t border-slate-100 bg-surface-subtle/50 ${className}`} {...props}>
    {children}
  </div>
);
