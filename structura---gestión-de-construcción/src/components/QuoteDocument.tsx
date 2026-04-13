import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, Download, ArrowLeft, Calculator } from 'lucide-react';
import { Project, Structure, ConsolidatedMaterial } from "@/src/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function QuoteDocument({ 
  project, 
  structures, 
  onBack 
}: { 
  project: Project, 
  structures: Structure[], 
  onBack: () => void 
}) {
  const consolidatedMaterials = (() => {
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
  })();

  const totalCost = consolidatedMaterials.reduce((acc, m) => acc + m.totalCost, 0);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text('STRUCTURA', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Soluciones de Ingeniería', 14, 26);
    
    doc.setDrawColor(200);
    doc.line(14, 30, pageWidth - 14, 30);
    
    // Quote Info
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('PRESUPUESTO DE OBRA', 14, 45);
    
    doc.setFontSize(10);
    doc.text(`Cliente: ${project.client}`, 14, 55);
    doc.text(`Proyecto: ${project.name}`, 14, 60);
    doc.text(`ID: ${project.id.slice(0, 8).toUpperCase()}`, 14, 65);
    doc.text(`Fecha: ${format(project.createdAt, 'dd/MM/yyyy')}`, pageWidth - 14, 45, { align: 'right' });

    // Table
    const tableData = project.structures.map(ps => {
      const s = structures.find(st => st.id === ps.structureId);
      const unitCost = s?.materials.reduce((acc, m) => acc + (m.cost || 0) * m.quantity, 0) || 0;
      return [
        s?.name || 'N/A',
        ps.quantity.toString(),
        `L ${unitCost.toLocaleString()}`,
        `L ${(unitCost * ps.quantity).toLocaleString()}`
      ];
    });

    autoTable(doc, {
      startY: 75,
      head: [['Descripción de Estructura', 'Cantidad', 'Costo Unitario', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 75;

    // Materials Summary
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

    const finalY2 = (doc as any).lastAutoTable.finalY || finalY + 20;

    // Totals
    doc.setFontSize(10);
    doc.text(`Subtotal: L ${(totalCost * 0.85).toLocaleString()}`, pageWidth - 14, finalY2 + 15, { align: 'right' });
    doc.text(`ISV (15%): L ${(totalCost * 0.15).toLocaleString()}`, pageWidth - 14, finalY2 + 20, { align: 'right' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL GENERAL: L ${totalCost.toLocaleString()}`, pageWidth - 14, finalY2 + 30, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text('Este documento es un presupuesto estimado.', pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
    doc.text('Vigencia de 15 días.', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });

    doc.save(`Presupuesto_${project.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
          <Button onClick={handleExportPDF} className="bg-primary gap-2">
            <Download className="w-4 h-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl print:shadow-none print:border bg-white">
        <CardContent className="p-8 md:p-12 space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between gap-8 border-b pb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Calculator className="text-primary-foreground w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter text-primary">STRUCTURA</h1>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Soluciones de Ingeniería</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Tegucigalpa, Honduras</p>
                <p>info@structura.hn | +504 2222-0000</p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <h2 className="text-4xl font-black text-muted/20 uppercase tracking-tighter">Presupuesto</h2>
              <div className="space-y-1">
                <p className="text-sm font-bold uppercase text-muted-foreground">Fecha de Emisión</p>
                <p className="text-lg font-bold">{format(project.createdAt, 'dd MMMM, yyyy', { locale: es })}</p>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b pb-2">Información del Cliente</h3>
              <div className="space-y-1">
                <p className="text-xl font-bold">{project.client}</p>
                <p className="text-muted-foreground">Cliente Corporativo</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b pb-2">Detalles del Proyecto</h3>
              <div className="space-y-1">
                <p className="text-xl font-bold">{project.name}</p>
                <p className="text-muted-foreground">ID: {project.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Structures Table */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Desglose de Estructuras</h3>
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20 bg-primary/5">
                  <TableHead className="font-bold text-primary">Descripción de Estructura</TableHead>
                  <TableHead className="font-bold text-primary text-center">Cantidad</TableHead>
                  <TableHead className="font-bold text-primary text-right">Costo Unitario</TableHead>
                  <TableHead className="font-bold text-primary text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.structures.map((ps, i) => {
                  const s = structures.find(st => st.id === ps.structureId);
                  const unitCost = s?.materials.reduce((acc, m) => acc + (m.cost || 0) * m.quantity, 0) || 0;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-semibold">{s?.name || 'Estructura no encontrada'}</TableCell>
                      <TableCell className="text-center font-bold">{ps.quantity}</TableCell>
                      <TableCell className="text-right">L {unitCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold">L {(unitCost * ps.quantity).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Materials Summary */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Consolidado de Materiales Totales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consolidatedMaterials.map((m, i) => (
                <div key={i} className="p-4 rounded-xl border bg-muted/10 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">{m.name}</p>
                    <p className="text-lg font-black text-primary">{m.totalQuantity.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{m.unit}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Costo Est.</p>
                    <p className="text-sm font-bold">L {m.totalCost.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-10 border-t-4 border-primary">
            <div className="w-full md:w-64 space-y-4">
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="font-bold uppercase text-xs tracking-widest">Subtotal</span>
                <span className="font-bold">L {(totalCost * 0.85).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="font-bold uppercase text-xs tracking-widest">ISV (15%)</span>
                <span className="font-bold">L {(totalCost * 0.15).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-black uppercase text-sm tracking-widest text-primary">Total General</span>
                <span className="text-3xl font-black text-primary">L {totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-20 text-center space-y-4">
            <div className="flex justify-center gap-20">
              <div className="w-48 border-t pt-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Firma Autorizada</p>
              </div>
              <div className="w-48 border-t pt-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Aceptado por Cliente</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground pt-10">
              Este documento es un presupuesto estimado basado en los precios de materiales proporcionados. 
              Vigencia de 15 días a partir de la fecha de emisión.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
