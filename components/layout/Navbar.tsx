'use client';

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="flex h-full items-center px-6 lg:ml-64">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-semibold text-foreground">Fruit Export Management</h2>
          <div className="flex items-center gap-4">
            {/* Add any additional navbar items here */}
          </div>
        </div>
      </div>
    </header>
  );
}



