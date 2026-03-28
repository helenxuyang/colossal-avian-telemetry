import { useCallback, type RefObject } from "react";
import { type EscName } from "./robot";
import { parseMessage, getMockEscError } from "./messageUtils";
import styled from "styled-components";
import { useRobot, useUpdateRobot } from "./store";

const ButtonsHolder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

type Props = {
  startTime: RefObject<number | null>;
};
export const MockDataControls = ({ startTime }: Props) => {
  const robot = useRobot();
  const updateRobot = useUpdateRobot();

  const mockReceiveAndHandleError = useCallback(
    (escName?: EscName) => {
      if (!startTime.current) {
        return;
      }
      const mockError = getMockEscError(startTime.current, escName);
      const parsedData = parseMessage(mockError);
      updateRobot(parsedData);
    },
    [startTime, updateRobot],
  );

  return (
    <div>
      <h2>Data</h2>
      <p>⚠ USING FAKE DATA ⚠</p>
      <ButtonsHolder>
        {Object.keys(robot.escs).map((esc) => (
          <button
            key={esc}
            onClick={() => mockReceiveAndHandleError(esc as EscName)}
          >
            Mock {esc} error
          </button>
        ))}
      </ButtonsHolder>
    </div>
  );
};
