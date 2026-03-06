// components/Navbar/index.tsx
import {
  getCurrentUserFromTokenAction,
  type AuthNavbarState,
} from "@/services/auth";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  let initialAuthState: AuthNavbarState = {
    isLoggedIn: false,
    userRole: "user",
    isSubscribed: false
  };

  try {
    initialAuthState = await getCurrentUserFromTokenAction();
  } catch {
    initialAuthState = {
      isLoggedIn: false,
      userRole: "user",
      isSubscribed:false
    };
  }

  return <NavbarClient initialAuthState={initialAuthState} />;
}