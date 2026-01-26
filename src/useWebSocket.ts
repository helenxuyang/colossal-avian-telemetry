import { useEffect, useRef, useState, type RefObject } from "react";

export type HandleReceiveDataCallback = (data: string) => void;
export type HandleReceiveDataCallbackRef =
  RefObject<HandleReceiveDataCallback | null>;

export const useWebSocket = (
  shouldAutoRetryConnection: boolean,
  onHandleReceiveData: HandleReceiveDataCallbackRef,
) => {
  const connection = useRef<WebSocket>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [closeCodes, setCloseCodes] = useState<number[]>();
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    console.log("websocket setup start");
    connection.current = new WebSocket("ws://192.168.4.1:81", ["arduino"]);
    const checkStatus = setInterval(() => {
      setStatus(connection.current?.readyState ?? null);
    }, 100);
    connection.current.addEventListener("open", () => {
      console.log("websocket open");
      connection.current?.send("Connect " + new Date());
      setStatus(connection.current?.readyState ?? null);
      clearInterval(checkStatus);
    });

    connection.current.addEventListener("error", (event) => {
      console.log(`websocket error`, event);
      setStatus(connection.current?.readyState ?? null);
    });

    connection.current.addEventListener("message", (event) => {
      console.log(`websocket message: ${event.data}`);
      onHandleReceiveData.current?.(event.data);
      setStatus(connection.current?.readyState ?? null);
    });

    connection.current.addEventListener("close", (event) => {
      console.log("websocket close", event);
      setCloseCodes((codes) => [...(codes ? codes : []), event.code]);
      setStatus(connection.current?.readyState ?? null);
      clearInterval(checkStatus);
    });

    return () => {
      if (connection.current?.readyState === WebSocket.OPEN) {
        connection.current?.close();
      }
      clearInterval(checkStatus);
    };
  }, [retryCount, onHandleReceiveData]);

  const retryConnection = () => {
    setRetryCount((count) => {
      console.log("retrying connection");
      return count + 1;
    });
  };

  useEffect(() => {
    if (
      shouldAutoRetryConnection &&
      status === WebSocket.CLOSED &&
      (closeCodes?.at(-1) ?? null) === 1006
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      retryConnection();
    }
  }, [shouldAutoRetryConnection, closeCodes, status]);

  return { connection, status, closeCodes, retryConnection };
};
