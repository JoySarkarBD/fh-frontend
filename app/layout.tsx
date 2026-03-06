import TanstackProvider from "@/providers/TanstackProvider";
import { Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata = {
  title: "Farrior Homes",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${jost.className} min-h-screen flex flex-col`}>
<TanstackProvider>
          {children}
</TanstackProvider>
      </body>
    </html>
  );
}
