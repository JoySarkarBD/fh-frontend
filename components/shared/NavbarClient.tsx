"use client";

import { useCurrentUser } from "@/actions/hooks/auth.hooks";
import type { AuthNavbarState } from "@/services/auth";
import { Bell, Menu, User, User2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Properties", href: "/properties" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
  { label: "Blog", href: "/blog" },
  { label: "Contact us", href: "/contact" },
];

type NavbarClientProps = {
  initialAuthState: AuthNavbarState;
};

export default function NavbarClient({ initialAuthState }: NavbarClientProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // TanStack Query with initial data from server
  const { 
    data: authState, 
    refetch 
  } = useCurrentUser({
    initialData: initialAuthState,
  });

  // Refetch on mount to ensure fresh data
  useEffect(() => {
    refetch();
  }, [refetch]);

  console.log(authState, 'user data');

  const profilePath =
    authState?.userRole === "admin" ? "/admin" : "/dashboard/profile";
  const dashboardLabel =
    authState?.userRole === "admin" ? "Admin Dashboard" : "Dashboard";
  const isUserDashboardRoute = pathname.startsWith("/dashboard");

  const openUserDashboardSidebar = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("toggle-user-sidebar"));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`w-full transition-colors duration-200  ${
        scrolled || open
          ? "bg-white/80 border-b border-gray-200 shadow-sm backdrop-blur-sm "
          : "bg-transparent border-b border-transparent "
      }`}>
      <div className='md:mx-12.5 px-6 lg:px-8 '>
        <div className='flex items-center justify-between h-20'>
          <Link href='/' className='flex flex-col items-start'>
            <div className='flex items-center gap-3'>
              <Image
                src='/logo.png'
                alt='Farrior Homes'
                width={200}
                height={80}
                priority
                className='h-15 w-auto object-contain'
              />
            </div>
          </Link>

          <nav
            className={`hidden ${pathname.includes("admin") && "lg:hidden"} lg:flex items-center gap-6 flex-1 justify-start ml-25`}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`
                    text-xl transition-colors duration-200
                    ${
                      isActive
                        ? "text-(--primary) font-semibold"
                        : "text-(--primary-text-color) hover:text-(--primary)"
                    }
                  `}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className='hidden lg:flex items-center gap-4'>
            {!authState?.isLoggedIn ? (
              <>
                <Link
                  href='/login'
                  className='text-xl text-(--primary-text-color) hover:text-gray-900 transition-colors duration-200'>
                  Login
                </Link>

                <Link
                  href='/signup'
                  className='px-6 py-2.5 rounded-md bg-[#5B8C7E] text-white text-xl hover:bg-[#4a7365] transition-colors duration-200 shadow-sm'>
                  Sign up
                </Link>
              </>
            ) : (
              <div className='flex items-center gap-4'>
                <button aria-label='Notifications' className='text-gray-700'>
                  <Bell size={20} />
                </button>

                <Link
                  href={profilePath}
                  aria-label={dashboardLabel}
                  className='w-11 h-11 rounded-full border border-[#D1CEC6] bg-[#F8FAF9] flex items-center justify-center text-[#2C2C2A] hover:border-[#5B8C7E] hover:text-[#5B8C7E] transition-colors'>
                  <User size={24} />
                </Link>
              </div>
            )}
          </div>

          <div className='flex items-center gap-3 lg:hidden'>
            {authState?.isLoggedIn && (
              <button
                onClick={() => {
                  if (isUserDashboardRoute) {
                    openUserDashboardSidebar();
                  } else {
                    router.push(profilePath);
                  }
                }}
                className='text-gray-800 focus:outline-none'
                aria-label='Open user menu'>
                <User2 size={24} />
              </button>
            )}

            <button
              onClick={() => setOpen(!open)}
              className='text-gray-800 focus:outline-none'
              aria-label='Toggle navigation menu'>
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {open && (
          <div className='lg:hidden border-t border-gray-200 py-5 px-4 bg-white'>
            <nav className='flex flex-col gap-2'>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`
                      py-3 px-4 rounded-lg text-base font-medium
                      transition-colors duration-200
                      ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-emerald-700"
                      }
                    `}>
                    {item.label}
                  </Link>
                );
              })}

              {!authState?.isLoggedIn && (
                <div className='mt-6 pt-6 border-t border-gray-200 flex flex-col gap-4'>
                  <Link
                    href='/login'
                    onClick={() => setOpen(false)}
                    className='py-3 px-4 text-center text-base font-medium text-(--primary-text-color) hover:bg-gray-50 rounded-lg transition-colors'>
                    Login
                  </Link>

                  <Link
                    href='/signup'
                    onClick={() => setOpen(false)}
                    className='py-3 px-4 text-center rounded-lg text-base font-medium bg-[#5B8C7E] text-white hover:bg-[#4a7365] transition-colors'>
                    Sign up
                  </Link>
                </div>
              )}

              {authState?.isLoggedIn && (
                <div className='mt-6 pt-6 border-t border-gray-200 flex flex-col gap-4'>
                  <Link
                    href={profilePath}
                    onClick={() => setOpen(false)}
                    className='py-3 px-4 text-center text-base font-medium text-(--primary-text-color) hover:bg-gray-50 rounded-lg transition-colors'>
                    {dashboardLabel}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}