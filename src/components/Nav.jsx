import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/sales', label: 'Sales' },
  { to: '/projects', label: 'Projects' },
  { to: '/finance', label: 'Finance' },
  { to: '/operations', label: 'Operations' },
  { to: '/company', label: 'Company' }
];

export default function Nav() {
  const [logoFailed, setLogoFailed] = useState(false);
  const logoUrl = `${import.meta.env.BASE_URL}brand/emcord-logo.png?v=transparent`;

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        {!logoFailed && (
          <img
            src={logoUrl}
            alt="EMCORD"
            className="brand-logo"
            onError={() => setLogoFailed(true)}
          />
        )}
        {logoFailed && <span className="brand-wordmark-fallback">EMCORD</span>}
      </div>
      <div className="nav-label">Operating platform</div>
      <nav className="primary-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
