"use client";

import { useState } from "react";
import { Button, DatePicker, Select, TimePicker } from "antd";
import type { Dayjs } from "dayjs";


interface Sucursal {
  id: number;
  nombre: string;
}

const ReporteCarniceria = () => {
  const sucursales: Sucursal[] = [
    { id: 1, nombre: "Suc. 1 - Av. Principal" },
    { id: 2, nombre: "Suc. 2 - Centro Comercial" },
    { id: 3, nombre: "Suc. 3 - Zona Industrial" },
  ];

  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<number>();
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(null);
  const [horaDesde, setHoraDesde] = useState<Dayjs | null>(null);
  const [horaHasta, setHoraHasta] = useState<Dayjs | null>(null);

  const generarReporte = () => {
    console.log({
      sucursal: sucursalSeleccionada,
      fechaDesde: fechaDesde?.format("YYYY-MM-DD"),
      fechaHasta: fechaHasta?.format("YYYY-MM-DD"),
      horaDesde: horaDesde?.format("HH:mm"),
      horaHasta: horaHasta?.format("HH:mm"),
    });
    alert("Generando reporte PDF...");
  };

  const cancelar = () => {
    setSucursalSeleccionada(undefined);
    setFechaDesde(null);
    setFechaHasta(null);
    setHoraDesde(null);
    setHoraHasta(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-10 px-4 sm:px-6 lg:px-8">
      {/* Contenedor de contenido limitado como el ejemplo */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-10">
        <div className="mb-10 flex justify-center">
          <img 
            src="/logo.png" 
            alt="Logo Carnicería" 
            className="w-64 h-64 object-contain"
          />
        </div>

        <div className="w-full mb-8">
          <label className="block text-gray-800 text-lg mb-2 font-semibold">Sucursal:</label>
          <Select
            className="w-full text-base"
            placeholder="Seleccione una sucursal"
            options={sucursales.map(s => ({
              value: s.id,
              label: s.nombre,
            }))}
            value={sucursalSeleccionada}
            onChange={setSucursalSeleccionada}
          />
        </div>

        <div className="w-full mb-8">
          <label className="block text-gray-800 text-lg mb-2 font-semibold">Fecha:</label>
          <div className="grid grid-cols-2 gap-8">
            <DatePicker
              className="w-full"
              placeholder="Desde"
              value={fechaDesde}
              onChange={setFechaDesde}
            />
            <DatePicker
              className="w-full"
              placeholder="Hasta"
              value={fechaHasta}
              onChange={setFechaHasta}
              disabledDate={(current) => 
                current && fechaDesde && current < fechaDesde.startOf('day')
              }
            />
          </div>
        </div>

        <div className="w-full mb-10">
          <label className="block text-gray-800 text-lg mb-2 font-semibold">Hora:</label>
          <div className="grid grid-cols-2 gap-8">
            <TimePicker
              className="w-full"
              placeholder="Desde"
              format="HH:mm"
              value={horaDesde}
              onChange={setHoraDesde}
            />
            <TimePicker
              className="w-full"
              placeholder="Hasta"
              format="HH:mm"
              value={horaHasta}
              onChange={setHoraHasta}
              disabledTime={(current) => {
                if (!horaDesde) return {};
                return {
                  disabledHours: () => 
                    current && current.hour() < horaDesde.hour() 
                      ? Array.from({ length: 24 }, (_, i) => i)
                          .filter(h => h < horaDesde.hour())
                      : [],
                  disabledMinutes: (selectedHour) => {
                    if (!horaDesde || selectedHour !== horaDesde.hour()) 
                      return [];
                    return Array.from({ length: 60 }, (_, i) => i)
                      .filter(m => m < horaDesde.minute());
                  },
                };
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-6">
          <Button href="/admin" passHref type="primary" danger onClick={cancelar} className="h-11 text-base px-6">
            Cancelar
          </Button>

          <Button 
            type="primary" 
            onClick={generarReporte}
            disabled={!sucursalSeleccionada || !fechaDesde || !fechaHasta}
            className="h-11 text-base px-6 bg-blue-600 hover:bg-blue-700"
          >
            Generar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReporteCarniceria;
