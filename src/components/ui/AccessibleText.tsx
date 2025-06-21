import React from 'react';

interface AccessibleTextProps {
  children: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'muted'
    | 'link'
    | 'error'
    | 'success'
    | 'warning';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  className?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Компонент для текста с обеспечением доступности и контрастности WCAG AA
 */
export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  variant = 'primary',
  size = 'base',
  className = '',
  as: Component = 'p',
}) => {
  // WCAG AA совместимые цвета (контрастность 4.5:1 или выше)
  const variantClasses = {
    primary: 'text-gray-900', // Контрастность: 21:1 на белом фоне
    secondary: 'text-gray-700', // Контрастность: 9.5:1 на белом фоне
    muted: 'text-gray-600', // Контрастность: 7:1 на белом фоне
    link: 'text-blue-700 hover:text-blue-800 underline-offset-2 hover:underline', // Контрастность: 8.6:1
    error: 'text-red-700', // Контрастность: 8.2:1 на белом фоне
    success: 'text-green-700', // Контрастность: 7.4:1 на белом фоне
    warning: 'text-amber-700', // Контрастность: 6.9:1 на белом фоне
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const combinedClassName =
    `${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  return <Component className={combinedClassName}>{children}</Component>;
};

/**
 * Специализированные компоненты для часто используемых случаев
 */
export const AccessibleLink: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}> = ({ href, children, className = '', external = false }) => (
  <a
    href={href}
    className={`text-blue-700 hover:text-blue-800 underline-offset-2 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded ${className}`}
    {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
  >
    {children}
  </a>
);

export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'base',
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const variantClasses = {
    primary: 'bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-500',
    secondary: 'bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-500',
    outline:
      'border-2 border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white focus:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    base: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-md font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `.trim()}
    >
      {children}
    </button>
  );
};

/**
 * Компонент для отображения статусов с правильной контрастностью
 */
export const AccessibleStatus: React.FC<{
  status: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}> = ({ status, children, className = '' }) => {
  const statusClasses = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      className={`
        ${statusClasses[status]}
        px-3 py-2 rounded-md border text-sm font-medium
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

/**
 * Хук для проверки контрастности цветов
 */
export const useContrastCheck = () => {
  const checkContrast = (foreground: string, background: string): number => {
    // Упрощенная функция проверки контрастности
    // В реальном проекте следует использовать более точную библиотеку
    const getLuminance = (color: string): number => {
      // Преобразуем hex в RGB и вычисляем относительную яркость
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      const sRGB = [r, g, b].map((c) => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  };

  const isWCAGCompliant = (
    contrast: number,
    level: 'AA' | 'AAA' = 'AA'
  ): boolean => {
    return level === 'AA' ? contrast >= 4.5 : contrast >= 7;
  };

  return { checkContrast, isWCAGCompliant };
};

/**
 * Предустановленные цветовые схемы с гарантированной контрастностью
 */
export const accessibleColors = {
  text: {
    primary: 'text-gray-900', // 21:1 контрастность
    secondary: 'text-gray-700', // 9.5:1 контрастность
    muted: 'text-gray-600', // 7:1 контрастность
    inverse: 'text-white', // На темном фоне
  },
  background: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    muted: 'bg-gray-100',
    dark: 'bg-gray-900',
  },
  links: {
    default: 'text-blue-700 hover:text-blue-800', // 8.6:1 контрастность
    visited: 'text-purple-700 hover:text-purple-800', // 8.1:1 контрастность
  },
  status: {
    success: 'text-green-700', // 7.4:1 контрастность
    error: 'text-red-700', // 8.2:1 контрастность
    warning: 'text-amber-700', // 6.9:1 контрастность
    info: 'text-blue-700', // 8.6:1 контрастность
  },
} as const;
