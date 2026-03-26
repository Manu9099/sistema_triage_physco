import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../../shared/ui/Button";
import Panel from "../../../shared/ui/Panel";
import StatusMessage from "../../../shared/ui/StatusMessage";
import { getTriageById } from "../services/triageApi";
import type { TriageDetail } from "../types";

export default function TriageDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<TriageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await getTriageById(Number(id));
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el detalle.");
      } finally {
        setLoading(false);
      }
    }

    if (id) void load();
  }, [id]);

  if (loading) {
    return <Panel>Cargando detalle...</Panel>;
  }

  if (error) {
    return (
      <Panel>
        <StatusMessage kind="error" message={error} />
      </Panel>
    );
  }

  if (!data) {
    return <Panel>No se encontró la evaluación.</Panel>;
  }

  return (
    <Panel>
      <div className="history-header">
        <h2 className="section-title">Detalle de evaluación #{data.id}</h2>
        <Link to="/history">
          <Button variant="secondary">Volver al historial</Button>
        </Link>
      </div>

      <div className="summary-grid detail-grid-top">
        <div className="muted-card"><strong>Edad:</strong> {data.age}</div>
        <div className="muted-card">
          <strong>Fecha:</strong> {new Date(data.createdAt).toLocaleString()}
        </div>
        <div className="muted-card"><strong>PHQ-9:</strong> {data.phq9Score}</div>
        <div className="muted-card"><strong>GAD-7:</strong> {data.gad7Score}</div>
        <div className="muted-card"><strong>Urgencia:</strong> {data.urgencyLevel}</div>
        <div className="muted-card"><strong>Perfil:</strong> {data.clinicalProfile}</div>
        <div className="muted-card">
          <strong>Ideación suicida:</strong> {data.suicidalIdeation ? "Sí" : "No"}
        </div>
        <div className="muted-card">
          <strong>Autolesión previa:</strong> {data.selfHarmHistory ? "Sí" : "No"}
        </div>
        <div className="muted-card">
          <strong>Deterioro funcional:</strong> {data.functionalImpairment ? "Sí" : "No"}
        </div>
        <div className="muted-card">
          <strong>Consumo de sustancias:</strong> {data.substanceUse ? "Sí" : "No"}
        </div>
        <div className="muted-card">
          <strong>Soporte social:</strong> {data.socialSupportLevel}/10
        </div>
      </div>

      <div className="section-card detail-card">
        <div className="card-title">Resumen</div>
        <div className="card-body">{data.summary}</div>
      </div>

      <div className="section-card detail-card">
        <div className="card-title">Recomendación</div>
        <div className="card-body">{data.recommendation}</div>
      </div>
    </Panel>
  );
}