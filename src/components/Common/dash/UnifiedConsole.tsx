import React, { useState, useEffect, useRef, useCallback } from 'react';

// Interface for log entries
interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'command';
}

// Interface for commands
interface Command {
  id: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  description: string;
  parameters?: Record<string, string>;
}

// Interface for command types
interface CommandType {
  name: string;
  displayName: string;
  params: Record<string, 'string' | 'number'>;
}

const MAX_LOGS = 100;

// Available commands
const availableCommands: CommandType[] = [
  { 
    name: 'SYSTEM_STATUS', 
    displayName: 'System Status', 
    params: {
      component: 'string' // Options: 'all', 'power', 'thermal', 'comms', 'payload'
    }
  },
  { 
    name: 'SYSTEM_DIAGNOSTICS', 
    displayName: 'Diagnostics', 
    params: {
      level: 'string', // Options: 'basic', 'advanced', 'full'
      timeout: 'number' // Seconds
    }
  },
  { 
    name: 'DATA_CAPTURE', 
    displayName: 'Data Capture', 
    params: {
      latitude: 'number',
      longitude: 'number',
      duration: 'number',
      resolution: 'string', // Options: 'low', 'medium', 'high'
      zoom: 'number' // 1-10
    }
  },
  { 
    name: 'SYSTEM_REBOOT', 
    displayName: 'Reboot', 
    params: {
      confirmCode: 'string', // Required safety code
      mode: 'string' // Options: 'soft', 'hard'
    }
  }
];

const UnifiedConsole: React.FC = () => {
  // State for logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isScrollable, setIsScrollable] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // State for commands
  const [commands, setCommands] = useState<Command[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<string>('');
  const [commandParams, setCommandParams] = useState<Record<string, string>>({});
  const [runningCommandTime, setRunningCommandTime] = useState(0);
  const commandContainerRef = useRef<HTMLDivElement>(null);

  // Initialize console
  useEffect(() => {
    const initSystem = () => {
      addLog('System initialized. Welcome to SatelliteOS v1.0.', 'info');
      addLog('Type "help" for available commands.', 'info');
    };
    
    initSystem();
  }, []);

  // Function to add a log entry
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    setLogs(prevLogs => {
      const newLogs = [...prevLogs, { timestamp, message, type }];
      return newLogs.slice(-MAX_LOGS);
    });
  }, []);

  // Function to get log statistics
  const getLogStats = () => ({
    total: logs.length,
    warning: logs.filter(log => log.type === 'warning').length,
    error: logs.filter(log => log.type === 'error').length,
    command: logs.filter(log => log.type === 'command').length,
  });

  // Function to check if content is scrollable
  const checkScrollable = useCallback(() => {
    if (containerRef.current && contentRef.current) {
      const isContentScrollable = contentRef.current.scrollHeight > containerRef.current.clientHeight;
      setIsScrollable(isContentScrollable);
      
      // If scrollable and new content added, scroll to bottom
      if (isContentScrollable) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }
  }, []);

  // Effect to check scrollable state when logs change
  useEffect(() => {
    checkScrollable();
  }, [logs, checkScrollable]);

  // Effect to check scrollable state on resize
  useEffect(() => {
    const handleResize = () => checkScrollable();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollable]);

  // Function to add a command
  const addCommand = useCallback(() => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const newCommand: Command = {
      id: Date.now().toString(),
      type: selectedCommand,
      status: 'queued',
      description: `Executing ${selectedCommand}`,
      parameters: commandParams,
    };
    setCommands(prevCommands => [...prevCommands, newCommand]);
    addLog(`Command queued: ${selectedCommand}`, 'command');
    setSelectedCommand('');
    setCommandParams({});
  }, [selectedCommand, commandParams, addLog]);

  // Function to terminate a running command
  const terminateCommand = useCallback(() => {
    setCommands(prevCommands => prevCommands.map(cmd => {
      if (cmd.status === 'running') {
        addLog(`Command terminated: ${cmd.type}`, 'error');
        return { ...cmd, status: 'failed' };
      }
      return cmd;
    }));
  }, [addLog]);

  // Effect to process commands
  useEffect(() => {
    const interval = setInterval(() => {
      setCommands(prevCommands => prevCommands.map(cmd => {
        if (cmd.status === 'queued') {
          addLog(`Command started: ${cmd.type}`, 'info');
          return { ...cmd, status: 'running' };
        }
        if (cmd.status === 'running') {
          addLog(`Command completed: ${cmd.type}`, 'success');
          return { ...cmd, status: 'completed' };
        }
        return cmd;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [addLog]);

  // Effect to track running command time
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

  // Function to format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to get command statistics
  const getCommandStats = useCallback(() => ({
    total: commands.length,
    queued: commands.filter(cmd => cmd.status === 'queued').length,
    running: commands.filter(cmd => cmd.status === 'running').length,
    completed: commands.filter(cmd => cmd.status === 'completed').length,
  }), [commands]);

  const commandStats = getCommandStats();
  const logStats = getLogStats();
  const runningCommand = commands.find(cmd => cmd.status === 'running');
  const queuedCommands = commands.filter(cmd => cmd.status === 'queued');

  // Effect to add scroll effect for logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Effect to add scroll effect for commands
  useEffect(() => {
    if (commandContainerRef.current) {
      commandContainerRef.current.scrollTop = commandContainerRef.current.scrollHeight;
    }
  }, [commands]);

  // Component for console header
  const ConsoleHeader = () => (
    <div className="h-8 min-h-[32px] border-b border-gray-200 p-2 flex items-center justify-between shrink-0">
      <div className="flex items-center">
        <span className="font-semibold text-sm">
          SATELLITE CONSOLE <span className="text-xs font-light">v1.0</span>
        </span>
      </div>
      <div className="flex space-x-2 text-[10px]">
        <span>Total: {logStats.total}</span>
        <span>Warn: {logStats.warning}</span>
        <span>Err: {logStats.error}</span>
        <span>Cmd: {logStats.command}</span>
      </div>
    </div>
  );

  // Function to render logs
  const renderLogs = () => (
    <div 
      ref={contentRef}
      className="p-2 text-[10px] font-light absolute w-full"
    >
      {logs.map((log, index) => (
        <div key={index} className="mb-1">
          [{log.timestamp}] {log.type.toUpperCase()}: {log.message}
        </div>
      ))}
    </div>
  );

  // Separate Button Component using DataDisplay layout
  const CommandButton = ({ 
    label,
    value,
    variant = 'primary',
    onClick,
    isReboot = false
  }: { 
    label: string,
    value: string,
    variant?: 'primary' | 'danger' | 'secondary',
    onClick: () => void,
    isReboot?: boolean
  }) => {
    const baseStyles = "px-3 py-1.5 rounded-md transition-colors duration-200";
    const variantStyles = {
      primary: "bg-blue-500 hover:bg-blue-600",
      danger: "bg-red-500 hover:bg-red-600",
      secondary: "bg-gray-800 hover:bg-gray-700"
    };

    return (
      <button 
        className={`${baseStyles} ${variantStyles[variant]}`}
        onClick={onClick}
      >
        <div className='flex flex-col justify-between'>
          <div className={`text-[10px] font-normal ${isReboot ? 'text-white' : 'text-gray-500'}`}>
            {label}
          </div>
          <div className="flex items-center">
            <span className={`text-base font-semibold uppercase mr-2 ${isReboot ? 'text-white' : 'text-gray-500'}`}>
              {value}
            </span>
          </div>
        </div>
      </button>
    );
  };

  // Update the renderCommandButtons function
  const renderCommandButtons = () => (
    <div className="mt-3 flex justify-center space-x-4">
      <CommandButton
        label="Cancel Operation"
        value="Cancel"
        variant="secondary"
        onClick={() => {
          setSelectedCommand('');
          setCommandParams({});
        }}
      />
      <CommandButton
        label={selectedCommand === 'SYSTEM_REBOOT' ? 'Confirm Reboot' : 'Execute Command'}
        value="Execute"
        variant={selectedCommand === 'SYSTEM_REBOOT' ? 'danger' : 'primary'}
        onClick={addCommand}
        isReboot={selectedCommand === 'SYSTEM_REBOOT'}
      />
    </div>
  );

  // Function to render command interface
  const renderCommandInterface = () => (
    <div className="py-2 h-full">
      {!selectedCommand ? (
        <div className="grid grid-cols-4 justify-items-center">
          {availableCommands.map((cmd, index) => (
            <div
              key={cmd.name}
              className={`
                flex flex-col flex-grow p-2 border-y w-full
                ${index % 4 !== 3 ? 'border-r' : ''}
                ${cmd.name === 'SYSTEM_REBOOT' ? 'bg-[#FF0000] text-white' : 'bg-white text-black'}
                transition-colors duration-200
                hover:bg-gray-100 cursor-pointer
              `}
              onClick={() => setSelectedCommand(cmd.name)}
            >
              <div className={`text-[10px] font-normal ${cmd.name === 'SYSTEM_REBOOT' ? 'text-white' : 'text-gray-500'}`}>
                {index + 1}.
              </div>
              <span className='text-xs font-semibold uppercase'>{cmd.displayName}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-300">
                {availableCommands.find(cmd => cmd.name === selectedCommand)?.displayName}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedCommand('');
                setCommandParams({});
              }}
              className="text-gray-500 hover:text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedCommand === 'SYSTEM_STATUS' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'power', 'thermal', 'comms', 'payload'].map(component => (
                    <div
                      key={component}
                      onClick={() => setCommandParams({ component })}
                      className={`
                        cursor-pointer
                        ${commandParams.component === component 
                          ? 'bg-blue-500/10 border-blue-500/50' 
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}
                        border rounded-md p-2
                        transition-colors duration-200
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[0.65rem] font-medium">
                          {component.toUpperCase()}
                        </span>
                        {commandParams.component === component && (
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500/50 rounded-full"
                            style={{ width: `${Math.random() * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {commandParams.component && (
                  <div className="bg-gray-800/50 rounded-md p-2 border border-gray-700">
                    <div className="text-[0.65rem] text-gray-400 mb-2">
                      System Metrics
                    </div>
                    <div className="space-y-1.5">
                      {['CPU Usage', 'Memory', 'Temperature', 'Power Draw'].map(metric => (
                        <div key={metric} className="flex items-center justify-between">
                          <span className="text-[0.6rem] text-gray-500">{metric}</span>
                          <span className="text-[0.6rem] text-gray-300">
                            {Math.floor(Math.random() * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedCommand === 'SYSTEM_DIAGNOSTICS' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {['basic', 'advanced', 'full'].map(level => (
                    <div
                      key={level}
                      onClick={() => setCommandParams(prev => ({ ...prev, level }))}
                      className={`
                        cursor-pointer
                        ${commandParams.level === level 
                          ? 'bg-blue-500/10 border-blue-500/50' 
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}
                        border rounded-md p-2
                        transition-colors duration-200
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[0.65rem] font-medium">
                          {level.toUpperCase()}
                        </span>
                        {commandParams.level === level && (
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-800/50 rounded-md p-2 border border-gray-700">
                  <div className="text-[0.65rem] text-gray-400 mb-2">
                    Timeout Duration
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="30"
                    value={commandParams.timeout || 0}
                    onChange={(e) => setCommandParams(prev => ({ 
                      ...prev, 
                      timeout: e.target.value 
                    }))}
                    className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="mt-1 text-right">
                    <span className="text-[0.6rem] text-gray-400">
                      {commandParams.timeout || 0}s
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedCommand === 'DATA_CAPTURE' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-800/50 rounded-md p-2 border border-gray-700">
                    <div className="text-[0.65rem] text-gray-400 mb-2">Location</div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[0.6rem] text-gray-500">Latitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={commandParams.latitude || ''}
                          onChange={(e) => setCommandParams(prev => ({ 
                            ...prev, 
                            latitude: e.target.value 
                          }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded-sm px-2 py-1 text-[0.65rem]"
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] text-gray-500">Longitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={commandParams.longitude || ''}
                          onChange={(e) => setCommandParams(prev => ({ 
                            ...prev, 
                            longitude: e.target.value 
                          }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded-sm px-2 py-1 text-[0.65rem]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-md p-2 border border-gray-700">
                    <div className="text-[0.65rem] text-gray-400 mb-2">Capture Settings</div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[0.6rem] text-gray-500">Duration (s)</label>
                        <input
                          type="number"
                          min="1"
                          max="3600"
                          value={commandParams.duration || ''}
                          onChange={(e) => setCommandParams(prev => ({ 
                            ...prev, 
                            duration: e.target.value 
                          }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded-sm px-2 py-1 text-[0.65rem]"
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] text-gray-500">Zoom Level (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={commandParams.zoom || 1}
                          onChange={(e) => setCommandParams(prev => ({ 
                            ...prev, 
                            zoom: e.target.value 
                          }))}
                          className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
                        />
                        <div className="text-right text-[0.6rem] text-gray-400">
                          {commandParams.zoom || 1}x
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-md p-2 border border-gray-700">
                  <div className="text-[0.65rem] text-gray-400 mb-2">Resolution</div>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map(res => (
                      <div
                        key={res}
                        onClick={() => setCommandParams(prev => ({ ...prev, resolution: res }))}
                        className={`
                          cursor-pointer
                          ${commandParams.resolution === res 
                            ? 'bg-blue-500/10 border-blue-500/50' 
                            : 'bg-gray-900 border-gray-700 hover:border-gray-600'}
                          border rounded-sm p-1.5
                          transition-colors duration-200
                          text-center
                        `}
                      >
                        <span className="text-[0.65rem] font-medium">
                          {res.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedCommand === 'SYSTEM_REBOOT' && (
              <div className="space-y-3">
                <div className="bg-red-500/10 rounded-md p-3 border border-red-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[0.7rem] font-medium text-red-500">
                      Warning: This action cannot be undone
                    </span>
                  </div>
                  <p className="text-[0.65rem] text-gray-400">
                    System reboot will terminate all active operations and may cause data loss.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-800/50 rounded-md p-2 border border-gray-700">
                    <div className="text-[0.65rem] text-gray-400 mb-2">Reboot Mode</div>
                    <div className="space-y-1">
                      {['soft', 'hard'].map(mode => (
                        <div
                          key={mode}
                          onClick={() => setCommandParams(prev => ({ ...prev, mode }))}
                          className={`
                            cursor-pointer
                            ${commandParams.mode === mode 
                              ? 'bg-red-500/10 border-red-500/50' 
                              : 'bg-gray-900 border-gray-700 hover:border-gray-600'}
                            border rounded-sm p-1.5
                            transition-colors duration-200
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[0.65rem] font-medium">
                              {mode.toUpperCase()}
                            </span>
                            {commandParams.mode === mode && (
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-md p-2 border border-gray-700">
                    <div className="text-[0.65rem] text-gray-400 mb-2">Safety Code</div>
                    <input
                      type="text"
                      placeholder="Enter confirmation code"
                      value={commandParams.confirmCode || ''}
                      onChange={(e) => setCommandParams(prev => ({ 
                        ...prev, 
                        confirmCode: e.target.value 
                      }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-sm px-2 py-1 text-[0.65rem]"
                    />
                    <div className="mt-1 text-[0.6rem] text-gray-500">
                      Code format: REBOOT-XXXXXX
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {renderCommandButtons()}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full grid grid-cols-2 gap-2">
      {/* Console - Left Side */}
      <div className="border rounded-sm bg-white text-black flex flex-col h-full">
        {/* Header */}
        <ConsoleHeader />

        {/* Logs - Scrollable Container */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto scrollbar-thin relative"
        >
          {renderLogs()}
          
          {isScrollable && (
            <div className="absolute right-1 bottom-1 bg-gray-800 text-white text-[10px] px-1 rounded-sm opacity-50">
              Scroll for more
            </div>
          )}
        </div>
      </div>

      {/* Command Interface - Right Side */}
      <div className="border rounded-sm bg-white text-black flex flex-col h-full">
        <div className="h-8 min-h-[32px] border-b border-gray-200 p-2 flex items-center justify-between shrink-0">
          <span className="font-semibold text-sm">
            SATELLITE COMMAND INTERFACE <span className="text-xs font-light">v1.0</span>
          </span>
          <div className="flex space-x-2 text-[10px]">
            <span>Total: {commandStats.total}</span>
            <span>Completed: {commandStats.completed}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-hidden scrollbar-thin">
            {renderCommandInterface()}
          </div>

          {/* Running Command Section */}
          {runningCommand && (
            <div className="border-t border-gray-200 bg-gray-50 p-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4">
                    <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
    </div>
  );
};

export default UnifiedConsole; 