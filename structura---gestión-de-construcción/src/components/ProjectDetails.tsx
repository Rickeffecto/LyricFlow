import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Archive,
  Save,
  Calculator,
  FileText,
  Download
} from 'lucide-react';
import { Project, Structure, ConsolidatedMaterial } from "@/src/types";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProjectDetailsProps {
  project: Project;
  structures: Structure[];
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

export function ProjectDetails({ project, structures, onBack, onUpdate }: ProjectDetailsProps) {
  const [status, setStatus] = useState(project.status);
  const [completionDate, setCompletionDate] = useState(
    project.completionDate ? format(project.completionDate, 'yyyy-MM-dd') : ''
  );

  const consolidatedMaterials = useMemo(() => {
    const materialsMap: Record<string, ConsolidatedMaterial> = {};

    project.structures.forEach(({ structureId, quantity }) => {
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
  }, [project.structures, structures]);

  const totalCost = consolidatedMaterials.reduce((acc, m) => acc + m.totalCost, 0);

  const handleSave = () => {
    onUpdate(project.id, {
      status,
      completionDate: completionDate ? new Date(completionDate).getTime() : undefined
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text('STRUCTURA', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Gestión Profesional de Estructuras', 14, 26);
    
    doc.setDrawColor(200);
    doc.line(14, 30, pageWidth - 14, 30);
    
    // Project Info
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(project.name.toUpperCase(), 14, 45);
    
    doc.setFontSize(10);
    doc.text(`Cliente: ${project.client}`, 14, 52);
    doc.text(`Tipo: ${project.type.charAt(0).toUpperCase() + project.type.slice(1)}`, 14, 57);
    doc.text(`Estado: ${status === 'active' ? 'Activo' : status === 'completed' ? 'Completado' : 'Archivado'}`, 14, 62);
    doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy')}`, pageWidth - 14, 45, { align: 'right' });
    
    if (completionDate) {
      doc.text(`Finalización Estimada: ${format(new Date(completionDate), 'dd/MM/yyyy')}`, 14, 67);
    }

    // Structures Table
    doc.setFontSize(12);
    doc.text('DESGLOSE DE ESTRUCTURAS', 14, 80);
    
    const structuresData = project.structures.map(ps => {
      const structure = structures.find(s => s.id === ps.structureId);
      const subtotal = structure?.materials.reduce((acc, m) => acc + (m.cost || 0) * m.quantity, 0) || 0;
      return [
        structure?.name || 'N/A',
        ps.quantity.toString(),
        `L ${subtotal.toLocaleString()}`,
        `L ${(subtotal * ps.quantity).toLocaleString()}`
      ];
    });

    autoTable(doc, {
      startY: 85,
      head: [['Estructura', 'Cantidad', 'Costo Unit.', 'Subtotal']],
      body: structuresData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Materials Table
    const finalY = (doc as any).lastAutoTable.finalY || 85;
    doc.setFontSize(12);
    doc.text('CONSOLIDADO DE MATERIALES', 14, finalY + 15);

    const materialsData = consolidatedMaterials.map(m => [
      m.name,
      m.totalQuantity.toLocaleString(),
      m.unit,
      `L ${m.totalCost.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Material', 'Cantidad', 'Unidad', 'Costo Total']],
      body: materialsData,
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] }
    });

    // Total
    const finalY2 = (doc as any).lastAutoTable.finalY || finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Subtotal: L ${(totalCost * 0.85).toLocaleString()}`, pageWidth - 14, finalY2 + 15, { align: 'right' });
    doc.text(`ISV (15%): L ${(totalCost * 0.15).toLocaleString()}`, pageWidth - 14, finalY2 + 20, { align: 'right' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(`INVERSIÓN TOTAL ESTIMADA: L ${totalCost.toLocaleString()}`, pageWidth - 14, finalY2 + 30, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text('Este documento es un reporte técnico generado por Structura App', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
    doc.text('Los costos son estimaciones basadas en la base de datos actual.', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    doc.save(`${project.name.replace(/\s+/g, '_')}_Reporte.pdf`);
  };

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-primary">{project.name}</h2>
              <Badge variant="outline" className="capitalize">
                {project.type}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> {project.client}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF} className="border-primary text-primary hover:bg-primary/5">
            <Download className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
          <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/20">
            <Save className="w-4 h-4 mr-2" /> Guardar Cambios
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Gestión del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Estado del Proyecto</label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-500" /> Activo
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" /> Completado
                      </div>
                    </SelectItem>
                    <SelectItem value="archived">
                      <div className="flex items-center gap-2">
                        <Archive className="w-4 h-4 text-gray-500" /> Archivado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Fecha de Finalización (Estimada)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="date" 
                    className="pl-10" 
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha Creación:</span>
                  <span className="font-medium">{format(project.createdAt, 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Última Actualización:</span>
                  <span className="font-medium">{format(project.updatedAt, 'dd/MM/yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardContent className="pt-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">Inversión Total Estimada</p>
              <p className="text-3xl font-black">L {totalCost.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" /> Desglose de Estructuras
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estructura</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Subtotal Est.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.structures.map((ps, idx) => {
                    const structure = structures.find(s => s.id === ps.structureId);
                    const subtotal = structure?.materials.reduce((acc, m) => acc + (m.cost || 0) * m.quantity, 0) || 0;
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{structure?.name || 'Estructura no encontrada'}</TableCell>
                        <TableCell className="text-center font-bold">{ps.quantity}</TableCell>
                        <TableCell className="text-right font-bold">L {(subtotal * ps.quantity).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Resumen de Materiales
                </CardTitle>
                <p className="text-primary-foreground/70 text-sm">Consolidado total del proyecto</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Inversión Estimada</p>
                <p className="text-2xl font-black">L {totalCost.toLocaleString()}</p>
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
                  {consolidatedMaterials.map((m, i) => (
                    <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold">{m.name}</TableCell>
                      <TableCell className="font-bold text-primary">{m.totalQuantity.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">{m.unit}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">L {m.totalCost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
