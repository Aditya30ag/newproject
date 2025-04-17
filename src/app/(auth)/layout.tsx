"use client";

export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
        <main className="flex-1 flex items-center justify-center">
          {children}
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} University Placement Tracking System. All rights reserved.
          </p>
        </footer>
      </div>
    );
  }
  