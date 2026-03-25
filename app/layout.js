import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import HeaderServer from "@/components/HeaderServer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Career Genie",
  description: "Your AI-Powered Career Companion",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      forceRedirectUrl="/"
      appearance={{
        theme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* header */}
            <HeaderServer />

            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            {/* footer */}
            <footer className="bg-muted/50 py-6">
              <div className="container mx-auto px-4 text-center text-gray-200">
                Made with ❤️ by Jolly
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
