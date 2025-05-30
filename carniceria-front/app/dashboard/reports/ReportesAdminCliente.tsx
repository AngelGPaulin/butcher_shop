"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/constants";
import { authHeaders } from "@/helpers/authHeaders";
import dayjs from "dayjs";
import "./reports.css";

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
  type Location = { locationId: string; nombre: string };
  type Employee = { userId: string; nombre: string; apellido: string };
  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  type ReportRow = {
    fecha: string;
    location?: { nombre: string };
    employee?: { nombre: string; apellido: string };
    total_ventas: number;
    total_kg: number;
    total_items: number;
  };
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const headers = await authHeaders();
      const [locRes, empRes] = await Promise.all([
        fetch(`${API_URL}/locations`, { headers }),
        fetch(`${API_URL}/auth`, { headers }),
      ]);
      const locData = await locRes.json();
      const empData = await empRes.json();
      setLocations(locData);
      setEmployees(empData);
    };
    fetchData();
  }, []);

  const buscarReportes = async () => {
    setLoading(true);
    const headers = await authHeaders();
    const params = new URLSearchParams({ startDate, endDate });
    if (locationId) params.append("locationId", locationId);
    if (userId) params.append("userId", userId);
    const res = await fetch(`${API_URL}/sales-history?${params}`, { headers });
    const data = await res.json();
    setReportData(data);
    setLoading(false);
  };

  const exportar = async (tipo: "excel" | "pdf") => {
    const headers = await authHeaders();
    const params = new URLSearchParams({ startDate, endDate, export: tipo });
    if (locationId) params.append("locationId", locationId);
    if (userId) params.append("userId", userId);
    const res = await fetch(`${API_URL}/sales-history?${params}`, { headers });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = tipo === "excel" ? "reporte.xlsx" : "reporte.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
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
  <div className="report-container">
    <div className="report-header">
      <div className="genReport-logo-box">
        <img src="/logo.png" alt="Logo" className="genReport-logo" />
      </div>
      <h1>Reportes de Ventas</h1>
    </div>

    <div className="report-range-buttons">
      <button className="report-range-button" onClick={() => setRango("hoy")}>Hoy</button>
      <button className="report-range-button" onClick={() => setRango("semana")}>Esta Semana</button>
      <button className="report-range-button" onClick={() => setRango("mes")}>Este Mes</button>
      <button className="report-range-button" onClick={() => setRango("año")}>Este Año</button>
    </div>

    <div className="report-controls">
      <div className="report-control-group">
        <label>Fecha inicio:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="report-control-group">
        <label>Fecha fin:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="report-control-group">
        <label>Sucursal:</label>
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
      </div>

      <div className="report-control-group">
        <label>Empleado:</label>
        <select value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">Todos</option>
          {employees.map((emp) => (
            <option key={emp.userId} value={emp.userId}>
              {emp.nombre} {emp.apellido}
            </option>
          ))}
        </select>
      </div>

      <div className="report-button-group">
        <button className="report-button report-button-primary" onClick={buscarReportes}>
          Buscar
        </button>
        <button className="report-button report-button-export" onClick={() => exportar("excel")}>
          Exportar Excel
        </button>
        <button className="report-button report-button-export" onClick={() => exportar("pdf")}>
          Exportar PDF
        </button>
      </div>
    </div>

    <div style={{ marginTop: "1rem" }}>
      {loading ? (
        <p className="report-message">Cargando...</p>
      ) : reportData.length === 0 ? (
        <p className="report-message">No hay datos para los filtros seleccionados.</p>
      ) : (
        <table className="report-table">
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
