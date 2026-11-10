import React from 'react';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'full';
  noPadding?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  size = 'lg',
  noPadding = false,
  className = '',
  ...props
}) => {
  const sizeStyles: Record<'sm' | 'md' | 'lg' | 'full', string> = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-page',
    full: 'max-w-full',
  };

  const paddingStyle = noPadding ? '' : 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8';

  return (
    <div
      className={`mx-auto w-full ${sizeStyles[size]} ${paddingStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
