import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save, X, Package, AlertCircle } from 'lucide-react';
import { Material, Structure } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";

export function StructureForm({ 
  initialData, 
  onSave, 
  onCancel 
}: { 
  initialData?: Structure, 
  onSave: (s: Omit<Structure, 'id' | 'createdAt' | 'updatedAt'>) => void,
  onCancel: () => void
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [materials, setMaterials] = useState<Omit<Material, 'id'>[]>(
    initialData?.materials.map(({ id, ...rest }) => rest) || []
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  const addMaterial = () => {
    setMaterials([...materials, { name: '', unit: '', quantity: 0, cost: 0 }]);
    setErrors([]);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: keyof Omit<Material, 'id'>, value: string | number) => {
    const newMaterials = [...materials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setMaterials(newMaterials);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const newErrors: string[] = [];

    if (!name.trim()) {
      newErrors.push("El nombre de la estructura es obligatorio.");
    }

    if (materials.length === 0) {
      newErrors.push("Debes agregar al menos un material.");
    }

    materials.forEach((m, i) => {
      if (!m.name.trim()) newErrors.push(`Fila ${i + 1}: El nombre del material es obligatorio.`);
      if (!m.unit.trim()) newErrors.push(`Fila ${i + 1}: La unidad es obligatoria.`);
      if (m.quantity <= 0) newErrors.push(`Fila ${i + 1}: La cantidad debe ser mayor a 0.`);
      if (m.cost < 0) newErrors.push(`Fila ${i + 1}: El costo no puede ser negativo.`);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({ name, materials: materials as Material[] });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold text-primary">
            {initialData ? 'Editar Estructura' : 'Nueva Estructura'}
          </h2>
        </div>
        <Button onClick={handleSubmit} className="bg-accent text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/20">
          <Save className="w-4 h-4 mr-2" /> Guardar Estructura
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {errors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold mb-1">Por favor corrige los siguientes errores:</p>
              <ul className="list-disc list-inside space-y-0.5 opacity-90">
                {errors.slice(0, 3).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {errors.length > 3 && <li>Y {errors.length - 3} errores más...</li>}
              </ul>
            </div>
          </div>
        )}

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Información General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Nombre de la Estructura</label>
              <Input 
                placeholder="Ej: Columna 20x20x3m" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg font-semibold py-6"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
            <CardTitle className="text-lg font-semibold">Lista de Materiales</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addMaterial} className="border-accent text-accent-foreground hover:bg-accent/5">
              <Plus className="w-4 h-4 mr-2" /> Agregar Material
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[40%] font-bold uppercase text-[10px]">Material</TableHead>
                    <TableHead className="w-[15%] font-bold uppercase text-[10px]">Unidad</TableHead>
                    <TableHead className="w-[15%] font-bold uppercase text-[10px]">Cantidad</TableHead>
                    <TableHead className="w-[20%] font-bold uppercase text-[10px]">Costo (Opc)</TableHead>
                    <TableHead className="w-[10%] text-right font-bold uppercase text-[10px]">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {materials.map((material, index) => {
                      const isInvalidName = touched && !material.name.trim();
                      const isInvalidUnit = touched && !material.unit.trim();
                      const isInvalidQty = touched && material.quantity <= 0;
                      const isInvalidCost = touched && material.cost < 0;

                      return (
                        <TableRow key={index} className="group hover:bg-muted/30 transition-colors">
                          <TableCell className="py-2">
                            <Input 
                              placeholder="Nombre del material" 
                              value={material.name}
                              onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                              className={`bg-transparent border-none shadow-none focus-visible:ring-1 ${isInvalidName ? 'ring-1 ring-destructive' : ''}`}
                            />
                          </TableCell>
                          <TableCell className="py-2">
                            <Input 
                              placeholder="m³, kg, etc" 
                              value={material.unit}
                              onChange={(e) => updateMaterial(index, 'unit', e.target.value)}
                              className={`bg-transparent border-none shadow-none focus-visible:ring-1 ${isInvalidUnit ? 'ring-1 ring-destructive' : ''}`}
                            />
                          </TableCell>
                          <TableCell className="py-2">
                            <Input 
                              type="number" 
                              placeholder="0" 
                              value={material.quantity}
                              onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className={`bg-transparent border-none shadow-none focus-visible:ring-1 ${isInvalidQty ? 'ring-1 ring-destructive' : ''}`}
                            />
                          </TableCell>
                          <TableCell className="py-2">
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              value={material.cost}
                              onChange={(e) => updateMaterial(index, 'cost', parseFloat(e.target.value) || 0)}
                              className={`bg-transparent border-none shadow-none focus-visible:ring-1 ${isInvalidCost ? 'ring-1 ring-destructive' : ''}`}
                            />
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeMaterial(index)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
              
              {materials.length === 0 && (
                <div className="text-center py-12 border-t border-dashed border-muted">
                  <Package className="w-12 h-12 text-muted mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No has agregado materiales aún.</p>
                  <Button variant="link" onClick={addMaterial} className="text-accent-foreground font-bold">
                    Haz clic aquí para agregar el primero
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
