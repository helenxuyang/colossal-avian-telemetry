import { useState } from "react";
import { GraphDisplay } from "./GraphDisplay";
import type { Robot } from "./data";
import styled from "styled-components";

type Props = {
  robot: Robot;
};

type UUID = `${string}-${string}-${string}-${string}-${string}`;

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GridHolder = styled.div`
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const GraphHolder = styled.div`
  flex: 1;
  min-width: 600px;
  display: flex;
  flex-direction: column;
  border: 2px solid #cccccc;
  padding: 16px 8px;
  gap: 8px;

  @media (max-width: 700px) {
    min-width: 300px;
  }
`;

const DeleteButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  border: none;
  width: 24px;
  height: 24px;
  padding: 16px;
  border-radius: 50%;
  background-color: #cccccc;

  &:hover {
    background-color: #bbbbbb;
  }
`;

export const GraphGrid = ({ robot }: Props) => {
  const [plotIds, setPlotIds] = useState<UUID[]>([crypto.randomUUID()]);

  const deletePlot = (index: number) =>
    setPlotIds(plotIds.filter((_, i) => i !== index));

  const addPlot = () => setPlotIds([...plotIds, crypto.randomUUID()]);

  return (
    <Holder>
      <GridHolder>
        {plotIds.map((id, index) => (
          <GraphHolder key={id}>
            <DeleteButton onClick={() => deletePlot(index)}>X</DeleteButton>
            <GraphDisplay key={id} robot={robot} />
          </GraphHolder>
        ))}
      </GridHolder>
      <button onClick={addPlot}>+ New</button>
    </Holder>
  );
};
