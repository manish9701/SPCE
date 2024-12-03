import React, { useState, useEffect, useRef } from 'react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'command';
}

const MAX_LOGS = 100;


const Console: React.FC<{ height?: string }> = ({ height = 'h-32' }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    addLog('System initialized. Welcome to SatelliteOS v1.0.', 'info');
    addLog('Type "help" for available commands.', 'info');
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs(prevLogs => {
      const newLogs = [...prevLogs, { timestamp, message, type }];
      return newLogs.slice(-MAX_LOGS);
    });
  };

  const getLogStats = () => ({
    total: logs.length,
    warning: logs.filter(log => log.type === 'warning').length,
    error: logs.filter(log => log.type === 'error').length,
    command: logs.filter(log => log.type === 'command').length,
  });

  const handleAddTestLog = () => {
    const types: LogEntry['type'][] = ['info', 'warning', 'error', 'success', 'command'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    addLog(`Test log entry of type: ${randomType}`, randomType);
  };

  const logStats = getLogStats();

  return (
    <div className="border rounded-sm bg-white text-black flex flex-col">
      <div className="p-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm">SATELLITE CONSOLE <span className="text-xs font-light">v1.0</span></span>
          <button 
            className="h-4 w-4 bg-gray-200 cursor-pointer hover:bg-gray-300 rounded"
            onClick={handleAddTestLog}
            title="Add test log"
          >+</button>
        </div>
        <div className="flex space-x-2 text-[10px]">
          <span>Total: {logStats.total}</span>
          <span>Warn: {logStats.warning}</span>
          <span>Err: {logStats.error}</span>
          <span>Cmd: {logStats.command}</span>
        </div>
      </div>
      <div className="overflow-hidden">
        <div 
          ref={logContainerRef}
          className={`p-2 text-[10px] font-mono overflow-y-auto ${height}`}
        >
          {logs.map((log, index) => (
            <div key={index} className="mb-1">
              [{log.timestamp}] {log.type.toUpperCase()}: {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Console;
