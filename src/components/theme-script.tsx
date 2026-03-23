"use client";

/**
 * Inlined script that runs before React hydration to prevent flash of
 * the wrong theme. Reads localStorage, falls back to system preference.
 */
export function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      // We intentionally use dangerouslySetInnerHTML here to inject an
      // anti-flash IIFE. The script is self-contained and trusted (ours).
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=s==='dark'||(!s&&d);if(dark){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
      }}
    />
  );
}
