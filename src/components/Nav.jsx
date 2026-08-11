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
    <div
      style={{
        width: 'var(--nav-w)',
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--surface)',
        minHeight: '100vh',
        padding: '24px 16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, paddingLeft: 4 }}>
        <div
          style={{
            width: 9,
            height: 9,
            border: '1px solid var(--accent)',
            transform: 'rotate(45deg)',
            flexShrink: 0
          }}
        />
        <h1 style={{ fontSize: 15, letterSpacing: '0.08em' }}>EMCORD</h1>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            style={({ isActive }) => ({
              padding: '9px 12px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              background: isActive ? 'rgba(79, 209, 197, 0.08)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent'
            })}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
