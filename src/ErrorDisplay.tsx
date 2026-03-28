import type { ESC } from "./robot";
import { WarningText } from "./styles";

type Props = { errors: ESC["errors"] };

export const ErrorDisplay = ({ errors }: Props) => {
  return <WarningText>ERRORS: {errors.length}</WarningText>;
};
