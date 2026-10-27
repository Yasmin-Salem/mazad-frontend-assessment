import type { ReactNode, SVGProps } from 'react'

export type IconName = 'add' | 'auction' | 'back' | 'home' | 'language' | 'package' | 'search' | 'trophy' | 'user'

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName
}

const iconPaths: Record<IconName, ReactNode> = {
  add: <path d="M12 5v14M5 12h14" />,
  auction: (
    <>
      <path d="m14.5 5.5 4 4M12.5 7.5l4 4M4 20l7.5-7.5M9.5 4.5l6 6-3 3-6-6z" />
      <path d="M13.5 17.5h6M12.5 20.5h8" />
    </>
  ),
  back: <path d="m15 18-6-6 6-6" />,
  home: (
    <>
      <path d="m3.5 11 8.5-7 8.5 7" />
      <path d="M5.5 10v10h13V10M9.5 20v-6h5v6" />
    </>
  ),
  language: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21M12 3C9.8 5.5 8.7 8.5 8.7 12s1.1 6.5 3.3 9" />
    </>
  ),
  package: (
    <>
      <path d="m4 7.5 8-4 8 4-8 4zM4 7.5v9l8 4 8-4v-9M12 11.5v9" />
      <path d="m15.5 5.2-8 4" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v4c0 3-1.5 5-4 6-2.5-1-4-3-4-6zM12 14v4M8.5 21h7M10 18h4" />
      <path d="M8 6H4v2c0 2 1.3 3.5 4 3.5M16 6h4v2c0 2-1.3 3.5-4 3.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.6-4 3-6 7-6s6.4 2 7 6" />
    </>
  ),
}

export function Icon({ name, ...props }: IconProps) {

  return (
    <svg
      aria-hidden="true"
      data-icon={name}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  )
}
