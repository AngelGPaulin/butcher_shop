"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/constants";
import { authHeaders } from "@/helpers/authHeaders";
import dayjs from "dayjs";

const getLocalDate = () => {
  const localDate = new Date();
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().split("T")[0];
};

export default function ReportesAdminClient() {
  const [startDate, setStartDate] = useState(getLocalDate);
  const [endDate, setEndDate] = useState(getLocalDate);
  const [locationId, setLocationId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  type Location = { locationId: string; nombre: string };
  type Employee = { userId: string; nombre: string; apellido: string };
  type ReportRow = {
    fecha: string;
    location?: { nombre: string };
    employee?: { nombre: string; apellido: string };
    total_ventas: number;
    total_kg: number;
    total_items: number;
  };

  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reportData, setReportData] = useState<ReportRow[]>([]);

  // Carga inicial de sucursales y empleados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = await authHeaders();
        const [locRes, empRes] = await Promise.all([
          fetch(`${API_URL}/locations`, { headers }),
          fetch(`${API_URL}/auth`, { headers }),
        ]);
        const locData = await locRes.json();
        const empData = await empRes.json();
        setLocations(locData);
        setEmployees(empData);
      } catch (err) {
        console.error("❌ Error cargando datos iniciales:", err);
      }
    };
    fetchData();
  }, []);

  // Buscar reportes con filtros
  const buscarReportes = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const headers = await authHeaders();
      const params = new URLSearchParams({ startDate, endDate });
      if (locationId) params.append("locationId", locationId);
      if (userId) params.append("userId", userId);

      const res = await fetch(`${API_URL}/sales/history?${params}`, {
        headers,
      });

      const text = await res.text();

      try {
        const data = JSON.parse(text);
        if (!Array.isArray(data)) {
          console.error("❌ Respuesta no válida:", data);
          setReportData([]);
        } else {
          setReportData(data);
        }
      } catch (parseErr) {
        console.error("❌ Error parseando JSON:", text);
        setReportData([]);
      }
    } catch (err) {
      console.error("❌ Error buscando reportes:", err);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // Exportar Excel o PDF
  const exportar = async (tipo: "excel" | "pdf") => {
    try {
      const headers = await authHeaders();
      const params = new URLSearchParams({
        startDate,
        endDate,
        export: tipo,
      });
      if (locationId) params.append("locationId", locationId);
      if (userId) params.append("userId", userId);

      const res = await fetch(`${API_URL}/sales/history?${params}`, {
        headers,
      });

      if (!res.ok) {
        console.error("❌ Error al exportar:", await res.text());
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = tipo === "excel" ? "reporte.xlsx" : "reporte.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Error exportando:", err);
    }
  };

  const setRango = (tipo: "hoy" | "semana" | "mes" | "año") => {
    const hoy = dayjs();
    switch (tipo) {
      case "hoy":
        setStartDate(hoy.format("YYYY-MM-DD"));
        setEndDate(hoy.format("YYYY-MM-DD"));
        break;
      case "semana":
        setStartDate(hoy.startOf("week").format("YYYY-MM-DD"));
        setEndDate(hoy.endOf("week").format("YYYY-MM-DD"));
        break;
      case "mes":
        setStartDate(hoy.startOf("month").format("YYYY-MM-DD"));
        setEndDate(hoy.endOf("month").format("YYYY-MM-DD"));
        break;
      case "año":
        setStartDate(hoy.startOf("year").format("YYYY-MM-DD"));
        setEndDate(hoy.endOf("year").format("YYYY-MM-DD"));
        break;
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Reportes de Ventas</h1>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => setRango("hoy")}>Hoy</button>
        <button onClick={() => setRango("semana")}>Esta Semana</button>
        <button onClick={() => setRango("mes")}>Este Mes</button>
        <button onClick={() => setRango("año")}>Este Año</button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          maxWidth: 400,
        }}
      >
        <label>
          Fecha inicio:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Fecha fin:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label>
          Sucursal:
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="">Todas</option>
            {locations.map((loc) => (
              <option key={loc.locationId} value={loc.locationId}>
                {loc.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Empleado:
          <select value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">Todos</option>
            {employees.map((emp) => (
              <option key={emp.userId} value={emp.userId}>
                {emp.nombre} {emp.apellido}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button disabled={loading} onClick={buscarReportes}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
          <button onClick={() => exportar("excel")}>Exportar Excel</button>
          <button onClick={() => exportar("pdf")}>Exportar PDF</button>
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        {loading ? (
          <p>Cargando...</p>
        ) : reportData.length === 0 ? (
          <p>No hay datos para los filtros seleccionados.</p>
        ) : (
          <table
            border={1}
            cellPadding={5}
            style={{ marginTop: "1rem", width: "100%" }}
          >
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Sucursal</th>
                <th>Empleado</th>
                <th>Total Ventas ($)</th>
                <th>Total Kg</th>
                <th>Total Items</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.fecha}</td>
                  <td>{row.location?.nombre || "-"}</td>
                  <td>
                    {row.employee
                      ? `${row.employee.nombre} ${row.employee.apellido}`
                      : "-"}
                  </td>
                  <td>{row.total_ventas}</td>
                  <td>{row.total_kg}</td>
                  <td>{row.total_items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
