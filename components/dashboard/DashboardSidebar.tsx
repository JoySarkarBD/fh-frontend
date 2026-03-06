"use client";

import {
  Calculator,
  ChevronDown,
  ChevronUp,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  LogOut,
  Settings as SettingsIcon,
  User,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiBookmark, FiGrid, FiHome, FiSettings } from "react-icons/fi";
import { useLogoutMutation } from "@/actions/hooks/auth.hooks";

export default function DashboardSidebar() {
  const router = useRouter();
  const [showProfileOverview, setShowProfileOverview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const [showTool, setShowTool] = useState(false);
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

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
    const t = setTimeout(() => setCurrentHash(window.location.hash || ""), 0);
    const onHash = () => setCurrentHash(window.location.hash || "");
    window.addEventListener("hashchange", onHash);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProfileOverview(pathname === "/profile");
      setShowSettings(pathname === "/settings");
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className='sticky top-20 max-w-88 h-[calc(100vh-2rem)] border border-[#D1CEC6] rounded-lg flex flex-col justify-between'>
      <div className='p-4'>
        <h2 className='mb-4 text-[#70706C]'>Main</h2>
        <ul className='space-y-2'>
          <li>
            <div className='flex flex-col'>
              <button
                onClick={() => setShowMain(!showMain)}
                className={`text-left py-2 px-4 w-full rounded flex items-center justify-between ${
                  pathname === "/overview"
                    ? "text-black"
                    : "hover:bg-gray-100 text-gray-700"
                }`}>
                <div className='flex items-center gap-2'>
                  <FiGrid size={18} />
                  <Link href='/overview'>Overview</Link>
                </div>
              </button>
            </div>
          </li>
          <li>
            <div className='flex flex-col'>
              <button
                onClick={() => setShowMain(!showMain)}
                className={`text-left py-2 px-4 w-full rounded flex items-center justify-between ${
                  pathname === "/own-property"
                    ? "text-black"
                    : "hover:bg-gray-100 text-gray-700"
                }`}>
                <div className='flex items-center gap-2'>
                  <Warehouse size={18} />
                  <Link href='/own-property'>Own Property</Link>
                </div>
              </button>
            </div>
          </li>
          <li>
            <div className='flex flex-col'>
              <button
                onClick={() => setShowMain(!showMain)}
                className={`text-left py-2 px-4 w-full rounded flex items-center justify-between ${
                  pathname === "/sale-property"
                    ? "text-black"
                    : "hover:bg-gray-100 text-gray-700"
                }`}>
                <div className='flex items-center gap-2'>
                  <FiHome size={18} />
                  <Link href='/sale-property'>Sale Property</Link>
                </div>
              </button>
            </div>
          </li>
          <li>
            <div className='flex flex-col'>
              <button
                onClick={() => setShowMain(!showMain)}
                className={`text-left py-2 px-4 w-full rounded flex items-center justify-between ${
                  pathname === "/save-property"
                    ? "text-black"
                    : "hover:bg-gray-100 text-gray-700"
                }`}>
                <div className='flex items-center gap-2'>
                  <FiBookmark size={18} />
                  <Link href='/save-property'>Save Property</Link>
                </div>
              </button>
            </div>
          </li>
          <li>
            <div className='flex flex-col'>
              <button
                onClick={() => setShowMain(!showMain)}
                className={`text-left py-2 px-4 w-full rounded flex items-center justify-between ${
                  pathname === "/documents"
                    ? "text-black"
                    : "hover:bg-gray-100 text-gray-700"
                }`}>
                <div className='flex items-center gap-2'>
                  <FileText size={18} />
                  <Link href='/documents'>Documents</Link>
                </div>
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div className='p-4'>
        <h2 className='mb-4 text-[#70706C]'>Tool</h2>
        <ul className='space-y-2'>
          <li>
            <div className='flex flex-col'>
              <button
                onClick={() => setShowTool(!showTool)}
                className={`text-left py-2 px-4 w-full rounded flex items-center justify-between ${
                  pathname === "/property-valuation"
                    ? "text-black"
                    : "hover:bg-gray-100 text-gray-700"
                }`}>
                <div className='flex items-center gap-2'>
                  <Calculator size={18} />
                  <Link href='/property-valuation'>Property Valuation</Link>
                </div>
              </button>
            </div>
          </li>
          <li>
            <div className='flex flex-col'>
              <button
                onClick={() => setShowTool(!showTool)}
                className={`text-left py-2 px-4 w-full rounded flex items-center justify-between ${
                  pathname === "/tax-calculation"
                    ? "text-black"
                    : "hover:bg-gray-100 text-gray-700"
                }`}>
                <div className='flex items-center gap-2'>
                  <DollarSign size={18} />
                  <Link href='/tax-calculation'>Tax Calculation</Link>
                </div>
              </button>
            </div>
          </li>
          <li>
            <div className='flex flex-col'>
              <button
                onClick={() => setShowTool(!showTool)}
                className={`text-left py-2 px-4 w-full rounded flex items-center justify-between ${
                  pathname === "/maintenance"
                    ? "text-black"
                    : "hover:bg-gray-100 text-gray-700"
                }`}>
                <div className='flex items-center gap-2'>
                  <FiSettings size={18} />
                  <Link href='/maintenance'>Maintenance</Link>
                </div>
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div className='p-4'>
        <h2 className='mb-4 text-[#70706C]'>Profile Overview</h2>
        <ul className='space-y-2'>
          <li>
            <div className='flex flex-col'>
              <button
                onClick={() => setShowProfileOverview(!showProfileOverview)}
                className={`text-left py-2 px-4 w-full rounded flex items-center justify-between ${
                  pathname === "/profile"
                    ? "text-black"
                    : "hover:bg-gray-100 text-gray-700"
                }`}>
                <div className='flex items-center gap-2'>
                  <User size={18} />
                  <Link href='/profile'>Profile overview</Link>
                </div>
                {showProfileOverview ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>

              {showProfileOverview && (
                <div className='mt-2 ml-4 pl-4 border-l-2 border-gray-300'>
                  <a
                    href='/profile#profileAddress'
                    className={`flex items-center gap-2 py-2 px-2 rounded ${
                      pathname === "/profile" &&
                      currentHash === "#profileAddress"
                        ? "text-black "
                        : "hover:bg-gray-50 text-gray-700"
                    }`}>
                    <Home size={15} className='text-gray-500' />
                    Address
                  </a>
                </div>
              )}
            </div>
          </li>

          <li>
            <div className='mt-2 ml-4 border-gray-300 flex justify-start items-center '>
              <CreditCard size={16} className=' text-gray-500' />
              <Link
                href='/subscription'
                className={`block py-2 px-2 rounded ${
                  pathname === "/subscription"
                    ? "text-black "
                    : "hover:bg-gray-200 text-gray-700"
                }`}>
                Subscription plan
              </Link>
            </div>
          </li>

          <li>
            <div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`w-full text-left py-2 px-4 rounded flex items-center justify-between ${
                  pathname === "/settings"
                    ? "text-black"
                    : "hover:bg-gray-100 text-gray-700"
                }`}>
                <div className='flex items-center gap-2'>
                  <SettingsIcon size={18} />
                  <Link href='/settings'>Settings</Link>
                </div>
                {showSettings ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>

              {showSettings && (
                <div className='mt-2 ml-4 pl-4 space-y-1 border-l-2 border-gray-300'>
                  <a
                    href='/settings#notifications'
                    className={`block py-2 px-3 rounded ${
                      pathname === "/settings" &&
                      currentHash === "#notifications"
                        ? "text-black "
                        : "hover:bg-gray-50 text-gray-700"
                    }`}>
                    Notification settings
                  </a>
                  <a
                    href='/settings#security'
                    className={`block py-2 px-3 rounded ${
                      pathname === "/settings" && currentHash === "#security"
                        ? "text-black "
                        : "hover:bg-gray-50 text-gray-700"
                    }`}>
                    Security settings
                  </a>
                </div>
              )}
            </div>
          </li>
        </ul>
      </div>

      <div className='mt-6 border-t border-[#D1CEC6]'>
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className='p-4 rounded text-red-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed w-full text-left'>
          <div className='flex items-center justify-start gap-x-1'>
            <LogOut size={18} />
            <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
          </div>
        </button>
      </div>
    </div>
  );
}