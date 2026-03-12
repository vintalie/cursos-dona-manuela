import { useId } from "react";
import GaugeChartLib from "react-gauge-chart";

interface GaugeChartProps {
  acertos: number;
  erros: number;
  title?: string;
}

export default function GaugeChart({ acertos, erros, title }: GaugeChartProps) {
  const id = useId().replace(/:/g, "");
  const total = acertos + erros || 1;
  const percent = total > 0 ? acertos / 100 : 0;

  return (
    <div className="gauge-chart-container">
      {title && <h4 className="gauge-chart-title">{title}</h4>}
      <div className="gauge-chart-wrapper" style={{ height: 180 }}>
        <GaugeChartLib
          id={`gauge-${id}`}
          percent={percent}
          arcsLength={[0.33, 0.34, 0.33]}
          colors={["#ef4444", "#eab308", "#22c55e"]}
          needleColor="hsl(var(--foreground))"
          needleBaseColor="hsl(var(--foreground))"
          textColor="hsl(var(--foreground))"
          formatTextValue={(value) => `${Math.round(Number(value))}%`}
          animate={true}
          animateDuration={800}
        />
      </div>
      <div className="gauge-chart-legend">
        <span>
          <span className="gauge-legend-dot green" />
          Acertos: {acertos}%
        </span>
        <span>
          <span className="gauge-legend-dot red" />
          Erros: {erros}%
        </span>
      </div>
    </div>
  );
}
