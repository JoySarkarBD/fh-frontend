"use client";

import { useCurrentUser, useLogoutMutation } from "@/actions/hooks/auth.hooks";
import { ChevronDown, ChevronUp, FileText, LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { BiHomeAlt } from "react-icons/bi";
import { CgCalculator } from "react-icons/cg";
import { FaRegBookmark } from "react-icons/fa6";
import { FiCreditCard } from "react-icons/fi";
import { GrSettingsOption } from "react-icons/gr";
import {
  LuBadgePercent,
  LuBuilding2,
  LuMessageCircleMore,
  LuSettings2,
  LuUserRound,
} from "react-icons/lu";
import { MdOutlineDashboard } from "react-icons/md";

type UserShellProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  children?: { label: string; hash: string }[];
};

export default function UserShell({ children }: UserShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentHash, setCurrentHash] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "/dashboard/profile": true,
  });

  // Get current user data
  const { 
    data: authState,
    isLoading 
  } = useCurrentUser();

  // Check if user is subscribed (you need to adjust this based on your actual data structure)
  const isSubscribed = authState?.isSubscribed ?? false;

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash || "";

    setTimeout(() => setCurrentHash(hash), 0);

    if (hash && pathname === "/dashboard/profile") {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }, 0);
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const toggleSidebar = () => {
      setIsMobileSidebarOpen((prev) => !prev);
    };

    window.addEventListener("toggle-user-sidebar", toggleSidebar);

    return () => {
      window.removeEventListener("toggle-user-sidebar", toggleSidebar);
    };
  }, []);

  const profileOverviewSection = useMemo(() => {
    const profileItems: NavItem[] = [
      {
        label: "Profile",
        href: "/dashboard/profile",
        icon: LuUserRound,
        children: [{ label: "Address", hash: "#profileAddress" }],
      },
      {
        label: "Subscription Plan",
        href: "/dashboard/profile/subscription",
        icon: FiCreditCard,
      },
      {
        label: "Settings",
        href: "/dashboard/profile/settings",
        icon: LuSettings2,
        children: [
          { label: "Notification Settings", hash: "#notifications" },
          { label: "Security Settings", hash: "#security" },
        ],
      },
    ];

    // Add Message item only if user is subscribed
    if (isSubscribed) {
      profileItems.splice(1, 0, {
        label: "Message",
        href: "/dashboard/profile/message",
        icon: LuMessageCircleMore,
      });
    }

    return {
      label: "Profile Overview",
      items: profileItems,
    };
  }, [isSubscribed]);

  const sections = useMemo(() => {
    // If not subscribed, show only Profile Overview section
    if (!isSubscribed) {
      return [profileOverviewSection];
    }

    // If subscribed, show all sections
    return [
      {
        label: "Main",
        items: [
          {
            label: "Overview",
            href: "/dashboard/main/overview",
            icon: MdOutlineDashboard,
          },
          {
            label: "Own Property",
            href: "/dashboard/main/own-property",
            icon: LuBuilding2,
          },
          {
            label: "Sell Property",
            href: "/dashboard/main/sell-property",
            icon: BiHomeAlt,
          },
          {
            label: "Save Property",
            href: "/dashboard/main/save-property",
            icon: FaRegBookmark,
          },
          {
            label: "Documents",
            href: "/dashboard/main/documents",
            icon: FileText,
          },
        ] as NavItem[],
      },
      {
        label: "Tools",
        items: [
          {
            label: "Property Valuation",
            href: "/dashboard/tools/property-valuation",
            icon: CgCalculator,
          },
          {
            label: "Tax Calculation",
            href: "/dashboard/tools/tax-calculation",
            icon: LuBadgePercent,
          },
          {
            label: "Maintenance",
            href: "/dashboard/tools/maintenance",
            icon: GrSettingsOption,
          },
        ] as NavItem[],
      },
      profileOverviewSection,
    ];
  }, [isSubscribed, profileOverviewSection]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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

  // Loading state
  if (isLoading) {
    return (
      <div className='md:mx-12.5 px-6 lg:px-8 py-13'>
        <div className='flex flex-col md:grid md:grid-cols-12 gap-10'>
          <aside className='hidden md:block md:col-span-3'>
            <div className='md:sticky md:top-26 md:h-[calc(100vh-7rem)] border border-[#D1CEC6] rounded-lg p-4 flex flex-col'>
              <div className='animate-pulse space-y-4'>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                <div className='h-4 bg-gray-200 rounded w-2/3'></div>
              </div>
            </div>
          </aside>
          <main className='md:col-span-9 min-w-0'>
            <div className='animate-pulse'>
              <div className='h-64 bg-gray-200 rounded'></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className='md:mx-12.5 px-6 lg:px-8 py-13'>
      <div className='flex flex-col md:grid md:grid-cols-12 gap-10'>
        <aside className='hidden md:block md:col-span-3'>
          <div className='md:sticky md:top-26 md:h-[calc(100vh-7rem)] border border-[#D1CEC6] rounded-lg p-4 flex flex-col'>
            <nav className='space-y-5 flex-1 overflow-y-auto'>
              {sections.map((section) => (
                <div key={section.label}>
                  <h2 className='mb-2 text-[#70706C] text-sm font-medium'>
                    {section.label}
                  </h2>
                  <ul className='space-y-1'>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      const hasChildren = Boolean(item.children?.length);
                      const isExpanded = Boolean(expandedItems[item.href]);

                      return (
                        <li key={item.href}>
                          <div>
                            <div
                              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                                isActive
                                  ? "bg-[#F8FAF9] text-black"
                                  : "text-[#70706C] hover:bg-gray-100"
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

                                  setIsMobileSidebarOpen(false);
                                }}
                                className='flex items-center gap-2 min-w-0 flex-1'>
                                <Icon
                                  size={19}
                                  className='shrink-0 text-(--primary-text-color)'
                                />
                                <span className='truncate text-[15px]'>
                                  {item.label}
                                </span>
                              </Link>

                              {hasChildren && (
                                <button
                                  type='button'
                                  onClick={() => toggleExpanded(item.href)}
                                  aria-label={`Toggle ${item.label} options`}
                                  className='ml-2 text-[#70706C] hover:text-black'>
                                  {isExpanded ? (
                                    <ChevronUp size={16} />
                                  ) : (
                                    <ChevronDown size={16} />
                                  )}
                                </button>
                              )}
                            </div>

                            {hasChildren && isExpanded && (
                              <div className='mt-1 ml-5 pl-3 border-l-2 border-gray-300 space-y-1'>
                                {item.children?.map((child) => {
                                  const hrefWithHash = `${item.href}${child.hash}`;
                                  const isHashActive =
                                    pathname === item.href &&
                                    currentHash === child.hash;

                                  return (
                                    <Link
                                      key={hrefWithHash}
                                      href={hrefWithHash}
                                      onClick={(event) => {
                                        if (pathname === item.href) {
                                          event.preventDefault();
                                          handleHashNavigation(
                                            item.href,
                                            child.hash,
                                          );
                                        }
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
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className='mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
              <LogOut size={17} />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </aside>

        <main className='md:col-span-9 min-w-0'>
          <div className=''>{children}</div>
        </main>
      </div>

      {isMobileSidebarOpen && (
        <div className='md:hidden fixed inset-0 z-50'>
          <button
            aria-label='Close sidebar overlay'
            className='absolute inset-0 bg-black/40'
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          <aside className='absolute left-0 top-0 h-full w-72 bg-white shadow-xl border-r border-[#D1CEC6] p-4 flex flex-col'>
            <div className='mb-4 flex items-center justify-between'>
              <p className='text-sm font-medium text-[#70706C]'>
                Dashboard Menu
              </p>
              <button
                type='button'
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label='Close sidebar'
                className='text-[#70706C] hover:text-black'>
                <X size={18} />
              </button>
            </div>

            <nav className='space-y-5 flex-1 overflow-y-auto'>
              {sections.map((section) => (
                <div key={`mobile-${section.label}`}>
                  <h2 className='mb-2 text-[#70706C] text-sm font-medium'>
                    {section.label}
                  </h2>
                  <ul className='space-y-1'>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      const hasChildren = Boolean(item.children?.length);
                      const isExpanded = Boolean(expandedItems[item.href]);

                      return (
                        <li key={`mobile-${item.href}`}>
                          <div>
                            <div
                              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                                isActive
                                  ? "bg-[#F8FAF9] text-black"
                                  : "text-[#70706C] hover:bg-gray-100"
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

                                  setIsMobileSidebarOpen(false);
                                }}
                                className='flex items-center gap-2 min-w-0 flex-1'>
                                <Icon size={17} className='shrink-0' />
                                <span className='truncate'>{item.label}</span>
                              </Link>

                              {hasChildren && (
                                <button
                                  type='button'
                                  onClick={() => toggleExpanded(item.href)}
                                  aria-label={`Toggle ${item.label} options`}
                                  className='ml-2 text-[#70706C] hover:text-black'>
                                  {isExpanded ? (
                                    <ChevronUp size={16} />
                                  ) : (
                                    <ChevronDown size={16} />
                                  )}
                                </button>
                              )}
                            </div>

                            {hasChildren && isExpanded && (
                              <div className='mt-1 ml-5 pl-3 border-l-2 border-gray-300 space-y-1'>
                                {item.children?.map((child) => {
                                  const hrefWithHash = `${item.href}${child.hash}`;
                                  const isHashActive =
                                    pathname === item.href &&
                                    currentHash === child.hash;

                                  return (
                                    <Link
                                      key={`mobile-${hrefWithHash}`}
                                      href={hrefWithHash}
                                      onClick={(event) => {
                                        if (pathname === item.href) {
                                          event.preventDefault();
                                          handleHashNavigation(
                                            item.href,
                                            child.hash,
                                          );
                                        }
                                        setIsMobileSidebarOpen(false);
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
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className='mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
              <LogOut size={17} />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}