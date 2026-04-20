import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
