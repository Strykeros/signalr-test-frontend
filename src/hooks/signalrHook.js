import { useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

export const useSignalR = (hubUrl = '/chathub') => {
 const [connection, setConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [userInfo, setUserInfo] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const messageCountRef = useRef(0);

  const addMessage = useCallback((type, data) => {
    messageCountRef.current++;
    const newMessage = {
      id: messageCountRef.current,
      type,
      data,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prevMessages => {
      const updatedMessages = [newMessage, ...prevMessages];
      // Keep only last 10 messages
      return updatedMessages.slice(0, 10);
    });
  }, []);

  const updateConnectionStatus = useCallback((status, info = "") => {
    setConnectionStatus(status);
    if (info) {
      setUserInfo(info);
    }
  }, []);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    // Set up event handlers
    newConnection.on("Test", (payload) => {
      addMessage("Test Data Received", payload);
    });

    newConnection.on("ReceiveMessage", (user, message) => {
      addMessage("Message Received", { from: user, message: message });
    });

    newConnection.on("PairedWith", (partnerId) => {
      addMessage("Paired", { partnerId });
      updateConnectionStatus("Connected & Paired", `Paired with: ${partnerId}`);
    });

    newConnection.on("Unpaired", (formerPartner) => {
      addMessage("Unpaired", { formerPartner });
      updateConnectionStatus("Connected but Unpaired", "Waiting for new partner...");
    });

    newConnection.on("Waiting", () => {
      addMessage("Status Update", { status: "waiting for partner" });
      updateConnectionStatus("Connected but Waiting", "Looking for a partner...");
    });

    newConnection.on("UserListUpdated", (users) => {
      addMessage("User List Update", { onlineUsers: users, count: users.length });
    });

    // Connection events
    newConnection.onreconnecting(() => {
      updateConnectionStatus("Reconnecting...", "");
      addMessage("Connection Status", { status: "reconnecting" });
      setIsConnected(false);
    });

    newConnection.onreconnected(() => {
      updateConnectionStatus("Reconnected", "");
      addMessage("Connection Status", { status: "reconnected" });
      setIsConnected(true);
    });

    newConnection.onclose(() => {
      updateConnectionStatus("Disconnected", "");
      addMessage("Connection Status", { status: "disconnected" });
      setIsConnected(false);
    });

    setConnection(newConnection);
  }, [hubUrl, addMessage, updateConnectionStatus]);

  const startConnection = useCallback(async () => {
    if (connection) {
      try {
        updateConnectionStatus("Connecting...", "");
        await connection.start();
        
        const userId = await connection.invoke("GetUserId");
        setUserInfo(userId);
        
        updateConnectionStatus("Connected", "Waiting for events...");
        addMessage("Connection Status", { status: "connected and ready" });
        setIsConnected(true);
      } catch (err) {
        updateConnectionStatus("Connection Failed", "");
        addMessage("Connection Error", { error: err.message });
        setIsConnected(false);
      }
    }
  }, [connection, addMessage, updateConnectionStatus]);

  const stopConnection = useCallback(async () => {
    if (connection) {
      try {
        await connection.stop();
      } catch (err) {
        console.error('Error stopping connection:', err);
      }
    }
  }, [connection]);

  const sendToPartner = useCallback(async (message) => {
    if (connection && isConnected && message.trim()) {
      try {
        await connection.invoke("SendToPartner", message);
        addMessage("Message Sent", { message, to: "partner" });
      } catch (err) {
        addMessage("Send Error", { error: err.message });
      }
    }
  }, [connection, isConnected, addMessage]);

  const sendMessage = useCallback(async (user, message) => {
    if (connection && isConnected && user.trim() && message.trim()) {
      try {
        await connection.invoke("SendMessage", user, message);
        addMessage("Message Sent", { message, to: user });
      } catch (err) {
        addMessage("Send Error", { error: err.message });
      }
    }
  }, [connection, isConnected, addMessage]);

  const getConnectedUsers = useCallback(async () => {
    if (connection && isConnected) {
      try {
        const users = await connection.invoke("GetConnectedUsers");
        return users;
      } catch (err) {
        addMessage("Error", { error: err.message });
        return [];
      }
    }
    return [];
  }, [connection, isConnected, addMessage]);

  const sendTestData = useCallback(async (payload) => {
  if (!connection || !isConnected) {
    addMessage("Send Error", { error: "Not connected" });
    return;
  }
  try {
    // invoke a server method that will broadcast to clients
    await connection.invoke("BroadcastTest", payload);

    addMessage("Test Sent", payload);
  } catch (err) {
    addMessage("Send Error", { error: err.message });
  }
}, [connection, isConnected, addMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection]);

  return {
    connection,
    connectionStatus,
    userInfo,
    messages,
    isConnected,
    startConnection,
    stopConnection,
    sendToPartner,
    sendMessage,
    getConnectedUsers,
    addMessage,
    sendTestData
  };
};