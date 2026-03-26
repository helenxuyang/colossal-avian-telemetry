import { mapEscs, mapMeasurements } from "./dataUtils";
import type { Robot } from "./robot";

type Props = {
  robot: Robot;
};

export const DebugDisplay = ({ robot }: Props) => {
  return (
    <details>
      <summary>Debug</summary>
      <div>
        {mapEscs(robot.escs, (esc) => {
          const numValuesToShow = 5;
          return (
            <div key={esc.name}>
              <strong>{esc.name}</strong>
              <p>
                {" "}
                Timestamps: [{esc.timestamps.slice(-numValuesToShow).join(",")}]
              </p>
              {mapMeasurements(esc.measurements, (measurement) => {
                return (
                  <div key={`${esc.name}-${measurement.name}`}>
                    <p>
                      {measurement.name}: [
                      {measurement.values.slice(-numValuesToShow).join(",")}]
                    </p>
                  </div>
                );
              })}
              <div>
                Error timestamps: [
                {esc.errors.map((error) => error.timestamp).join(",")}]
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
};
