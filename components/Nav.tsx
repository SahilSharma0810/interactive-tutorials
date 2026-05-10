"use client";

import Link from "next/link";

type NavLink = { href: string; label: string };

type Props = {
  /** Optional in-page anchors shown on the right (e.g. tutorial sections) */
  links?: NavLink[];
  /** When set, highlights the matching link (compared by `href` ending in this id, with or without `#`). */
  activeAnchor?: string | null;
};

export default function Nav({ links = [], activeAnchor = null }: Props) {
  return (
    <nav className="topnav">
      <div className="topnav-inner">
        <Link className="topnav-brand" href="/" aria-label="Tangible — home">
          <svg
            className="topnav-logo"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
            focusable="false"
          >
            <rect x="2" y="5"    width="20" height="3" rx="0.6" fill="currentColor" />
            <rect x="2" y="10.5" width="16" height="3" rx="0.6" fill="currentColor" opacity="0.78" />
            <rect x="2" y="16"   width="12" height="3" rx="0.6" fill="currentColor" opacity="0.56" />
          </svg>
          <span className="topnav-wordmark">Tangible</span>
        </Link>
        {links.length > 0 && (
          <ul>
            {links.map((l) => {
              const id = l.href.startsWith("#") ? l.href.slice(1) : l.href;
              const isActive = activeAnchor === id;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className={isActive ? "is-active" : undefined}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </nav>
  );
}
