export const colors = {
    primary: 'hsl(215, 50%, 23%)',
    primaryMuted: 'hsl(215, 50%, 23%, 0.1)',
    secondary: 'hsl(42, 87%, 55%)',
    secondaryMuted: 'hsl(42, 87%, 55%, 0.1)',
    accent: 'hsl(152, 57%, 58%)',
    accentMuted: 'hsl(152, 57%, 58%, 0.1)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(215, 25%, 27%)',
    muted: 'hsl(210, 40%, 96.1%)',
    mutedForeground: 'hsl(215, 25%, 40%)',
    border: 'hsl(214, 32%, 91%)',
    input: 'hsl(214, 32%, 91%)',
    ring: 'hsl(215, 50%, 23%, 0.3)',
    success: 'hsl(152, 57%, 58%)',
    warning: 'hsl(42, 87%, 55%)',
    error: 'hsl(354, 70%, 54%)',
    info: 'hsl(200, 98%, 39%)',
  };
  
  export const chartColors = [
    'hsl(215, 50%, 23%)',  // Muted blue
    'hsl(42, 87%, 55%)',   // Muted yellow
    'hsl(152, 57%, 58%)',  // Muted green
    'hsl(14, 100%, 57%)',  // Muted orange
    'hsl(200, 98%, 39%)',  // Bright blue for contrast
  ];
  
  export const getMutedColor = (index: number) => {
    const mutedColors = [
      "#000000", // Black
      "#E85D4A", // Red (Muted)
      "#D87542", // Orange
      "#B88B2A", // Yellow
      "#D6A766", // Gold
      "#70D361", // Green
      "#489E47", // Dark Green
      "#59C4B3", // Teal
      "#56A9D4", // Light Blue
      "#7389E8", // Blue
      "#4180EF", // Sky Blue
      "#2E4DB2", // Dark Blue
      "#5038E5", // Purple
      "#8867E9", // Lavender
      "#D6577E", // Pink
      "#D85FCA", // Light Pink
    ];
  
    return mutedColors[index % mutedColors.length];
  };