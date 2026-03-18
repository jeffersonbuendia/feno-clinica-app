import React, { useMemo, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

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

  const emptyScenario = {
    fev1Pre: "",
    fev1Post: "",
    eos: "",
  };

  const [scenarios, setScenarios] = useState([
    { ...emptyScenario },
    { ...emptyScenario },
    { ...emptyScenario },
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

  const thresholds = useMemo(() => {
    return isChild
      ? { low: 20, high: 35, label: "Niños (<12 años)" }
      : { low: 25, high: 50, label: "Adultos / ≥12 años" };
  }, [isChild]);

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

    // Modelo 1: sin eosinófilos
    const logFenoA = 2.10 + 0.06 * bdr - 0.05 * F + 0.25 * atopia + 0.15 * rinitis - 0.22 * S;
    const fenoA = Math.exp(logFenoA);

    // Modelo 2: con eosinófilos periféricos
    // Eos se expresa por 100 cél/µL.
    let fenoB = null;
    let logFenoB = null;
    if (eos !== null && eos >= 0) {
      const E = eos / 100;
      logFenoB = 1.95 + 0.05 * bdr - 0.04 * F + 0.22 * atopia + 0.12 * rinitis - 0.20 * S + 0.11 * E;
      fenoB = Math.exp(logFenoB);
    }

    let selected = fenoA;
    let selectedModel = "Modelo clínico básico";
    if (modelType === "basic") {
      selected = fenoA;
      selectedModel = "Modelo clínico básico";
    } else if (modelType === "eos" && fenoB !== null) {
      selected = fenoB;
      selectedModel = "Modelo con eosinófilos";
    } else if (modelType === "auto") {
      if (fenoB !== null) {
        selected = fenoB;
        selectedModel = "Modelo con eosinófilos";
      }
    }

    return {
      valid: true,
      bdr,
      fenoA,
      fenoB,
      selected,
      selectedModel,
      classA: classifyFeno(fenoA),
      classB: classifyFeno(fenoB),
      classSelected: classifyFeno(selected),
    };
  }

  const results = useMemo(() => scenarios.map(calculateScenario), [scenarios, patient, modelType, thresholds]);

  const longitudinal = useMemo(() => {
    const vals = results.map((r) => r.valid ? r.selected : null).filter((v) => v != null);
    if (vals.length < 2) return null;
    const first = vals[0];
    const last = vals[vals.length - 1];
    const pct = ((last - first) / first) * 100;
    return { first, last, pct };
  }, [results]);

  function interpText(value) {
    if (value == null) return "No fue posible estimar el valor por información incompleta.";
    const cls = classifyFeno(value);
    if (cls.label === "Bajo") {
      return "Valor en rango bajo, compatible con baja probabilidad de inflamación eosinofílica significativa de la vía aérea en el momento de la evaluación.";
    }
    if (cls.label === "Alto") {
      return "Valor en rango alto, compatible con mayor probabilidad de inflamación tipo 2/eosinofílica de la vía aérea; debe correlacionarse con síntomas, función pulmonar y respuesta terapéutica.";
    }
    return "Valor en rango intermedio, cuya interpretación requiere correlación con síntomas, función pulmonar, comorbilidades alérgicas y evolución clínica.";
  }

  function makeReport() {
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
    
    // Representación textual de la curva
    const curve = results
      .map((r, i) => r.valid ? `${i + 1}:${r.selected.toFixed(1)}` : `${i + 1}:NA`)
      .join(" | ");
    lines.push("");
    lines.push("CURVA DE VALORES (ppb)");
    lines.push(`Prueba→ ${curve}`);
    
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
      if (Math.abs(longitudinal.pct) >= 60) {
        lines.push("La magnitud del cambio amerita correlación clínica estrecha en el seguimiento.");
      } else {
        lines.push("No se observa un cambio relativo de gran magnitud entre los escenarios comparados.");
      }
    }
    lines.push("");
    lines.push("VALORES DE REFERENCIA");
    if (isChild) {
      lines.push("- Niños (<12 años): Bajo <20 ppb | Intermedio 20–35 ppb | Alto >35 ppb.");
    } else {
      lines.push("- Adultos / ≥12 años: Bajo <25 ppb | Intermedio 25–50 ppb | Alto >50 ppb.");
    }
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

  const reportText = useMemo(makeReport, [patient, results, longitudinal, isChild]);

  const reportHtml = useMemo(() => {
    const resultItems = results.map((r, i) => {
      if (!r.valid) return `<li><strong>Prueba ${i + 1}:</strong> no calculable por información incompleta.</li>`;
      return `<li><strong>Prueba ${i + 1}:</strong> ${r.selected.toFixed(1)} ppb (${r.classSelected.label}). ${r.classSelected.summary}.</li>`;
    }).join("");

    const curve = results
      .map((r, i) => r.valid ? `${i + 1}:${r.selected.toFixed(1)}` : `${i + 1}:NA`)
      .join(" | ");

    const valid = results.filter((r) => r.valid);
    const avg = valid.length ? valid.reduce((a, b) => a + b.selected, 0) / valid.length : null;

    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; line-height: 1.45;">
        <h2 style="margin:0 0 12px 0;">EVALUACIÓN DE INFLAMACIÓN DE LA VÍA AÉREA (FeNO)</h2>
        <p><strong>Nombre del paciente:</strong> ${patient.nombre || "________________"}<br/>
        <strong>Edad:</strong> ${patient.edad || "__"} años<br/>
        <strong>Fecha:</strong> ${patient.fecha}</p>
        <h3>Resultados</h3>
        <ul>${resultItems}</ul>
        <h3>Curva de valores (ppb)</h3>
        <p><strong>Prueba→</strong> ${curve}</p>
        <h3>Interpretación clínica</h3>
        <p>${avg == null ? "No fue posible generar una interpretación por falta de datos suficientes." : interpText(avg)}</p>
        <p>La interpretación del óxido nítrico exhalado debe integrarse con los síntomas, la función pulmonar, la presencia de atopia o rinitis y la evolución clínica.</p>
        ${longitudinal ? `<h3>Interpretación longitudinal</h3><p><strong>Cambio entre primera y última prueba:</strong> ${longitudinal.pct.toFixed(1)}%.</p>` : ""}
        <h3>Valores de referencia</h3>
        <p>${isChild ? "Niños (<12 años): Bajo <20 ppb | Intermedio 20–35 ppb | Alto >35 ppb." : "Adultos / ≥12 años: Bajo <25 ppb | Intermedio 25–50 ppb | Alto >50 ppb."}</p>
        <h3>Referencias</h3>
        <ol>
          <li>Dweik RA, Boggs PB, Erzurum SC, et al. <em>An official ATS clinical practice guideline: interpretation of exhaled nitric oxide levels (FeNO) for clinical applications</em>. Am J Respir Crit Care Med. 2011;184:602-615.</li>
          <li>Fraser A, Simpson R, Turner S. <em>Use of exhaled nitric oxide in the diagnosis and monitoring of childhood asthma: myth or maxim?</em> Breathe. 2023;19:220236.</li>
        </ol>
        <p style="margin-top:20px;"><strong>${patient.firma}</strong><br/>${patient.titulo}<br/>Registro Médico ${patient.registro}</p>
      </div>
    `;
  }, [patient, results, longitudinal, isChild, reportText]);

  const copyHtmlReport = async () => {
    try {
      const htmlBlob = new Blob([reportHtml], { type: "text/html" });
      const textBlob = new Blob([reportText], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        }),
      ]);
      alert("Informe HTML copiado al portapapeles.");
    } catch (e) {
      alert("No fue posible copiar en formato HTML enriquecido en este navegador.");
    }
  };

  const downloadPdfReport = () => {
    const content = reportCardRef.current?.innerHTML;
    if (!content) return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Informe FeNO</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 32px; color: #0f172a; }
            h1, h2, h3 { margin-top: 0; }
            .card { border: 1px solid #cbd5e1; border-radius: 16px; padding: 24px; }
            .chart-wrap { margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="card">${content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const chartData = useMemo(() => results.map((r, i) => ({
    name: `Prueba ${i + 1}`,
    FeNO: r.valid ? Number(r.selected.toFixed(1)) : null,
  })), [results]);

  const updateScenario = (idx, key, value) => {
    setScenarios((prev) => prev.map((s, i) => i === idx ? { ...s, [key]: value } : s));
  };

  const Field = ({ label, children }) => (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">App clínica para estimación de FeNO</h1>
              <p className="mt-1 text-sm text-slate-600">Dos modelos disponibles: uno clínico básico y otro incorporando eosinófilos periféricos cuando estén disponibles.</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-700">
              Umbrales activos: {thresholds.label} · Bajo &lt; {thresholds.low} · Alto &gt; {thresholds.high}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Datos del paciente</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Nombre">
                  <input className="rounded-xl border border-slate-300 px-3 py-2" value={patient.nombre} onChange={(e) => setPatient({ ...patient, nombre: e.target.value })} />
                </Field>
                <Field label="Edad (años)">
                  <input type="number" className="rounded-xl border border-slate-300 px-3 py-2" value={patient.edad} onChange={(e) => setPatient({ ...patient, edad: e.target.value })} />
                </Field>
                <Field label="Fecha">
                  <input type="date" className="rounded-xl border border-slate-300 px-3 py-2" value={patient.fecha} onChange={(e) => setPatient({ ...patient, fecha: e.target.value })} />
                </Field>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <Field label="Atopia">
                  <select className="rounded-xl border border-slate-300 px-3 py-2" value={patient.atopia ? "si" : "no"} onChange={(e) => setPatient({ ...patient, atopia: e.target.value === "si" })}>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </Field>
                <Field label="Rinitis">
                  <select className="rounded-xl border border-slate-300 px-3 py-2" value={patient.rinitis ? "si" : "no"} onChange={(e) => setPatient({ ...patient, rinitis: e.target.value === "si" })}>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </Field>
                <Field label="Uso de ICS">
                  <select className="rounded-xl border border-slate-300 px-3 py-2" value={patient.usaICS ? "si" : "no"} onChange={(e) => setPatient({ ...patient, usaICS: e.target.value === "si" })}>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </Field>
                <Field label="Dosis ICS (µg budesonida/día)">
                  <input type="number" className="rounded-xl border border-slate-300 px-3 py-2" value={patient.icsDose} onChange={(e) => setPatient({ ...patient, icsDose: e.target.value })} disabled={!patient.usaICS} />
                </Field>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Pruebas y modelo</h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-600">Modelo activo</span>
                  <select className="rounded-xl border border-slate-300 px-3 py-2" value={modelType} onChange={(e) => setModelType(e.target.value)}>
                    <option value="auto">Automático (usa eosinófilos si están disponibles)</option>
                    <option value="basic">Modelo clínico básico</option>
                    <option value="eos">Modelo con eosinófilos</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {scenarios.map((s, idx) => {
                  const r = results[idx];
                  return (
                    <div key={idx} className="rounded-2xl border border-slate-200 p-4">
                      <h3 className="mb-3 font-semibold text-slate-800">Prueba {idx + 1}</h3>
                      <div className="space-y-3">
                        <Field label="FEV1 pre (% predicho)">
                          <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2" value={s.fev1Pre} onChange={(e) => updateScenario(idx, "fev1Pre", e.target.value)} />
                        </Field>
                        <Field label="FEV1 post (% predicho)">
                          <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2" value={s.fev1Post} onChange={(e) => updateScenario(idx, "fev1Post", e.target.value)} />
                        </Field>
                        <Field label="Eosinófilos periféricos (cél/µL, opcional)">
                          <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2" value={s.eos} onChange={(e) => updateScenario(idx, "eos", e.target.value)} />
                        </Field>
                      </div>

                      <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm">
                        {!r.valid ? (
                          <span className="text-slate-500">Complete FEV1 pre y post para calcular.</span>
                        ) : (
                          <div className="space-y-1">
                            <div><span className="font-medium">BDR:</span> {r.bdr.toFixed(1)}%</div>
                            <div><span className="font-medium">Modelo usado:</span> {r.selectedModel}</div>
                            <div><span className="font-medium">FeNO estimado:</span> {r.selected.toFixed(1)} ppb</div>
                            <div><span className="font-medium">Clasificación:</span> {r.classSelected.label}</div>
                            {r.fenoB !== null && modelType !== "eos" && <div className="text-xs text-slate-500">Con eosinófilos: {r.fenoB.toFixed(1)} ppb</div>}
                            {r.fenoA !== null && modelType !== "basic" && <div className="text-xs text-slate-500">Modelo básico: {r.fenoA.toFixed(1)} ppb</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Firma y referencias</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Firma">
                  <input className="rounded-xl border border-slate-300 px-3 py-2" value={patient.firma} onChange={(e) => setPatient({ ...patient, firma: e.target.value })} />
                </Field>
                <Field label="Título">
                  <input className="rounded-xl border border-slate-300 px-3 py-2" value={patient.titulo} onChange={(e) => setPatient({ ...patient, titulo: e.target.value })} />
                </Field>
                <Field label="Registro médico">
                  <input className="rounded-xl border border-slate-300 px-3 py-2" value={patient.registro} onChange={(e) => setPatient({ ...patient, registro: e.target.value })} />
                </Field>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Curva de valores estimados de FeNO</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 'auto']} label={{ value: 'ppb', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => value == null ? 'No calculable' : `${value} ppb`} />
                    <ReferenceLine y={thresholds.low} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Bajo < ${thresholds.low}`, position: 'insideTopRight', fill: '#92400e', fontSize: 11 }} />
                    <ReferenceLine y={thresholds.high} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Alto > ${thresholds.high}`, position: 'insideTopLeft', fill: '#991b1b', fontSize: 11 }} />
                    <Line type="monotone" dataKey="FeNO" stroke="#0f172a" strokeWidth={3} dot={{ r: 5 }} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Resumen clínico</h2>
              <div className="space-y-3 text-sm text-slate-700">
                {results.map((r, i) => (
                  <div key={i} className="rounded-2xl bg-slate-50 p-3">
                    {!r.valid ? `Prueba ${i + 1}: no calculable.` : `Prueba ${i + 1}: ${r.selected.toFixed(1)} ppb (${r.classSelected.label}). ${r.classSelected.summary}.`}
                  </div>
                ))}
                {longitudinal && (
                  <div className="rounded-2xl bg-slate-50 p-3">
                    Cambio entre primera y última prueba: {longitudinal.pct.toFixed(1)}%.
                  </div>
                )}
              </div>
            </div>

            <div ref={reportCardRef} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Informe listo para copiar</h2>
              <textarea className="min-h-[620px] w-full rounded-2xl border border-slate-300 p-4 font-mono text-xs text-slate-800" value={reportText} readOnly />
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(reportText)}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Copiar informe (texto)
                </button>
                <button
                  onClick={copyHtmlReport}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Copiar informe (HTML)
                </button>
                <button
                  onClick={downloadPdfReport}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Descargar / imprimir PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
