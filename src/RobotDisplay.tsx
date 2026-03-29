import { ConsumptionDonut } from "./ConsumptionDonut";
import { calculateTotal } from "./dataUtils";
import { HorizontalBarDisplay } from "./HorizontalBarDisplay";
import {
  TOTAL_CURRENT,
  TOTAL_CONSUMPTION,
  DRIVE_LEFT_ESC,
  WEAPON_ESC,
  DRIVE_RIGHT_ESC,
  ARM_ESC,
  CONSUMPTION,
  CURRENT,
} from "./robot";
import { useRobot } from "./store";
import { BACKGROUND, SMALL_VIEWPORT, WarningText } from "./styles";
import { VoltageDisplay } from "./VoltageDisplay";
import styled from "styled-components";
import { ESCDisplay } from "./ESCDisplay";

const ESCSection = styled.div`
  flex: 4;
`;

const ESCGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SmallEscSection = styled(ESCDisplay)`
  flex: 1;
`;

const MediumEscSection = styled(ESCDisplay)`
  flex: 2;
`;

const LargeEscSection = styled(ESCDisplay)`
  flex: 3;
`;

const RobotSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const RobotLayout = styled.div`
  display: flex;

  > * {
    width: 100%;
  }

  @media (max-width: ${SMALL_VIEWPORT}px) {
    flex-direction: column;
    > * {
      width: auto;
    }
  }
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const LayoutColumn = styled.div`
  display: flex;
  flex-direction: column;
  background: ${BACKGROUND};
`;

const BarsHolder = styled.div`
  display: flex;
  flex-direction: column;
`;

const HorizontalBarsHolder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  gap: 8px;
  background: ${BACKGROUND};
`;

export const RobotDisplay = () => {
  const robot = useRobot();
  const referenceEsc = Object.values(robot.escs)[0];

  const { min: minCurrent, max: maxCurrent } =
    referenceEsc.measurements[CURRENT];
  const { min: minConsumption, max: maxConsumption } =
    referenceEsc.measurements[CONSUMPTION];

  const totalCurrent = calculateTotal(CURRENT, robot.escs);
  const totalConsumption = calculateTotal(CONSUMPTION, robot.escs);

  return (
    <Layout>
      <RobotSection>
        <RobotLayout>
          <BarsHolder>
            <VoltageDisplay escs={robot.escs} />
            <HorizontalBarsHolder>
              <HorizontalBarDisplay
                name={TOTAL_CURRENT}
                value={totalCurrent}
                min={minCurrent}
                max={maxCurrent}
              />
              <HorizontalBarDisplay
                name={TOTAL_CONSUMPTION}
                value={totalConsumption}
                min={minConsumption}
                max={maxConsumption}
              />
            </HorizontalBarsHolder>
          </BarsHolder>
          <LayoutColumn>
            <ConsumptionDonut escs={robot.escs} />
            {robot.unknownMessages.length > 0 && (
              <div>
                <h3>Errors</h3>
                <WarningText>
                  <p>Unknown messages: {robot.unknownMessages.length}</p>
                  <p>First: {robot.unknownMessages[0].message}</p>
                </WarningText>
              </div>
            )}
          </LayoutColumn>
        </RobotLayout>
      </RobotSection>
      <ESCSection>
        <ESCGrid>
          <MediumEscSection esc={robot.escs[DRIVE_LEFT_ESC]} />
          <LargeEscSection esc={robot.escs[WEAPON_ESC]} />
          <MediumEscSection esc={robot.escs[DRIVE_RIGHT_ESC]} />
          <SmallEscSection esc={robot.escs[ARM_ESC]} />
        </ESCGrid>
      </ESCSection>
    </Layout>
  );
};
