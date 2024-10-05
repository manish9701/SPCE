import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Command {
  id: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  description: string;
  parameters?: Record<string, string>;
}

interface CommandType {
  name: string;
  displayName: string;
  params: Record<string, 'string' | 'number'>;
}

const availableCommands: CommandType[] = [
  { name: 'SYSTEM_STATUS', displayName: 'System Status', params: {} },
  { name: 'SYSTEM_DIAGNOSTICS', displayName: 'System Diagnostics', params: {} },
  { name: 'DATA_CAPTURE', displayName: 'Data Capture', params: { duration: 'number', resolution: 'string' } },
  { name: 'DATA_TRANSFER', displayName: 'Data Transfer', params: { destination: 'string' } },
  { name: 'EMERGENCY_COMMAND', displayName: 'Emergency Command', params: { code: 'string' } },
  { name: 'ORBIT_ADJUST', displayName: 'Orbit Adjust', params: { deltaV: 'number', direction: 'string' } },
];

const SatelliteCommandInterface: React.FC = () => {
  const [commands, setCommands] = useState<Command[]>([]);
  const [showCommandOptions, setShowCommandOptions] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<string>('');
  const [commandParams, setCommandParams] = useState<Record<string, string>>({});
  const [runningCommandTime, setRunningCommandTime] = useState(0);
  const commandContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commandContainerRef.current) {
      commandContainerRef.current.scrollTop = commandContainerRef.current.scrollHeight;
    }
  }, [commands]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCommands(prevCommands => prevCommands.map(cmd => {
        if (cmd.status === 'queued') return { ...cmd, status: 'running' };
        if (cmd.status === 'running') return { ...cmd, status: 'completed' };
        return cmd;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: number;
    if (commands.some(cmd => cmd.status === 'running')) {
      timer = window.setInterval(() => {
        setRunningCommandTime(prev => prev + 1);
      }, 1000);
    } else {
      setRunningCommandTime(0);
    }
    return () => clearInterval(timer);
  }, [commands]);

  const addCommand = useCallback(() => {
    const newCommand: Command = {
      id: Date.now().toString(),
      type: selectedCommand,
      status: 'queued',
      description: `Executing ${selectedCommand}`,
      parameters: commandParams,
    };
    setCommands(prevCommands => [...prevCommands, newCommand]);
    setSelectedCommand('');
    setCommandParams({});
    setShowCommandOptions(false);
  }, [selectedCommand, commandParams]);

  const terminateCommand = useCallback(() => {
    setCommands(prevCommands => prevCommands.map(cmd => 
      cmd.status === 'running' ? { ...cmd, status: 'failed' } : cmd
    ));
  }, []);

  const getCommandStats = useCallback(() => ({
    total: commands.length,
    queued: commands.filter(cmd => cmd.status === 'queued').length,
    running: commands.filter(cmd => cmd.status === 'running').length,
    completed: commands.filter(cmd => cmd.status === 'completed').length,
  }), [commands]);

  const commandStats = getCommandStats();
  const runningCommand = commands.find(cmd => cmd.status === 'running');
  const queuedCommands = commands.filter(cmd => cmd.status === 'queued');

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border rounded-sm bg-white text-black flex flex-col h-full">
      {/* Header */}
      <div className="p-2 border-b border-gray-200 flex flex-row justify-between items-center">
        <span className="font-semibold text-sm">SATELLITE COMMAND INTERFACE <span className="text-xs font-light">v1.0</span></span>
        
        <div className="flex space-x-2 text-[10px]">
          <span>Total: {commandStats.total}</span>
          <span>Completed: {commandStats.completed}</span>
        </div>
      </div>
      
      {/* Command options and parameters */}
      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="p-2">
          {showCommandOptions ? (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm text-gray-700">Available Commands</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowCommandOptions(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableCommands.map(cmd => (
                  <button
                    key={cmd.name}
                    className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200"
                    onClick={() => setSelectedCommand(cmd.name)}
                  >
                    {cmd.displayName}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            selectedCommand && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2 text-gray-700">
                  {availableCommands.find(cmd => cmd.name === selectedCommand)?.displayName} Parameters
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(availableCommands.find(cmd => cmd.name === selectedCommand)?.params || {}).map(([key, type]) => (
                    <div key={key} className="flex flex-col">
                      <label className="text-xs text-gray-600">{key}</label>
                      <input
                        type={type === 'number' ? 'number' : 'text'}
                        className="text-xs border rounded px-1 py-0.5"
                        value={commandParams[key] || ''}
                        onChange={(e) => setCommandParams(prev => ({ ...prev, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                <button 
                  className="mt-2 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  onClick={addCommand}
                >
                  Execute Command
                </button>
              </div>
            )
          )}
        </div>
        
        {/* Command queue */}
        <div className="flex-grow overflow-y-auto p-2">
          {queuedCommands.length > 0 ? (
            <>
              <h3 className="font-semibold text-sm mb-2 text-gray-700">Command Queue</h3>
              <div ref={commandContainerRef} className="text-[10px] font-mono space-y-1">
                {queuedCommands.map((command) => (
                  <div key={command.id} className="p-2 rounded bg-yellow-50">
                    <span className="text-gray-500">[{new Date(parseInt(command.id)).toISOString().split('T')[1].split('.')[0]}]</span>
                    <span className="ml-1 text-yellow-700">{command.type}</span>
                    {command.parameters && Object.entries(command.parameters).map(([key, value]) => (
                      <span key={key} className="ml-2 text-gray-600">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </>
          ) : !showCommandOptions && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm text-gray-500 mb-2">No queued commands</p>
              <button 
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                onClick={() => setShowCommandOptions(true)}
              >
                Add New Command
              </button>
            </div>
          )}
        </div>
        
        {/* Running command */}
        {runningCommand && (
          <div className="mt-auto bg-gray-50 p-0 border-t border-gray-200">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-blue-500 flex items-center justify-center rounded-full">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <span className="font-semibold text-sm text-gray-700">
                  {runningCommand.type}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-600">{formatTime(runningCommandTime)}</span>
                <button
                  className="text-red-500 hover:text-red-600 focus:outline-none"
                  onClick={terminateCommand}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SatelliteCommandInterface;