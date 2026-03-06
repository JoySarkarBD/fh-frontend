"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ComponentType, ReactNode, useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  User,
  X,
} from "lucide-react";
import { IoMdCode } from "react-icons/io";
import {
  LuBadgePercent,
  LuCalculator,
  LuNetwork,
  LuSettings2,
  LuTelescope,
  LuUserRoundCog,
} from "react-icons/lu";
import { FiHome } from "react-icons/fi";
import { useLogoutMutation } from "@/actions/hooks/auth.hooks";

type AdminShellProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  hasArrow?: boolean;
  children?: { label: string; hash: string }[];
};

const sidebarSections: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      {
        label: "User Management",
        href: "/admin/user-management",
        icon: LuUserRoundCog,
      },
      {
        label: "Property Management",
        href: "/admin/property-management",
        icon: FiHome,
      },
      {
        label: "Service Management",
        href: "/admin/service-management",
        icon: LuNetwork,
      },
      {
        label: "Blog Management",
        href: "/admin/blog-management",
        icon: LuTelescope,
      },
    ],
  },
  {
    label: "Tool",
    items: [
      {
        label: "Property Valuation",
        href: "/admin/property-valuation",
        icon: LuCalculator,
      },
      {
        label: "Tax Calculation",
        href: "/admin/tax-calculation",
        icon: LuBadgePercent,
      },
    ],
  },
  {
    label: "Profile Overview",
    items: [
      {
        label: "Profile",
        href: "/admin/profile",
        icon: User,
        children: [{ label: "Address", hash: "#profileAddress" }],
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: LuSettings2,
        children: [
          { label: "Notification Settings", hash: "#notifications" },
          { label: "Security Settings", hash: "#security" },
        ],
      },
    ],
  },
];

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  // Logout mutation
  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      try {
        localStorage.setItem("isLoggedIn", "false");
        localStorage.removeItem("userRole");
      } catch {}
      router.push("/");
    },
  });

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => {
      if (prev[href]) {
        return {};
      }

      return { [href]: true };
    });
  };

  const handleHashNavigation = (href: string, hash: string) => {
    if (pathname !== href) return;

    const element = document.getElementById(hash.replace("#", ""));
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", `${href}${hash}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateHash = () => setCurrentHash(window.location.hash || "");
    const timer = setTimeout(updateHash, 0);
    window.addEventListener("hashchange", updateHash);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", updateHash);
    };
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const renderNavItems = (mobile = false) => {
    const isExpanded = mobile || isDesktopSidebarOpen;

    return (
      <div className='flex-1 flex flex-col overflow-y-auto px-3 py-4'>
        <nav className='flex-1 space-y-5'>
          {sidebarSections.map((section) => (
            <div key={section.label}>
              {/* Section label when expanded */}
              {isExpanded ? (
                <p className='px-3 mb-1 text-[13px] font-semibold text-[#70706C] tracking-widest'>
                  {section.label}
                </p>
              ) : (
                <div className='border-t border-[#E8E5DD] my-2' />
              )}

              <div className='space-y-0.5'>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  const hasArrow = "hasArrow" in item && item.hasArrow;
                  const hasChildren = Boolean(item.children?.length);
                  const isItemExpanded = Boolean(expandedItems[item.href]);

                  return (
                    <div key={item.href}>
                      <div
                        className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-[#F8FAF9] text-black"
                            : " hover:bg-gray-100 text-[#70706C]"
                        } ${
                          !isExpanded
                            ? "justify-center px-2"
                            : "justify-between gap-3"
                        }`}>
                        <Link
                          href={item.href}
                          onClick={(event) => {
                            if (hasChildren) {
                              if (pathname === item.href) {
                                event.preventDefault();
                              }
                              toggleExpanded(item.href);
                            }

                            if (mobile) setIsMobileSidebarOpen(false);
                          }}
                          className='flex items-center gap-3 min-w-0 flex-1'>
                          <Icon size={18} className='shrink-0 text-black' />
                          {isExpanded && (
                            <span className='truncate text-[14px] '>
                              {item.label}
                            </span>
                          )}
                        </Link>

                        {isExpanded && hasChildren && (
                          <button
                            type='button'
                            onClick={() => toggleExpanded(item.href)}
                            aria-label={`Toggle ${item.label} options`}
                            className='ml-2 text-[#70706C] hover:text-black'>
                            {isItemExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        )}

                        {isExpanded && !hasChildren && hasArrow && (
                          <ChevronRight
                            size={15}
                            className='text-gray-400 shrink-0'
                          />
                        )}
                      </div>

                      {isExpanded && hasChildren && isItemExpanded && (
                        <div className='mt-1 ml-5 pl-3 border-l-2 border-gray-300 space-y-1'>
                          {item.children?.map((child) => {
                            const hrefWithHash = `${item.href}${child.hash}`;
                            const isHashActive =
                              pathname === item.href &&
                              currentHash === child.hash;

                            return (
                              <Link
                                key={`${mobile ? "mobile-" : ""}${hrefWithHash}`}
                                href={hrefWithHash}
                                onClick={(event) => {
                                  if (pathname === item.href) {
                                    event.preventDefault();
                                    handleHashNavigation(item.href, child.hash);
                                  }
                                  if (mobile) setIsMobileSidebarOpen(false);
                                }}
                                className={`block rounded px-2 py-1.5 text-sm ${
                                  isHashActive
                                    ? "text-black"
                                    : "text-[#70706C] hover:bg-gray-50"
                                }`}>
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout at bottom */}
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className={`mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            !isExpanded ? "justify-center px-2" : "justify-start"
          }`}>
          <LogOut size={18} className='shrink-0' />
          {isExpanded && (
            <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className='min-h-screen'>
      {/* ── STICKY HEADER ── */}
      <header className='sticky top-0 z-50 h-20 border-b border-[#D1CEC6] bg-white flex'>
        {/* Left cell — same width as sidebar, collapses with it */}
        <div
          className={`hidden md:flex items-center gap-3 border-r border-[#D1CEC6] px-4 shrink-0 transition-all duration-200 ${
            isDesktopSidebarOpen ? "w-72" : "w-20"
          }`}>
          {isDesktopSidebarOpen ? (
            <>
              <Link href='/' className='flex items-center flex-1 min-w-0'>
                <Image
                  src='/logo.png'
                  alt='Farrior Homes'
                  width={200}
                  height={80}
                  className='h-15 w-auto object-contain'
                />
              </Link>
              <button
                onClick={() => setIsDesktopSidebarOpen(false)}
                aria-label='Collapse sidebar'
                className='text-gray-500 hover:text-gray-800 shrink-0'>
                <IoMdCode size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsDesktopSidebarOpen(true)}
              aria-label='Expand sidebar'
              className='mx-auto text-gray-500 hover:text-gray-800'>
              <IoMdCode size={20} />
            </button>
          )}
        </div>

        {/* Right cell — top nav actions */}
        <div className='flex-1 flex items-center justify-between px-4 md:px-6 lg:px-8'>
          {/* Mobile: hamburger + logo */}
          <div className='flex items-center gap-3 md:hidden'>
            <Link href='/' className='flex items-center'>
              <Image
                src='/logo.png'
                alt='Farrior Homes'
                width={140}
                height={50}
                className='h-12 w-auto object-contain'
              />
            </Link>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label='Open sidebar'
              className='text-gray-700'>
              <IoMdCode size={20} />
            </button>
          </div>

          {/* Desktop: empty left so icons stay right */}
          <div className='hidden md:block' />

          {/* Right icons */}
          <div className='flex items-center gap-4'>
            <button
              aria-label='Notifications'
              className='text-gray-600 hover:text-gray-900'>
              <Bell size={20} />
            </button>
            <Link href='/admin/profile' aria-label='Admin profile'>
              <div className='w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center'>
                <User size={20} className='text-gray-600' />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* ──  sidebar + main content ── */}
      <div className='flex'>
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col sticky top-20 h-[calc(100vh-5rem)] border-r border-[#D1CEC6] bg-white shrink-0 overflow-hidden transition-all duration-200 ${
            isDesktopSidebarOpen ? "w-72" : "w-20"
          }`}>
          {renderNavItems()}
        </aside>

        {/* Page content */}
        <main className='flex-1 p-4 md:p-11 min-w-0'>{children}</main>
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {isMobileSidebarOpen && (
        <div className='md:hidden fixed inset-0 z-50'>
          <button
            aria-label='Close sidebar overlay'
            className='absolute inset-0 bg-black/40'
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className='absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col'>
            {/* Mobile sidebar header */}
            <div className='h-16 px-4 border-b border-[#D1CEC6] flex items-center justify-between shrink-0'>
              <Link href='/admin' className='flex items-center'>
                <Image
                  src='/logo.png'
                  alt='Farrior Homes'
                  width={140}
                  height={50}
                  className='h-9 w-auto object-contain'
                />
              </Link>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label='Close sidebar'
                className='text-gray-700'>
                <X size={20} />
              </button>
            </div>
            {renderNavItems(true)}
          </aside>
        </div>
      )}
    </div>
  );
}