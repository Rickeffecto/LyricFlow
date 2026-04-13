import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Package, Building2, Calculator, Plus, ArrowUpRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

const data = [
  { name: 'Ene', cost: 4000 },
  { name: 'Feb', cost: 3000 },
  { name: 'Mar', cost: 2000 },
  { name: 'Abr', cost: 2780 },
  { name: 'May', cost: 1890 },
  { name: 'Jun', cost: 2390 },
];

export function Dashboard({ onAction }: { onAction: (action: string) => void }) {
  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Panel de Control</h2>
          <p className="text-muted-foreground">Bienvenido de nuevo. Aquí tienes un resumen de tus proyectos.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => onAction('create-structure')} className="bg-primary hover:opacity-90 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Nueva Estructura
          </Button>
          <Button onClick={() => onAction('calculator')} variant="outline" className="border-primary text-primary hover:bg-primary/5">
            <Calculator className="w-4 h-4 mr-2" /> Nueva Cotización
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Proyectos Activos', value: '12', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Estructuras', value: '48', icon: Package, color: 'text-accent-foreground', bg: 'bg-accent/10' },
          { title: 'Costo Total', value: 'L 125,400', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Cotizaciones', value: '85', icon: Calculator, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={stat.bg + " p-3 rounded-xl"}>
                    <stat.icon className={stat.color + " w-6 h-6"} />
                  </div>
                  <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> 12%
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Inversión por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(value) => `L ${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 5 ? 'oklch(0.75 0.15 150)' : 'oklch(0.25 0.05 250)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Proyectos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Residencial Los Pinos', client: 'Inversiones H', status: 'Activo', cost: 'L 45,000' },
                { name: 'Edificio Central', client: 'Constructora X', status: 'Activo', cost: 'L 120,000' },
                { name: 'Bodega Norte', client: 'Logística S.A.', status: 'Completado', cost: 'L 12,500' },
              ].map((project, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold">
                      {project.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{project.cost}</p>
                    <p className="text-[10px] uppercase font-bold text-accent-foreground">{project.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-primary font-semibold">Ver todos los proyectos</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
