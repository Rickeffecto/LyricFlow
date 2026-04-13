import React from 'react';
import { LayoutDashboard, Database, Calculator, History, PlusCircle, FileText } from 'lucide-react';
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
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left group",
        active 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground")} />
      <span className="font-medium">{label}</span>
    </button>
  );
}

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'structures', label: 'Estructuras', icon: Database },
    { id: 'calculator', label: 'Calculadora', icon: Calculator },
    { id: 'history', label: 'Proyectos', icon: FileText },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 p-4">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
          <Calculator className="text-accent-foreground w-6 h-6" />
        </div>
        <div>
          <h1 className="text-sidebar-foreground font-bold text-xl tracking-tight">Structura</h1>
          <p className="text-sidebar-foreground/50 text-xs font-medium uppercase tracking-widest">Pro Edition</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
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

      <div className="mt-auto pt-4 border-t border-sidebar-border/50">
        <button 
          onClick={() => setActiveTab('create-structure')}
          className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-accent-foreground rounded-xl font-semibold shadow-lg shadow-accent/20 hover:opacity-90 transition-all active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          Nueva Estructura
        </button>
      </div>
    </aside>
  );
}
