// Utilidad segura para formatear horas
function formatTime(date: Date | string | undefined | null) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}


import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, TrendingUp } from "lucide-react";

export default function OwnerDashboard() {
  // Simulación de datos de métricas
  const metrics = {
    today: 8,
    monthly: 120,
    monthlyGrowth: 12.5,
    monthlyRevenue: 35000,
    projectedMonthlyRevenue: 40000,
    completionRate: 87.2,
    statusCounts: { completed: 105 },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Dashboard General</h1>
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnos Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.today}</div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.monthly}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.monthlyGrowth > 0 ? "+" : ""}
              {metrics.monthlyGrowth.toFixed(1)}% vs mes anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Estimados</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.monthlyRevenue}</div>
            <p className="text-xs text-muted-foreground">Proyección: ${metrics.projectedMonthlyRevenue.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Completado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.statusCounts.completed || 0} de {metrics.monthly} turnos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
