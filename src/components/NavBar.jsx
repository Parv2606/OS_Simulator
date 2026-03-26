import { NavLink, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function NavBar({ darkMode, setDarkMode }) {
  const links = [
    { path: '/', label: 'Simulators Hub' },
    { path: 'learn', label: 'Theory Vault' },
  ];

  return (
    <nav className="glass sticky top-0 z-50 rounded-b-[32px] px-6 py-4 shadow-glow mb-8 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tight text-teal-600 dark:text-teal-400">
            OS Simulator
          </Link>

          <div className="hidden space-x-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((current) => !current)} />
      </div>
    </nav>
  );
}
