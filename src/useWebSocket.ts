import { useEffect, useRef, type RefObject } from "react";

export type HandleReceiveDataCallback = (data: string) => void;
export type HandleReceiveDataCallbackRef =
  RefObject<HandleReceiveDataCallback | null>;

export const useWebSocket = (
  onHandleReceiveData: HandleReceiveDataCallbackRef
) => {
  const connection = useRef<WebSocket>(null);

  useEffect(() => {
    connection.current = new WebSocket("ws://192.168.4.1:81", ["arduino"]);
    connection.current.addEventListener("open", () => {
      console.log("websocket open");
      connection.current?.send("Connect " + new Date());
    });

    connection.current.addEventListener("error", (event) => {
      console.log(`websocket error`, event);
    });

    connection.current.addEventListener("message", (event) => {
      console.log(`websocket message: ${event.data}`);
      onHandleReceiveData.current?.(event.data);
    });

    connection.current.addEventListener("close", (code) => {
      console.log("websocket close", code);
    });

    return () => {
      connection.current?.close();
    };
  }, [onHandleReceiveData]);

  return connection;
};
