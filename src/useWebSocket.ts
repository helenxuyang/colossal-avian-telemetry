import { useEffect, useRef, useState, type RefObject } from "react";

export type HandleReceiveDataCallback = (data: string) => void;
export type HandleReceiveDataCallbackRef =
  RefObject<HandleReceiveDataCallback | null>;

export const useWebSocket = (
  onHandleReceiveData: HandleReceiveDataCallbackRef,
) => {
  const connection = useRef<WebSocket>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [closeCodes, setCloseCodes] = useState<number[]>();

  useEffect(() => {
    connection.current = new WebSocket("ws://192.168.4.1:81", ["arduino"]);
    connection.current.addEventListener("open", () => {
      console.log("websocket open");
      connection.current?.send("Connect " + new Date());
      setStatus(connection.current?.readyState ?? null);
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
    });

    return () => {
      if (connection.current?.readyState === WebSocket.OPEN) {
        connection.current?.close();
      }
    };
  }, [onHandleReceiveData]);

  return { connection, status, closeCodes };
};
