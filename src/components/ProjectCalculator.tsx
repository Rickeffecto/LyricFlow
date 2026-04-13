import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Calculator, FileText, Save, Building2 } from 'lucide-react';
import { Structure, ProjectStructure, ConsolidatedMaterial } from "@/src/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function ProjectCalculator({ 
  structures, 
  onSaveProject 
}: { 
  structures: Structure[], 
  onSaveProject: (project: { name: string, client: string, type: 'proyecto' | 'cotización', structures: ProjectStructure[] }) => void 
}) {
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectType, setProjectType] = useState<'proyecto' | 'cotización'>('cotización');
  const [selectedStructures, setSelectedStructures] = useState<ProjectStructure[]>([]);

  const addStructure = () => {
    setSelectedStructures([...selectedStructures, { structureId: '', quantity: 1 }]);
  };

  const removeStructure = (index: number) => {
    setSelectedStructures(selectedStructures.filter((_, i) => i !== index));
  };

  const updateStructure = (index: number, field: keyof ProjectStructure, value: string | number) => {
    const newSelected = [...selectedStructures];
    newSelected[index] = { ...newSelected[index], [field]: value };
    setSelectedStructures(newSelected);
  };

  const consolidatedMaterials = useMemo(() => {
    const materialsMap: Record<string, ConsolidatedMaterial> = {};

    selectedStructures.forEach(({ structureId, quantity }) => {
      const structure = structures.find(s => s.id === structureId);
      if (!structure) return;

      structure.materials.forEach(material => {
        const key = `${material.name}-${material.unit}`;
        if (!materialsMap[key]) {
          materialsMap[key] = {
            name: material.name,
            unit: material.unit,
            totalQuantity: 0,
            totalCost: 0
          };
        }
        materialsMap[key].totalQuantity += material.quantity * quantity;
        materialsMap[key].totalCost += (material.cost || 0) * material.quantity * quantity;
      });
    });

    return Object.values(materialsMap);
  }, [selectedStructures, structures]);

  const totalProjectCost = consolidatedMaterials.reduce((acc, m) => acc + m.totalCost, 0);

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Calculadora de Proyecto</h2>
          <p className="text-muted-foreground">Calcula materiales totales y genera cotizaciones profesionales.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => onSaveProject({ name: projectName, client: clientName, type: projectType, structures: selectedStructures })}
            className="bg-accent text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/20"
            disabled={!projectName || selectedStructures.length === 0}
          >
            <Save className="w-4 h-4 mr-2" /> Guardar {projectType === 'proyecto' ? 'Proyecto' : 'Cotización'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Datos del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Tipo de Documento</label>
                <Select 
                  value={projectType} 
                  onValueChange={(val: 'proyecto' | 'cotización') => setProjectType(val)}
                >
                  <SelectTrigger className="bg-background border-none shadow-none">
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cotización">Cotización</SelectItem>
                    <SelectItem value="proyecto">Proyecto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Nombre del Proyecto</label>
                <Input 
                  placeholder="Ej: Residencial Los Pinos" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Cliente</label>
                <Input 
                  placeholder="Ej: Juan Pérez / Constructora X" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Estructuras</CardTitle>
              <Button size="sm" variant="outline" onClick={addStructure} className="border-primary text-primary hover:bg-primary/5">
                <Plus className="w-4 h-4 mr-1" /> Agregar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedStructures.map((item, index) => (
                <div key={index} className="flex items-end gap-2 p-3 rounded-xl bg-muted/30 group">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Estructura</label>
                    <Select 
                      value={item.structureId} 
                      onValueChange={(val) => updateStructure(index, 'structureId', val)}
                    >
                      <SelectTrigger className="bg-background border-none shadow-none">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {structures.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20 space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Cant.</label>
                    <Input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => updateStructure(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="bg-background border-none shadow-none"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeStructure(index)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 mb-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {selectedStructures.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Agrega estructuras para comenzar el cálculo.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Resumen de Materiales</CardTitle>
                <p className="text-primary-foreground/70 text-sm">Consolidado total del proyecto</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Costo Estimado</p>
                <p className="text-2xl font-black">L {totalProjectCost.toLocaleString()}</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold">Material</TableHead>
                    <TableHead className="font-bold">Cantidad Total</TableHead>
                    <TableHead className="font-bold">Unidad</TableHead>
                    <TableHead className="text-right font-bold">Costo Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consolidatedMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                        <Calculator className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        Selecciona estructuras para ver el desglose de materiales.
                      </TableCell>
                    </TableRow>
                  ) : (
                    consolidatedMaterials.map((material, i) => (
                      <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-semibold">{material.name}</TableCell>
                        <TableCell className="font-bold text-primary">{material.totalQuantity.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">{material.unit}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">L {material.totalCost.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {consolidatedMaterials.length > 0 && (
            <div className="flex justify-end">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                <FileText className="w-4 h-4 mr-2" /> Generar PDF de Cotización
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
