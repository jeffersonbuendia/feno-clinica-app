import React, { useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "24px",
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: "#0f172a",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #dbe3ee",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
  },
  title: { fontSize: "28px", fontWeight: 700, margin: 0 },
  subtitle: { fontSize: "14px", color: "#475569", marginTop: "8px" },
  badge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    borderRadius: "14px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "20px",
  },
  leftColumn: { display: "flex", flexDirection: "column", gap: "20px" },
  rightColumn: { display: "flex", flexDirection: "column", gap: "20px" },
  sectionTitle: { fontSize: "20px", fontWeight: 700, margin: "0 0 16px 0" },
  smallTitle: { fontSize: "18px", fontWeight: 700, margin: "0 0 16px 0" },
  fieldGrid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  fieldGrid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "14px",
  },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "14px", fontWeight: 600, color: "#334155" },
  input: {
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "11px 12px",
    fontSize: "15px",
    width: "100%",
    boxSizing: "border-box",
    background: "#fff",
  },
  select: {
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "11px 12px",
    fontSize: "15px",
    width: "100%",
    boxSizing: "border-box",
    background: "#fff",
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },
  scenarioGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  scenarioCard: {
    border: "1px solid #dbe3ee",
    borderRadius: "18px",
    padding: "16px",
    background: "#fff",
  },
  scenarioInfo: {
    marginTop: "14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "12px",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  infoBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "14px",
    fontSize: "14px",
    lineHeight: 1.55,
  },
  reportBox: {
    minHeight: "520px",
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    padding: "16px",
    fontFamily: '"Courier New", monospace',
    fontSize: "13px",
    lineHeight: 1.45,
    whiteSpace: "pre-wrap",
    background: "#fff",
    overflow: "auto",
  },
  buttonRow: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" },
  btnPrimary: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "11px 14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnSecondary: {
    background: "#fff",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "11px 14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  reportPaper: {
    background: "#ffffff",
    border: "1px solid #dbe3ee",
    borderRadius: "18px",
    padding: "24px",
  },
  reportHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "14px",
    marginBottom: "18px",
  },
  reportTitle: { fontSize: "24px", fontWeight: 700, margin: 0 },
  reportMeta: { fontSize: "14px", lineHeight: 1.6, color: "#334155" },
  reportSection: { marginTop: "18px" },
  reportSectionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: "10px",
    paddingBottom: "6px",
    borderBottom: "1px solid #e2e8f0",
  },
  resultList: { margin: 0, paddingLeft: "20px", lineHeight: 1.65, fontSize: "14px" },
  para: { fontSize: "14px", lineHeight: 1.65, margin: 0 },
  footer: { marginTop: "28px", fontSize: "14px", lineHeight: 1.6 },
};

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  );
}

function printSafeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}

export default function App() {
  const reportCardRef = useRef(null);

  const [patient, setPatient] = useState({
    nombre: "",
    edad: "",
    fecha: new Date().toISOString().slice(0, 10),
    sexo: "",
    atopia: true,
    rinitis: true,
    usaICS: true,
    icsDose: 200,
    firma: "Jefferson Antonio Buendía",
    registro: "13715940",
    titulo: "Médico Neumólogo Pediatra",
  });

  const [scenarios, setScenarios] = useState([
    { fev1Pre: "", fev1Post: "", eos: "" },
    { fev1Pre: "", fev1Post: "", eos: "" },
    { fev1Pre: "", fev1Post: "", eos: "" },
  ]);

  const [modelType, setModelType] = useState("auto");

  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const isChild = useMemo(() => {
    const age = toNum(patient.edad);
    return age !== null ? age < 12 : true;
  }, [patient.edad]);

  const thresholds = useMemo(
    () => (isChild ? { low: 20, high: 35, label: "Niños (<12 años)" } : { low: 25, high: 50, label: "Adultos / ≥12 años" }),
    [isChild]
  );

  function classifyFeno(value) {
    if (value == null) return { label: "No calculable", summary: "Información insuficiente" };
    if (value < thresholds.low) return { label: "Bajo", summary: "Baja probabilidad de inflamación eosinofílica significativa" };
    if (value > thresholds.high) return { label: "Alto", summary: "Alta probabilidad de inflamación tipo 2 / eosinofílica" };
    return { label: "Intermedio", summary: "Interpretar con el contexto clínico y funcional" };
  }

  function calculateScenario(s) {
    const fev1Pre = toNum(s.fev1Pre);
    const fev1Post = toNum(s.fev1Post);
    const eos = toNum(s.eos);
    const atopia = patient.atopia ? 1 : 0;
    const rinitis = patient.rinitis ? 1 : 0;
    const icsDose = patient.usaICS ? toNum(patient.icsDose) || 0 : 0;
    const S = icsDose / 200;

    if (fev1Pre === null || fev1Post === null || fev1Pre <= 0) {
      return { valid: false };
    }

    const bdr = ((fev1Post - fev1Pre) / fev1Pre) * 100;
    const F = fev1Pre / 10;

    const logFenoA = 2.10 + 0.06 * bdr - 0.05 * F + 0.25 * atopia + 0.15 * rinitis - 0.22 * S;
    const fenoA = Math.exp(logFenoA);

    let fenoB = null;
    if (eos !== null && eos >= 0) {
      const E = eos / 100;
      const logFenoB = 1.95 + 0.05 * bdr - 0.04 * F + 0.22 * atopia + 0.12 * rinitis - 0.20 * S + 0.11 * E;
      fenoB = Math.exp(logFenoB);
    }

    let selected = fenoA;
    let selectedModel = "Modelo clínico básico";
    if (modelType === "eos" && fenoB !== null) {
      selected = fenoB;
      selectedModel = "Modelo con eosinófilos";
    } else if (modelType === "auto" && fenoB !== null) {
      selected = fenoB;
      selectedModel = "Modelo con eosinófilos";
    }

    return {
      valid: true,
      bdr,
      fenoA,
      fenoB,
      selected,
      selectedModel,
      classSelected: classifyFeno(selected),
    };
  }

  const results = useMemo(() => scenarios.map(calculateScenario), [scenarios, patient, modelType, thresholds]);

  const longitudinal = useMemo(() => {
    const vals = results.map((r) => (r.valid ? r.selected : null)).filter((v) => v != null);
    if (vals.length < 2) return null;
    const first = vals[0];
    const last = vals[vals.length - 1];
    return { first, last, pct: ((last - first) / first) * 100 };
  }, [results]);

  function interpText(value) {
    if (value == null) return "No fue posible estimar el valor por información incompleta.";
    const cls = classifyFeno(value);
    if (cls.label === "Bajo") {
      return "Los valores se ubican en rango bajo, compatible con baja probabilidad de inflamación eosinofílica significativa de la vía aérea en el momento de la evaluación.";
    }
    if (cls.label === "Alto") {
      return "Los valores se ubican en rango alto, compatible con mayor probabilidad de inflamación tipo 2/eosinofílica; estos hallazgos deben correlacionarse con síntomas, función pulmonar y respuesta terapéutica.";
    }
    return "Los valores se ubican en rango intermedio, por lo que su interpretación requiere correlación con síntomas, función pulmonar, comorbilidades alérgicas y evolución clínica.";
  }

  const chartData = useMemo(
    () =>
      results.map((r, i) => ({
        name: `Prueba ${i + 1}`,
        FeNO: r.valid ? Number(r.selected.toFixed(1)) : null,
      })),
    [results]
  );

  function makeReportText() {
    const lines = [];
    lines.push("EVALUACIÓN DE INFLAMACIÓN DE LA VÍA AÉREA (FeNO)");
    lines.push("");
    lines.push(`Nombre del paciente: ${patient.nombre || "________________"}`);
    lines.push(`Edad: ${patient.edad || "__"} años`);
    lines.push(`Fecha: ${patient.fecha}`);
    lines.push("");
    lines.push("RESULTADOS");
    results.forEach((r, i) => {
      if (!r.valid) {
        lines.push(`- Prueba ${i + 1}: no calculable por información incompleta.`);
      } else {
        lines.push(`- Prueba ${i + 1}: ${r.selected.toFixed(1)} ppb (${r.classSelected.label}). ${r.classSelected.summary}.`);
      }
    });
    lines.push("");
    lines.push("CURVA DE VALORES (ppb)");
    lines.push(results.map((r, i) => (r.valid ? `Prueba ${i + 1}: ${r.selected.toFixed(1)}` : `Prueba ${i + 1}: NA`)).join(" | "));
    lines.push("");
    lines.push("INTERPRETACIÓN CLÍNICA");
    const valid = results.filter((r) => r.valid);
    if (valid.length) {
      const avg = valid.reduce((a, b) => a + b.selected, 0) / valid.length;
      lines.push(interpText(avg));
      lines.push("La interpretación del óxido nítrico exhalado debe integrarse con los síntomas, la función pulmonar, la presencia de atopia o rinitis y la evolución clínica.");
    } else {
      lines.push("No fue posible generar una interpretación por falta de datos suficientes.");
    }
    if (longitudinal) {
      lines.push("");
      lines.push("INTERPRETACIÓN LONGITUDINAL");
      lines.push(`Cambio entre primera y última prueba: ${longitudinal.pct.toFixed(1)}%.`);
      lines.push(Math.abs(longitudinal.pct) >= 60 ? "La magnitud del cambio amerita correlación clínica estrecha en el seguimiento." : "No se observa un cambio relativo de gran magnitud entre las pruebas comparadas.");
    }
    lines.push("");
    lines.push("VALORES DE REFERENCIA");
    lines.push(isChild ? "- Niños (<12 años): Bajo <20 ppb | Intermedio 20–35 ppb | Alto >35 ppb." : "- Adultos / ≥12 años: Bajo <25 ppb | Intermedio 25–50 ppb | Alto >50 ppb.");
    lines.push("");
    lines.push("REFERENCIAS");
    lines.push("1. Dweik RA, Boggs PB, Erzurum SC, et al. An official ATS clinical practice guideline: interpretation of exhaled nitric oxide levels (FeNO) for clinical applications. Am J Respir Crit Care Med. 2011;184:602-615.");
    lines.push("2. Fraser A, Simpson R, Turner S. Use of exhaled nitric oxide in the diagnosis and monitoring of childhood asthma: myth or maxim? Breathe. 2023;19:220236.");
    lines.push("");
    lines.push(patient.firma);
    lines.push(patient.titulo);
    lines.push(`Registro Médico ${patient.registro}`);
    return lines.join("\n");
  }

  const reportText = useMemo(makeReportText, [patient, results, longitudinal, isChild]);

  const updateScenario = (idx, key, value) => {
    setScenarios((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));
  };

  const copyTextReport = async () => {
    await navigator.clipboard.writeText(reportText);
    alert("Informe copiado como texto.");
  };

  const copyHtmlReport = async () => {
    try {
      const html = `
        <html><body style="font-family: Arial, Helvetica, sans-serif; color:#0f172a; line-height:1.6;">
          ${reportCardRef.current?.innerHTML || ""}
        </body></html>`;
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([reportText], { type: "text/plain" }),
        }),
      ]);
      alert("Informe copiado en formato HTML.");
    } catch {
      alert("No fue posible copiar el informe en formato HTML en este navegador.");
    }
  };

  const downloadPdfReport = () => {
    const content = reportCardRef.current?.innerHTML;
    if (!content) return;
    const popup = window.open("", "_blank", "width=1100,height=850");
    if (!popup) return;
    popup.document.write(`
      <html>
        <head>
          <title>Informe FeNO</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; margin: 24px; color: #0f172a; }
            .sheet { max-width: 900px; margin: 0 auto; }
            h1,h2,h3 { margin: 0; }
            ul,ol { line-height: 1.65; }
            .section { margin-top: 18px; }
          </style>
        </head>
        <body>
          <div class="sheet">${content}</div>
        </body>
      </html>
    `);
    popup.document.close();
    setTimeout(() => popup.print(), 400);
  };

  const valid = results.filter((r) => r.valid);
  const avg = valid.length ? valid.reduce((a, b) => a + b.selected, 0) / valid.length : null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.rowBetween}>
            <div>
              <h1 style={styles.title}>App clínica para estimación de FeNO</h1>
              <div style={styles.subtitle}>Dos modelos disponibles: uno clínico básico y otro incorporando eosinófilos periféricos cuando estén disponibles.</div>
            </div>
            <div style={styles.badge}>Umbrales activos: {thresholds.label} · Bajo &lt; {thresholds.low} · Alto &gt; {thresholds.high}</div>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.leftColumn}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Datos del paciente</h2>
              <div style={styles.fieldGrid3}>
                <Field label="Nombre"><input style={styles.input} value={patient.nombre} onChange={(e) => setPatient({ ...patient, nombre: e.target.value })} /></Field>
                <Field label="Edad (años)"><input type="number" style={styles.input} value={patient.edad} onChange={(e) => setPatient({ ...patient, edad: e.target.value })} /></Field>
                <Field label="Fecha"><input type="date" style={styles.input} value={patient.fecha} onChange={(e) => setPatient({ ...patient, fecha: e.target.value })} /></Field>
              </div>
              <div style={styles.fieldGrid4}>
                <Field label="Atopia"><select style={styles.select} value={patient.atopia ? "si" : "no"} onChange={(e) => setPatient({ ...patient, atopia: e.target.value === "si" })}><option value="si">Sí</option><option value="no">No</option></select></Field>
                <Field label="Rinitis"><select style={styles.select} value={patient.rinitis ? "si" : "no"} onChange={(e) => setPatient({ ...patient, rinitis: e.target.value === "si" })}><option value="si">Sí</option><option value="no">No</option></select></Field>
                <Field label="Uso de ICS"><select style={styles.select} value={patient.usaICS ? "si" : "no"} onChange={(e) => setPatient({ ...patient, usaICS: e.target.value === "si" })}><option value="si">Sí</option><option value="no">No</option></select></Field>
                <Field label="Dosis ICS (µg budesonida/día)"><input type="number" style={styles.input} value={patient.icsDose} onChange={(e) => setPatient({ ...patient, icsDose: e.target.value })} disabled={!patient.usaICS} /></Field>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.rowBetween}>
                <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Pruebas y modelo</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "14px", color: "#475569", fontWeight: 600 }}>Modelo activo</span>
                  <select style={{ ...styles.select, width: "360px" }} value={modelType} onChange={(e) => setModelType(e.target.value)}>
                    <option value="auto">Automático (usa eosinófilos si están disponibles)</option>
                    <option value="basic">Modelo clínico básico</option>
                    <option value="eos">Modelo con eosinófilos</option>
                  </select>
                </div>
              </div>
              <div style={styles.scenarioGrid}>
                {scenarios.map((s, idx) => {
                  const r = results[idx];
                  return (
                    <div key={idx} style={styles.scenarioCard}>
                      <h3 style={{ margin: "0 0 12px 0", fontSize: "17px" }}>Prueba {idx + 1}</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <Field label="FEV1 pre (% predicho)"><input type="number" style={styles.input} value={s.fev1Pre} onChange={(e) => updateScenario(idx, "fev1Pre", e.target.value)} /></Field>
                        <Field label="FEV1 post (% predicho)"><input type="number" style={styles.input} value={s.fev1Post} onChange={(e) => updateScenario(idx, "fev1Post", e.target.value)} /></Field>
                        <Field label="Eosinófilos periféricos (cél/µL, opcional)"><input type="number" style={styles.input} value={s.eos} onChange={(e) => updateScenario(idx, "eos", e.target.value)} /></Field>
                      </div>
                      <div style={styles.scenarioInfo}>
                        {!r.valid ? (
                          <span style={{ color: "#64748b" }}>Complete FEV1 pre y post para calcular.</span>
                        ) : (
                          <div>
                            <div><strong>BDR:</strong> {r.bdr.toFixed(1)}%</div>
                            <div><strong>Modelo usado:</strong> {r.selectedModel}</div>
                            <div><strong>FeNO estimado:</strong> {r.selected.toFixed(1)} ppb</div>
                            <div><strong>Clasificación:</strong> {r.classSelected.label}</div>
                            {r.fenoB !== null && modelType !== "eos" ? <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>Con eosinófilos: {r.fenoB.toFixed(1)} ppb</div> : null}
                            {r.fenoA !== null && modelType !== "basic" ? <div style={{ fontSize: "12px", color: "#64748b" }}>Modelo básico: {r.fenoA.toFixed(1)} ppb</div> : null}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Firma y referencias</h2>
              <div style={styles.fieldGrid3}>
                <Field label="Firma"><input style={styles.input} value={patient.firma} onChange={(e) => setPatient({ ...patient, firma: e.target.value })} /></Field>
                <Field label="Título"><input style={styles.input} value={patient.titulo} onChange={(e) => setPatient({ ...patient, titulo: e.target.value })} /></Field>
                <Field label="Registro médico"><input style={styles.input} value={patient.registro} onChange={(e) => setPatient({ ...patient, registro: e.target.value })} /></Field>
              </div>
            </div>
          </div>

          <div style={styles.rightColumn}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Curva de valores estimados de FeNO</h2>
              <div style={{ width: "100%", height: "320px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, "auto"]} label={{ value: "ppb", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => (value == null ? "No calculable" : `${value} ppb`)} />
                    <ReferenceLine y={thresholds.low} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Bajo < ${thresholds.low}`, position: "insideTopRight", fill: "#92400e", fontSize: 11 }} />
                    <ReferenceLine y={thresholds.high} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Alto > ${thresholds.high}`, position: "insideTopLeft", fill: "#991b1b", fontSize: 11 }} />
                    <Line type="monotone" dataKey="FeNO" stroke="#0f172a" strokeWidth={3} dot={{ r: 5 }} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Resumen clínico</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {results.map((r, i) => (
                  <div key={i} style={styles.infoBox}>
                    {!r.valid ? `Prueba ${i + 1}: no calculable.` : `Prueba ${i + 1}: ${r.selected.toFixed(1)} ppb (${r.classSelected.label}). ${r.classSelected.summary}.`}
                  </div>
                ))}
                {longitudinal ? <div style={styles.infoBox}>Cambio entre primera y última prueba: {longitudinal.pct.toFixed(1)}%.</div> : null}
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Informe listo para copiar</h2>
              <div ref={reportCardRef} style={styles.reportPaper}>
                <div style={styles.reportHeader}>
                  <div>
                    <h3 style={styles.reportTitle}>Evaluación de inflamación de la vía aérea (FeNO)</h3>
                    <div style={{ ...styles.reportMeta, marginTop: "8px" }}>
                      <div><strong>Nombre del paciente:</strong> {patient.nombre || "________________"}</div>
                      <div><strong>Edad:</strong> {patient.edad || "__"} años</div>
                      <div><strong>Fecha:</strong> {patient.fecha}</div>
                    </div>
                  </div>
                  <div style={{ ...styles.badge, whiteSpace: "nowrap" }}>{thresholds.label}</div>
                </div>

                <div style={styles.reportSection}>
                  <div style={styles.reportSectionTitle}>Resultados</div>
                  <ul style={styles.resultList}>
                    {results.map((r, i) => (
                      <li key={i}>
                        {!r.valid ? `Prueba ${i + 1}: no calculable por información incompleta.` : `Prueba ${i + 1}: ${r.selected.toFixed(1)} ppb (${r.classSelected.label}). ${r.classSelected.summary}.`}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={styles.reportSection}>
                  <div style={styles.reportSectionTitle}>Curva de valores</div>
                  <div style={{ width: "100%", height: "250px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, "auto"]} />
                        <Tooltip formatter={(value) => (value == null ? "No calculable" : `${value} ppb`)} />
                        <ReferenceLine y={thresholds.low} stroke="#f59e0b" strokeDasharray="4 4" />
                        <ReferenceLine y={thresholds.high} stroke="#ef4444" strokeDasharray="4 4" />
                        <Line type="monotone" dataKey="FeNO" stroke="#0f172a" strokeWidth={3} dot={{ r: 5 }} connectNulls={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p style={{ ...styles.para, marginTop: "8px" }}>
                    {results.map((r, i) => (r.valid ? `Prueba ${i + 1}: ${r.selected.toFixed(1)} ppb` : `Prueba ${i + 1}: NA`)).join(" | ")}
                  </p>
                </div>

                <div style={styles.reportSection}>
                  <div style={styles.reportSectionTitle}>Interpretación clínica</div>
                  <p style={styles.para}>{avg == null ? "No fue posible generar una interpretación por falta de datos suficientes." : interpText(avg)}</p>
                  <p style={{ ...styles.para, marginTop: "8px" }}>La interpretación del óxido nítrico exhalado debe integrarse con los síntomas, la función pulmonar, la presencia de atopia o rinitis y la evolución clínica.</p>
                </div>

                {longitudinal ? (
                  <div style={styles.reportSection}>
                    <div style={styles.reportSectionTitle}>Interpretación longitudinal</div>
                    <p style={styles.para}><strong>Cambio entre primera y última prueba:</strong> {longitudinal.pct.toFixed(1)}%.</p>
                    <p style={{ ...styles.para, marginTop: "8px" }}>{Math.abs(longitudinal.pct) >= 60 ? "La magnitud del cambio amerita correlación clínica estrecha en el seguimiento." : "No se observa un cambio relativo de gran magnitud entre las pruebas comparadas."}</p>
                  </div>
                ) : null}

                <div style={styles.reportSection}>
                  <div style={styles.reportSectionTitle}>Valores de referencia</div>
                  <p style={styles.para}>{isChild ? "Niños (<12 años): Bajo <20 ppb | Intermedio 20–35 ppb | Alto >35 ppb." : "Adultos / ≥12 años: Bajo <25 ppb | Intermedio 25–50 ppb | Alto >50 ppb."}</p>
                </div>

                <div style={styles.reportSection}>
                  <div style={styles.reportSectionTitle}>Referencias</div>
                  <ol style={styles.resultList}>
                    <li>Dweik RA, Boggs PB, Erzurum SC, et al. <em>An official ATS clinical practice guideline: interpretation of exhaled nitric oxide levels (FeNO) for clinical applications</em>. Am J Respir Crit Care Med. 2011;184:602-615.</li>
                    <li>Fraser A, Simpson R, Turner S. <em>Use of exhaled nitric oxide in the diagnosis and monitoring of childhood asthma: myth or maxim?</em> Breathe. 2023;19:220236.</li>
                  </ol>
                </div>

                <div style={styles.footer}>
                  <strong>{patient.firma}</strong><br />
                  {patient.titulo}<br />
                  Registro Médico {patient.registro}
                </div>
              </div>

              <div style={styles.buttonRow}>
                <button onClick={copyTextReport} style={styles.btnPrimary}>Copiar informe (texto)</button>
                <button onClick={copyHtmlReport} style={styles.btnSecondary}>Copiar informe (HTML)</button>
                <button onClick={downloadPdfReport} style={styles.btnSecondary}>Descargar / imprimir PDF</button>
              </div>

              <div style={styles.reportBox}>{reportText}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
