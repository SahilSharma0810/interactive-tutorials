"use client";

import Link from "next/link";

type NavLink = { href: string; label: string };

type Props = {
  /** Optional in-page anchors shown on the right (e.g. tutorial sections) */
  links?: NavLink[];
};

export default function Nav({ links = [] }: Props) {
  return (
    <nav className="topnav">
      <div className="topnav-inner">
        <Link className="topnav-brand" href="/">
          <span className="dot" /> Interactive Tutorials
        </Link>
        {links.length > 0 && (
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
