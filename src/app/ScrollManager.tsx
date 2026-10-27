import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

type ScrollTarget = Window | HTMLElement

function getScrollTarget(): ScrollTarget {
  const main = document.getElementById('main-content')
  if (main) {
    const overflowY = window.getComputedStyle(main).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') return main
  }
  return window
}

function getScrollPosition(target: ScrollTarget): number {
  return target === window ? window.scrollY : (target as HTMLElement).scrollTop
}

function setScrollPosition(target: ScrollTarget, top: number) {
  if (target === window) {
    window.scrollTo({ behavior: 'auto', left: 0, top })
    return
  }
  ;(target as HTMLElement).scrollTo({ behavior: 'auto', left: 0, top })
}

export function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const positionsRef = useRef(new Map<string, number>())
  const previousPathnameRef = useRef(location.pathname)

  useLayoutEffect(() => {
    const positions = positionsRef.current
    const pathnameChanged = previousPathnameRef.current !== location.pathname

    if (pathnameChanged) {
      const target = getScrollTarget()
      const savedPosition = positions.get(location.key)

      if (navigationType === 'POP' && savedPosition !== undefined) {
        setScrollPosition(target, savedPosition)
      } else if (navigationType !== 'POP') {
        setScrollPosition(target, 0)
      }
    }

    previousPathnameRef.current = location.pathname

    return () => {
      positions.set(location.key, getScrollPosition(getScrollTarget()))
    }
  }, [location.key, location.pathname, navigationType])

  return null
}
