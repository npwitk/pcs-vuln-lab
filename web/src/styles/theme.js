export const lightTheme = {
  mode: 'light',
  // Colors
  colors: {
    // Primary
    primary: '#AE5C2A',
    primaryHover: '#8B4722',
    primaryLight: '#FDF5F0',

    // Background
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F7',
    backgroundTertiary: '#FAFAFA',

    // Surface
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // Text
    text: '#1D1D1F',
    textSecondary: '#6E6E73',
    textTertiary: '#86868B',

    // Border
    border: '#D2D2D7',
    borderLight: '#E5E5EA',

    // Status
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#AE5C2A',

    // Apple's systemOrange in its *text* variants, for small amber copy that
    // has to stay legible on the page background (pre-order dates, the print
    // service pill). `warning` above is the fill tone — at 14px on white it
    // only reaches ~2:1, so light mode uses Apple's accessible orange here
    // instead, and dark mode uses the dark systemOrange (~9.6:1 on #0D0D0D).
    warningText: '#C93400',

    // Accent
    accent: '#5E5CE6',
    accentLight: '#F0EFFF',
  },

  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0 4px 12px rgba(0, 0, 0, 0.1)',
    lg: '0 12px 24px rgba(0, 0, 0, 0.12)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.14)',
  },

  // Typography
  typography: {
    fontFamily: '"Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',

    // Font Sizes
    sizes: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },

    // Font Weights
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // Line Heights
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border Radius
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    full: '9999px',
  },

  // Transitions
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.35s ease',
  },
};

export const darkTheme = {
  mode: 'dark',
  // Colors
  colors: {
    // Primary - slightly brighter for dark mode visibility
    primary: '#D4793D',
    primaryHover: '#E8925A',
    primaryLight: '#2A1F18',

    // Background - dark grays
    background: '#0D0D0D',
    backgroundSecondary: '#1A1A1A',
    backgroundTertiary: '#141414',

    // Surface - slightly elevated dark
    surface: '#1A1A1A',
    surfaceElevated: '#242424',

    // Text - light colors for dark background
    text: '#F5F5F7',
    textSecondary: '#A1A1A6',
    textTertiary: '#6E6E73',

    // Border - subtle dark borders
    border: '#3D3D3D',
    borderLight: '#2D2D2D',

    // Status - same vibrant colors work well
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#D4793D',

    // See the light theme's note — Apple's dark systemOrange, legible as
    // text on the dark background (the old hardcoded #92400e was ~2:1).
    warningText: '#FF9F0A',

    // Accent
    accent: '#7D7AFF',
    accentLight: '#1E1D3A',
  },

  // Shadows - more subtle in dark mode
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 12px 24px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.6)',
  },

  // Typography - same as light theme
  typography: {
    fontFamily: '"Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',

    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },

    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },

  // Spacing - same as light theme
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  // Border Radius - same as light theme
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    full: '9999px',
  },

  // Transitions - same as light theme
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.35s ease',
  },
};
