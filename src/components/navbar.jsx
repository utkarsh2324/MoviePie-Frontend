import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';
import toast from 'react-hot-toast';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  // Navigation items with titles and href
  const navigation = [
    { name: 'Browse & Binge', href: '/browseandbinge' },
    { name: 'Watchlist', href: '/watchlist' },
    { name: 'CineQuery', href: '/movie-bot' },
    { name: 'Watched', href: '/watched' },
  
  ];

  const handleProtectedRoute = (href, label) => {
    if (!user) {
      toast.error(`Please log in to access ${label}`);
      navigate('/login');
    } else {
      navigate(href);
    }
  };

  return (
    <Disclosure
      as="nav"
      className="sticky top-0 z-50 bg-gradient-to-r from-[#0f0f0f] via-[#1c1c1c] to-[#0f0f0f] shadow-md"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset">
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>

          {/* Left section */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link
              to="/"
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 text-2xl font-bold tracking-wide hover:scale-105 transition duration-300"
            >
              MoviePie
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-6 ml-6 items-center">
                {/* Media Dropdown */}
                <Menu as="div" className="relative">
                  <MenuButton className="inline-flex items-center text-gray-300 hover:text-purple-400 transition text-md font-medium cursor-pointer">
                    Media
                    <ChevronDownIcon className="ml-1 h-5 w-5" aria-hidden="true" />
                  </MenuButton>
                  <MenuItems className="absolute mt-2 w-48 rounded-md bg-[#1f1f1f] shadow-lg ring-1 ring-white/10 focus:outline-none z-50">
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          to="/upcoming"
                          className={classNames(
                            active ? 'bg-gray-700 text-purple-300' : 'text-gray-200',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Upcoming Media
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          to="/released"
                          className={classNames(
                            active ? 'bg-gray-700 text-purple-300' : 'text-gray-200',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Released Media
                        </Link>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>

                {/* Protected nav items */}
                {navigation.map((item) => (
                 <button
                 key={item.name}
                 onClick={() => handleProtectedRoute(item.href, item.name)}
                 className="cursor-pointer text-gray-300 hover:text-purple-400 hover:scale-105 transition duration-300 ease-in-out text-md font-medium"
               >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {isLoading ? null : user ? (
              <>
               
                <Menu as="div" className="relative ml-4">
                  <div>
                    <MenuButton className="relative flex rounded-full ring-2 ring-purple-500 hover:ring-pink-500 transition duration-300 focus:outline-none focus:ring-0 cursor-pointer">
                      <img
                        className="h-9 w-9 rounded-full object-cover"
                        src={user?.avatar || 'https://i.pravatar.cc/150?img=68'}
                        alt={user?.userName || 'User Avatar'}
                      />
                    </MenuButton>
                  </div>
                  <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-[#1c1c1c] text-gray-200 shadow-xl ring-1 ring-purple-700/40 backdrop-blur-sm transition-all duration-300 focus:outline-none">
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={classNames(
                            active ? 'bg-gray-700 text-purple-300' : 'text-gray-200',
                            'block px-4 py-2 text-sm rounded-md transition duration-200'
                          )}
                        >
                          Profile
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            logout();
                            navigate('/');
                          }}
                          className={classNames(
                            active ? 'bg-gray-700 text-purple-300' : 'text-gray-200',
                            'w-full text-left block px-4 py-2 text-sm rounded-md transition duration-200'
                          )}
                        >
                          Log out
                        </button>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-pink-600 hover:to-purple-600 hover:scale-105 transition duration-300"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-4 pt-2 pb-3">
          <DisclosureButton
            as={Link}
            to="/upcoming"
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Upcoming Media
          </DisclosureButton>
          <DisclosureButton
            as={Link}
            to="/released"
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Released Media
          </DisclosureButton>
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="button"
              onClick={() => handleProtectedRoute(item.href, item.name)}
              className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}