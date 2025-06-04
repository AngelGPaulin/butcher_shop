// components/ReportesAdminClient.tsx
"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/constants";
import { authHeaders } from "@/helpers/authHeaders";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import weekday from "dayjs/plugin/weekday";
import { useRouter } from "next/navigation";
import "./reports.css"; // Asegúrate de que tu archivo CSS esté en la misma ruta

// Configura dayjs para que el inicio de la semana sea el lunes (opcional, pero común en muchos lugares)
dayjs.extend(weekday);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  weekStart: 1, // 0 para domingo, 1 para lunes
});

// Función para obtener la fecha local formateada para los inputs de tipo date
// MODIFICADO: Ahora el valor por defecto de endDate será un día después del día actual
const getInitialDates = () => {
  const today = dayjs();
  const tomorrow = today.add(1, "day"); // Un día después
  return {
    startDate: today.format("YYYY-MM-DD"),
    endDate: tomorrow.format("YYYY-MM-DD"), // endDate por defecto será el día siguiente
  };
};

// Interfaz para los datos de sucursales
type Location = { id: string; nombre: string };
// Interfaz para los datos de empleados
type Employee = { id: string; nombre: string; apellido: string };

// Interfaz para las filas del reporte, DEBE COINCIDIR con la estructura que ahora devuelve tu backend
type ReportRow = {
  fecha: { _seconds: number; _nanoseconds: number } | string; // Firebase Timestamp o string de fecha
  location?: { nombre: string }; // Ahora esperamos un objeto con el nombre de la sucursal
  employee?: { nombre: string; apellido: string }; // Ahora esperamos un objeto con nombre y apellido del empleado
  total_ventas: number;
  total_kg: number;
  total_items: number;
};

export default function ReportesAdminClient() {
  const router = useRouter();
  const handleRedirect = (path: string) => router.push(path);

  // Inicializa los estados con las fechas calculadas
  const { startDate: initialStartDate, endDate: initialEndDate } =
    getInitialDates();
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate); // El día de fin se inicializa un día después

  const [locationId, setLocationId] = useState("");
  const [userId, setUserId] = useState("");

  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Nuevo estado para la carga inicial

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = await authHeaders();
        const [locRes, empRes] = await Promise.all([
          fetch(`${API_URL}/locations`, { headers }),
          fetch(`${API_URL}/auth`, { headers }),
        ]);

        if (!locRes.ok)
          throw new Error(`HTTP error! status: ${locRes.status} for locations`);
        if (!empRes.ok)
          throw new Error(`HTTP error! status: ${empRes.status} for employees`);

        const locData = await locRes.json();
        const empData = await empRes.json();

        setLocations(locData);
        setEmployees(empData);

        // Una vez que se cargan ubicaciones y empleados, busca los reportes iniciales
        // Esto asegura que la tabla no esté vacía al principio
        await buscarReportes(initialStartDate, initialEndDate, "", ""); // Pasa los valores iniciales para la primera carga
      } catch (error) {
        console.error(
          "❌ Error al cargar ubicaciones, empleados o reportes iniciales:",
          error
        );
        // Podrías manejar un estado de error para el usuario aquí
      } finally {
        setIsInitialLoading(false); // Desactiva la pantalla de carga inicial una vez que todo esté cargado
      }
    };
    fetchData();
  }, []); // El array de dependencias está vacío, se ejecuta solo al montar

  // Modifica buscarReportes para aceptar parámetros opcionales para la carga inicial
  const buscarReportes = async (
    startDt: string = startDate, // Usa el estado por defecto, o el valor pasado
    endDt: string = endDate, // Usa el estado por defecto, o el valor pasado
    locId: string = locationId, // Usa el estado por defecto, o el valor pasado
    usrId: string = userId // Usa el estado por defecto, o el valor pasado
  ) => {
    setLoading(true);
    setReportData([]); // Limpiar datos anteriores al buscar
    try {
      const headers = await authHeaders();
      const params = new URLSearchParams({
        startDate: startDt,
        endDate: endDt,
      });
      if (locId) params.append("locationId", locId);
      if (usrId) params.append("userId", usrId);

      const res = await fetch(`${API_URL}/sales/history?${params}`, {
        headers,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Error del backend al buscar reportes:", errorText);
        setReportData([]);
        return;
      }

      const data: ReportRow[] = await res.json();

      if (!Array.isArray(data)) {
        console.error(
          "❌ Datos inválidos del backend: Se esperaba un array.",
          data
        );
        setReportData([]);
      } else if (
        data.length > 0 &&
        !("fecha" in data[0] && "total_ventas" in data[0])
      ) {
        console.warn(
          "⚠️ Los datos recibidos del backend no tienen la estructura esperada para ReportRow."
        );
        setReportData(data);
      } else {
        setReportData(data);
      }
    } catch (err) {
      console.error("❌ Error buscando reportes:", err);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

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
        const errorText = await res.text();
        console.error("❌ Error al exportar:", errorText);
        alert(`Error al exportar: ${res.status} ${errorText}`);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = tipo === "excel" ? "reporte.xlsx" : "reporte.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Error exportando:", err);
      alert("Hubo un error al intentar exportar el reporte.");
    }
  };

  const setRango = (tipo: "hoy" | "semana" | "mes" | "año") => {
    const hoy = dayjs();
    let calculatedStartDate = "";
    let calculatedEndDate = "";

    switch (tipo) {
      case "hoy":
        calculatedStartDate = hoy.format("YYYY-MM-DD");
        calculatedEndDate = hoy.add(1, "day").format("YYYY-MM-DD");
        break;
      case "semana":
        calculatedStartDate = hoy.startOf("week").format("YYYY-MM-DD");
        calculatedEndDate = hoy
          .endOf("week")
          .add(1, "day")
          .format("YYYY-MM-DD");
        break;
      case "mes":
        calculatedStartDate = hoy.startOf("month").format("YYYY-MM-DD");
        calculatedEndDate = hoy
          .endOf("month")
          .add(1, "day")
          .format("YYYY-MM-DD");
        break;
      case "año":
        calculatedStartDate = hoy.startOf("year").format("YYYY-MM-DD");
        calculatedEndDate = hoy
          .endOf("year")
          .add(1, "day")
          .format("YYYY-MM-DD");
        break;
      default:
        calculatedStartDate = hoy.format("YYYY-MM-DD");
        calculatedEndDate = hoy.add(1, "day").format("YYYY-MM-DD");
        break;
    }
    setStartDate(calculatedStartDate);
    setEndDate(calculatedEndDate);
  };

  return (
    <>
      {isInitialLoading && ( // Renderiza el overlay si está cargando inicialmente
        <div className="loading-overlay">
          <img src="/logo.png" alt="Logo" className="loading-logo" />
          <div className="spinner" />
          <p className="loading-text">Cargando reportes...</p>
        </div>
      )}

      {/* El contenido principal solo se renderiza si no está en carga inicial */}
      {!isInitialLoading && (
        <div className="report-container">
          <div className="report-header">
            <div className="genReport-logo-box">
              <img src="/logo.png" alt="Logo" className="genReport-logo" />
            </div>
            <h1>Reportes de Ventas</h1>
          </div>

          <div className="report-range-buttons">
            <button
              className="report-range-button"
              onClick={() => setRango("hoy")}
            >
              Hoy
            </button>
            <button
              className="report-range-button"
              onClick={() => setRango("semana")}
            >
              Esta Semana
            </button>
            <button
              className="report-range-button"
              onClick={() => setRango("mes")}
            >
              Este Mes
            </button>
            <button
              className="report-range-button"
              onClick={() => setRango("año")}
            >
              Este Año
            </button>
          </div>

          <div className="report-controls">
            <div className="report-control-group">
              <label htmlFor="startDate">Fecha inicio:</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="report-control-group">
              <label htmlFor="endDate">Fecha fin:</label>
              <input
                id="endDate"
                type="date"
                value={dayjs(endDate).subtract(1, "day").format("YYYY-MM-DD")}
                onChange={(e) =>
                  setEndDate(
                    dayjs(e.target.value).add(1, "day").format("YYYY-MM-DD")
                  )
                }
              />
            </div>
            <div className="report-control-group">
              <label htmlFor="locationSelect">Sucursal:</label>
              <select
                id="locationSelect"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                <option value="">Todas</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="report-control-group">
              <label htmlFor="employeeSelect">Empleado:</label>
              <select
                id="employeeSelect"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                <option value="">Todos</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre} {emp.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div className="report-button-group">
              <button
                className="report-button report-button-primary"
                onClick={() => buscarReportes()} // Llama sin parámetros para usar los estados actuales
                disabled={loading}
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
              <button
                className="report-button report-button-export"
                onClick={() => exportar("excel")}
                disabled={reportData.length === 0}
              >
                Exportar Excel
              </button>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => handleRedirect("/admin")}
              >
                Cancelar
              </button>
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            {loading ? (
              <p className="report-message">Cargando...</p>
            ) : reportData.length === 0 ? (
              <p className="report-message">
                No hay datos para los filtros seleccionados.
              </p>
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
                      <td>
                        {typeof row.fecha === "object" &&
                        "_seconds" in row.fecha
                          ? new Date(
                              row.fecha._seconds * 1000
                            ).toLocaleDateString()
                          : typeof row.fecha === "string"
                          ? new Date(row.fecha).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>{row.location?.nombre || "-"}</td>
                      <td>
                        {row.employee
                          ? `${row.employee.nombre || ""} ${
                              row.employee.apellido || ""
                            }`.trim() || "-"
                          : "-"}
                      </td>
                      <td>
                        {row.total_ventas !== undefined
                          ? row.total_ventas.toFixed(2)
                          : "-"}
                      </td>
                      <td>
                        {row.total_kg !== undefined
                          ? row.total_kg.toFixed(2)
                          : "-"}
                      </td>
                      <td>
                        {row.total_items !== undefined ? row.total_items : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  );
}
