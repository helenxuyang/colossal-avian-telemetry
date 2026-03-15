import type { Robot } from "./data";

type Props = {
  robot: Robot;
};

export const DebugDisplay = ({ robot }: Props) => {
  return (
    <details>
      <summary>Debug</summary>
      <div>
        {Object.values(robot.escs).map((esc) => {
          const numValuesToShow = 5;
          return (
            <div key={esc.name}>
              <strong>{esc.name}</strong>
              <p>
                {" "}
                Timestamps: [{esc.timestamps.slice(-numValuesToShow).join(",")}]
              </p>
              {Object.values(esc.measurements).map((measurement) => {
                return (
                  <div key={`${esc.name}-${measurement.name}`}>
                    <p>
                      {measurement.name}: [
                      {measurement.values.slice(-numValuesToShow).join(",")}]
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </details>
  );
};
