import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Copy, Trash2, Search, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Structure } from "@/src/types";
import { Badge } from "@/components/ui/badge";

export function StructureList({ 
  structures, 
  onEdit, 
  onDuplicate, 
  onDelete,
  onAdd
}: { 
  structures: Structure[], 
  onEdit: (s: Structure) => void,
  onDuplicate: (s: Structure) => void,
  onDelete: (id: string) => void,
  onAdd: () => void
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStructures = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return structures.filter(structure => 
      structure.name.toLowerCase().includes(lowerSearch) ||
      structure.materials.some(m => m.name.toLowerCase().includes(lowerSearch))
    );
  }, [structures, searchTerm]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Base de Estructuras</h2>
          <p className="text-muted-foreground">Gestiona tus diseños estructurales reutilizables.</p>
        </div>
        <Button onClick={onAdd} className="bg-primary hover:opacity-90 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Crear Estructura
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre o material..." 
              className="pl-10 bg-background border-none shadow-none focus-visible:ring-1" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Nombre de Estructura</TableHead>
                  <TableHead className="font-bold">Materiales</TableHead>
                  <TableHead className="font-bold">Costo Unitario Est.</TableHead>
                  <TableHead className="text-right font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStructures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      {searchTerm ? 'No se encontraron estructuras o materiales con ese nombre.' : 'No hay estructuras registradas. Comienza creando una.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStructures.map((structure) => {
                    const totalCost = structure.materials.reduce((acc, m) => acc + (m.cost || 0) * m.quantity, 0);
                    const topMaterials = [...structure.materials]
                      .sort((a, b) => ((b.cost || 0) * b.quantity) - ((a.cost || 0) * a.quantity))
                      .slice(0, 3);

                    return (
                      <TableRow key={structure.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="py-4">
                          <div className="font-semibold text-primary text-lg">{structure.name}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {topMaterials.map((m, idx) => (
                              <span key={idx} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                                {m.name} ({m.quantity}{m.unit})
                              </span>
                            ))}
                            {structure.materials.length > 3 && (
                              <span className="text-[10px] text-muted-foreground/60 italic self-center ml-1">
                                +{structure.materials.length - 3} más
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/5 text-primary border-none">
                            {structure.materials.length} materiales
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">L {totalCost.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => onEdit(structure)}
                              className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => onDuplicate(structure)}
                              className="text-muted-foreground hover:text-accent-foreground hover:bg-accent/5"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => onDelete(structure.id)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
