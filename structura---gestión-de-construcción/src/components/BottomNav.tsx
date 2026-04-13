import React from 'react';
import { LayoutDashboard, Database, Calculator, FileText, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  key?: string | number;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-200",
        active ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn("w-6 h-6", active && "fill-primary/10")} />
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

export function BottomNav({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'structures', label: 'Base', icon: Database },
    { id: 'calculator', label: 'Calcular', icon: Calculator },
    { id: 'history', label: 'Proyectos', icon: FileText },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border px-4 py-1 flex items-center justify-around z-50 pb-safe">
      {navItems.map((item) => (
        <NavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={activeTab === item.id}
          onClick={() => setActiveTab(item.id)}
        />
      ))}
    </nav>
  );
}
