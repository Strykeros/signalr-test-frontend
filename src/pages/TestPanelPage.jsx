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
      }

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 w-auto">
        <div className="flex justify-center items-center mb-4 flex-col lg:flex-row">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TestPanel API Tester</h1>
            {user && (
              <p className="text-md text-gray-600 mt-1">Welcome, {user.name}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            type='button'
            className="lg:ml-7 px-3 py-1 text-white bg-red-600 text-md rounded-lg"
          >
            Log out
          </button>
        </div>

        <div className="flex items-center justify-center gap-1 text-md flex-col lg:flex-row">
          <div className="flex flex-col lg:flex-row">
            <span className="text-gray-600 lg:mr-5">SignalR Status:</span>
            <span className={`lg:mr-5 px-2 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
              {connectionStatus}
            </span>
          </div>

          {signalRUserId && (
            <div className="flex flex-col lg:flex-row">
              <span className="text-gray-600 lg:mr-5">
                User ID:
              </span>
              <span>
                <code className="text-black px-1 rounded text-sm">{signalRUserId}</code>
              </span>
            </div>

          )}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Test Controls</h2>

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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
              />
              <small className="text-gray-500 text-sm block mt-1">
                Click "Send Test" to send test data via SignalR
              </small>
            </div>

            <button
              type="button"
              onClick={handleSendTest}
              disabled={isLoading || !userId.trim()}
              className="w-full px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Test'}
            </button>
          </div>


        </div>


      </div>
    </div>
  );
};

export default TestPanelPage;