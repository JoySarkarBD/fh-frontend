import UserShell from "@/components/dashboard/UserShell";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import { getCurrentUserFromTokenAction } from "@/services/auth";
import { ReactNode } from "react";

export default async function UserDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authState = await getCurrentUserFromTokenAction();
  return (
    <>
      <div className='sticky top-0 z-50 border-b border-gray-200'>
        <Navbar />
      </div>

      <main className='flex-1'>
        <UserShell
          isLoggedIn={authState.isLoggedIn}
          userRole={authState.userRole}
          isSubscribed={authState.isSubscribed}>
          {children}
        </UserShell>
      </main>

      <Footer />
    </>
  );
}
