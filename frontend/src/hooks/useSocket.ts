import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export function useSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const ioSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
    });

    socketRef.current = ioSocket;
    setSocket(ioSocket);

    ioSocket.on("connect", () => {
      setConnected(true);
      console.log("Websocket connected:", ioSocket.id);

      // In a full implementation, we can fetch universityId from profile and join university room
      // e.g. ioSocket.emit("joinUniversity", universityId);
    });

    ioSocket.on("disconnect", () => {
      setConnected(false);
      console.log("Websocket disconnected");
    });

    ioSocket.on("connect_error", (err) => {
      console.warn("WebSocket connection warning (backend server might be starting/offline):", err.message);
      setConnected(false);
    });

    return () => {
      ioSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [user]);

  // Join room helper
  const joinRoom = (roomName: string) => {
    if (socketRef.current && connected) {
      socketRef.current.emit("joinRoom", roomName);
    }
  };

  return { socket, connected, joinRoom };
}
