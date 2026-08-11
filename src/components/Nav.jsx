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
  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <img src="/brand/emcord-logo.png" alt="EMCORD" className="brand-logo" />
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
