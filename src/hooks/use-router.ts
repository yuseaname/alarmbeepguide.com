import { useState, useEffect } from 'react'

export function useRouter() {
  const [pathname, setPathname] = useState(window.location.pathname)
  const [search, setSearch] = useState(window.location.search)

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname)
      setSearch(window.location.search)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return { pathname, search }
}
