/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { StructureList } from './components/StructureList';
import { StructureForm } from './components/StructureForm';
import { ProjectCalculator } from './components/ProjectCalculator';
import { ProjectHistory } from './components/ProjectHistory';
import { QuoteDocument } from './components/QuoteDocument';
import { ProjectDetails } from './components/ProjectDetails';
import { useData } from './hooks/useData';
import { Structure, Project } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2, Calculator } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingStructure, setEditingStructure] = useState<Structure | undefined>(undefined);
  const [viewingProject, setViewingProject] = useState<Project | undefined>(undefined);
  
  const { 
    user,
    isAuthReady,
    loading,
    structures, 
    projects, 
    login,
    logout,
    addStructure, 
    updateStructure, 
    deleteStructure, 
    duplicateStructure,
    addProject,
    deleteProject,
    updateProject
  } = useData();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl text-center space-y-8"
        >
          <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
            <Calculator className="text-primary-foreground w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-primary">STRUCTURA</h1>
            <p className="text-muted-foreground font-medium">Gestión profesional de estructuras y materiales.</p>
          </div>
          <Button 
            onClick={login} 
            className="w-full py-6 text-lg font-bold bg-primary hover:opacity-90 shadow-lg shadow-primary/20 gap-3"
          >
            <LogIn className="w-5 h-5" /> Iniciar sesión con Google
          </Button>
          <p className="text-xs text-muted-foreground">
            Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </motion.div>
      </div>
    );
  }

  const handleSaveStructure = (data: any) => {
    if (editingStructure) {
      updateStructure(editingStructure.id, data);
    } else {
      addStructure(data);
    }
    setEditingStructure(undefined);
    setActiveTab('structures');
  };

  const handleSaveProject = async (data: any) => {
    const newProject = await addProject(data);
    if (newProject) {
      setViewingProject(newProject);
      setActiveTab('view-project');
    }
  };

  const renderContent = () => {
    if (loading && activeTab !== 'create-structure') {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAction={setActiveTab} />;
      case 'structures':
        return (
          <StructureList 
            structures={structures} 
            onEdit={(s) => { setEditingStructure(s); setActiveTab('create-structure'); }}
            onDuplicate={duplicateStructure}
            onDelete={deleteStructure}
            onAdd={() => { setEditingStructure(undefined); setActiveTab('create-structure'); }}
          />
        );
      case 'create-structure':
        return (
          <StructureForm 
            initialData={editingStructure}
            onSave={handleSaveStructure}
            onCancel={() => { setEditingStructure(undefined); setActiveTab('structures'); }}
          />
        );
      case 'calculator':
        return <ProjectCalculator structures={structures} onSaveProject={handleSaveProject} />;
      case 'history':
        return (
          <ProjectHistory 
            projects={projects} 
            onView={(p) => { setViewingProject(p); setActiveTab('view-project'); }}
            onManage={(p) => { setViewingProject(p); setActiveTab('manage-project'); }}
            onReuse={(p) => { 
              setActiveTab('calculator');
            }}
            onDelete={deleteProject}
          />
        );
      case 'view-project':
        return viewingProject ? (
          <QuoteDocument 
            project={viewingProject} 
            structures={structures} 
            onBack={() => setActiveTab('history')} 
          />
        ) : null;
      case 'manage-project':
        return viewingProject ? (
          <ProjectDetails 
            project={viewingProject} 
            structures={structures} 
            onBack={() => setActiveTab('history')} 
            onUpdate={(id, updates) => {
              updateProject(id, updates);
              setViewingProject(prev => prev ? { ...prev, ...updates } : undefined);
            }}
          />
        ) : null;
      default:
        return <Dashboard onAction={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-accent/30 selection:text-accent-foreground">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="flex justify-end mb-4 md:hidden">
           <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground text-xs">Cerrar Sesión</Button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

