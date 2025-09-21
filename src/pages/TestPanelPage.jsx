import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useSignalR } from '../hooks/signalrHook';


const API_BASE_URL = 'https://localhost:7132';
const TestPanelPage = () => {
  const [userId, setUserId] = useState('');
  const [response, setResponse] = useState('—');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // SignalR hook
  const {
    connectionStatus,
    userInfo: signalRUserId,
    isConnected,
    startConnection,
    addMessage,
    connection
  } = useSignalR(API_BASE_URL + '/chathub');

  // Check authentication on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Auto-connect to SignalR when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      startConnection();
    }
  }, [isAuthenticated, startConnection]);

  const checkAuthentication = async () => {
    try {
      const status = await authService.getAuthStatus();
      setIsAuthenticated(status.isAuthenticated);
      setUser(status.user);
      
      if (!status.isAuthenticated) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };


const handleSendTest = async () => {
  if (!userId.trim()) {
    setResponse('Error: UserId is required');
    return;
  }

  setIsLoading(true);
  try {
    const testData = {
      success: true,
      userId,
      timestamp: new Date().toISOString(),
      message: 'Test completed successfully',
      sessionId: Math.random().toString(36).substr(2, 9),
      connectionInfo: {
        status: 'Connected',
        hub: 'SignalR Hub',
        transport: 'WebSockets',
        signalRUserId: signalRUserId
      }
    };

    if (connection && isConnected) {
      await connection.invoke('SendMessage', userId, JSON.stringify(testData));
      // or, if you’re paired and don’t want to specify a user:
      // await connection.invoke('SendToPartner', JSON.stringify(testData));
    }


    // (optional) also log locally in this page
    addMessage('Test Sent', testData);

    await new Promise(r => setTimeout(r, 800));
    setResponse(JSON.stringify(testData, null, 2));
  } catch (error) {
    setResponse(`Error: ${error.message}`);
    addMessage('Test Error', { error: error.message });
  } finally {
    setIsLoading(false);
  }
};

  const handleLogout = async () => {
    try {
      await authService.logout();
      setResponse('Logged out successfully');
      setUserId('');
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setResponse(`Logout error: ${error.message}`);
    }
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-5 text-center">
        <div>Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
       navigate('/login');
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-5 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TestPanel API Tester</h1>
            {user && (
              <p className="text-sm text-gray-600 mt-1">Welcome, {user.name}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Log out
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">SignalR Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {connectionStatus}
          </span>
          {signalRUserId && (
            <span className="text-gray-600">
              User ID: <code className="bg-gray-100 px-1 rounded text-xs">{signalRUserId}</code>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="userId" className="block font-semibold text-gray-700 mb-2">
                UserId
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. authenticated user's NameIdentifier"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <small className="text-gray-500 text-sm block mt-1">
                Click "Send Test" to send test data via SignalR
              </small>
            </div>

            <button
              type="button"
              onClick={handleSendTest}
              disabled={isLoading || !userId.trim()}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Test'}
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Response</h3>
            <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-auto text-sm font-mono min-h-[100px] whitespace-pre-wrap">
              {response}
            </pre>
          </div>
        </div>


      </div>
    </div>
  );
};

export default TestPanelPage;