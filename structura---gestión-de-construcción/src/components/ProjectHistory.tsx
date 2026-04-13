import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Copy, Trash2, Search, Calendar, User, Settings } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Project } from "@/src/types";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function ProjectHistory({ 
  projects, 
  onView, 
  onManage,
  onReuse, 
  onDelete 
}: { 
  projects: Project[], 
  onView: (p: Project) => void,
  onManage: (p: Project) => void,
  onReuse: (p: Project) => void,
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Proyectos y Cotizaciones</h2>
          <p className="text-muted-foreground">Accede a tus cálculos guardados.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar proyecto o cliente..." className="pl-10 bg-background border-none shadow-none focus-visible:ring-1" />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Proyecto / Cliente</TableHead>
                  <TableHead className="font-bold">Tipo</TableHead>
                  <TableHead className="font-bold">Fecha</TableHead>
                  <TableHead className="font-bold">Estructuras</TableHead>
                  <TableHead className="font-bold">Estado</TableHead>
                  <TableHead className="text-right font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No hay proyectos en el historial.
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary">{project.name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" /> {project.client}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {project.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {format(project.createdAt, 'dd MMM yyyy', { locale: es })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none">
                          {project.structures.length} tipos
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            project.status === 'active' ? "border-green-200 text-green-700 bg-green-50" :
                            project.status === 'completed' ? "border-blue-200 text-blue-700 bg-blue-50" :
                            "border-gray-200 text-gray-700 bg-gray-50"
                          }
                        >
                          {project.status === 'active' ? 'Activo' : project.status === 'completed' ? 'Completado' : 'Archivado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onView(project)}
                            title="Ver Cotización"
                            className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onManage(project)}
                            title="Gestionar Proyecto"
                            className="text-muted-foreground hover:text-accent-foreground hover:bg-accent/5"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onReuse(project)}
                            className="text-muted-foreground hover:text-accent-foreground hover:bg-accent/5"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onDelete(project.id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
