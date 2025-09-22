import { useEffect } from 'react';
import { useSignalR } from '../hooks/signalrHook';

const IndexPage = () => {
  const API_BASE_URL = 'https://localhost:7132';
  const {
    connectionStatus,
    userInfo, 
    messages,
    startConnection
  } = useSignalR(API_BASE_URL+'/chathub');

  // Auto-connect when component mounts
  useEffect(() => {
    startConnection();
  }, [startConnection]);

  const getStatusTextColor = () => {
    return connectionStatus.toLowerCase().includes('connected') 
      ? 'text-green-600 font-bold' 
      : 'text-red-600 font-bold';
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

      <div className="py-2 sm:py-4">
        <hr className="border-gray-300" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 py-2 sm:py-4">
        
        <div className="lg:col-span-3 order-2 lg:order-1">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              SignalR Messages ({messages.length})
            </h2>

            <div className="h-64 sm:h-80 lg:h-96 overflow-y-auto space-y-2">
              {messages.length === 0 ? (
                <div className="text-gray-500 text-center py-8 text-sm sm:text-base">
                  No messages yet...
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="bg-gray-50 rounded-lg p-2 sm:p-3 text-sm">
                    <div className="text-xs text-gray-500 mb-1 break-words">
                      #{message.id} - {message.type} - {message.timestamp}
                    </div>
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto break-words">
                      {JSON.stringify(message.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
            <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
              Connection Status
            </h5>
            
            <div className="space-y-3">
              <div className={`text-sm ${getStatusTextColor()}`}>
                {connectionStatus}
              </div>
              
              {userInfo && (
                <div className="pt-2 border-t border-gray-200">

                  <div className="font-mono text-black text-xs px-2 py-1 rounded break-all">
                    {userInfo}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;