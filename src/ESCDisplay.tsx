import styled from "styled-components";
import { CURRENT, RPM, TEMPERATURE, type ESC } from "./robot";
import { BarDisplay } from "./BarDisplay";
import { ArcDisplay } from "./ArcDisplay";
import { Container, MEDIUM_VIEWPORT } from "./styles";
import { ErrorDisplay } from "./ErrorDisplay";
import { useEffect, useState } from "react";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

const DisplayHolder = styled(Container)`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  position: relative;
`;

const DisplayLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
  gap: 4px;

  @media (max-width: ${MEDIUM_VIEWPORT}px) {
    display: grid;
    grid-template-areas: "arc arc" "temp input";
  }
`;

const TempDisplay = styled(BarDisplay)`
  grid-area: temp;
  ${Container} {
    background-color: unset;
  }
`;
const RPMCurrentDisplay = styled(ArcDisplay)`
  grid-area: arc;
`;

const InputDisplay = styled(BarDisplay)`
  grid-area: input;
  ${Container} {
    background-color: unset;
  }
`;
type Props = { esc?: ESC; className?: string };

export const ESCDisplay = ({ esc, className }: Props) => {
  const isMobileViewport = useMediaQuery(`(max-width: ${MEDIUM_VIEWPORT}px)`);
  const barOrientation = isMobileViewport ? "horizontal" : "vertical";

  if (!esc) {
    return null;
  }
  return (
    <DisplayHolder className={className}>
      <h3>{esc.name}</h3>
      <DisplayLayout>
        {esc.measurements[TEMPERATURE].shouldShow && (
          <TempDisplay
            measurement={esc.measurements[TEMPERATURE]}
            orientation={barOrientation}
          />
        )}
        {esc.measurements[RPM].shouldShow &&
          esc.measurements[CURRENT].shouldShow && (
            <RPMCurrentDisplay
              outerMeasurement={esc.measurements[RPM]}
              innerMeasurement={esc.measurements[CURRENT]}
            />
          )}
        {esc.inputs.shouldShow && (
          <InputDisplay measurement={esc.inputs} orientation={barOrientation} />
        )}
      </DisplayLayout>
      {esc.errors.length > 0 && <ErrorDisplay errors={esc.errors} />}
    </DisplayHolder>
  );
};
