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

// Update the validation function to check for the specific code "000000"
const validateConfirmationCode = (code: string): boolean => {
  return code === '000000';
};

// Update the MenuTitle component
const MenuTitle: React.FC<{
  title: string;
  onCancel: () => void;
  onExecute: () => void;
  showAdvanced?: boolean;
  onAdvanced?: () => void;
  isExecuteDisabled?: boolean;
  executeError?: string;
}> = ({ title, onCancel, onExecute, showAdvanced, onAdvanced, isExecuteDisabled, executeError }) => (
  <div className="text-sm font-medium p-2 border-b flex justify-between items-center">
    <span>{title}</span>
    <div className="flex space-x-3 items-center">
      {executeError && (
        <span className="text-[10px] text-red-500">{executeError}</span>
      )}
      {showAdvanced && (
        <button 
          onClick={onAdvanced}
          className="px-2 py-1 text-xs border border-gray-300 hover:bg-gray-50"
        >
          ADVANCED
        </button>
      )}
      <button 
        onClick={onCancel}
        className="px-2 py-1 text-xs border border-gray-300 hover:bg-gray-50 hover:text-white hover:bg-red-500 transition-colors"
      >
        CANCEL
      </button>
      <button 
        onClick={onExecute}
        disabled={isExecuteDisabled}
        className={`px-2 py-1 text-xs border border-gray-300 transition-colors ${
          isExecuteDisabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'hover:bg-black hover:text-white'
        }`}
      >
        EXECUTE
      </button>
    </div>
  </div>
);

// Add a PIN input component
const PinInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]$/.test(value || '')) {
      const newPin = Array.from(inputRefs.current).map((input, i) => 
        i === index ? value : (input?.value || '')
      ).join('');
      onChange(newPin);
      
      // Move to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  return (
    <div className="flex space-x-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={el => inputRefs.current[i] = el}
          type="text"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          className=" text-center  rounded text-xs "
        />
      ))}
    </div>
  );
};

const SelectableButtonGroup: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  multiSelect?: boolean;
}> = ({ label, value, options, onChange, multiSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showNumberInput, setShowNumberInput] = useState(false);
  const [timeValue, setTimeValue] = useState('24');
  const selectedValues = value.split('/').map(v => v.trim());

  const handleSelection = (option: string) => {
    if (option === 'HOUR' || option === 'DAY') {
      setShowNumberInput(true);
      onChange(`${timeValue} ${option}S`);
      return;
    }

    if (!multiSelect) {
      onChange(option);
      setShowNumberInput(false);
      setIsHovered(false);
      return;
    }

    let newValue: string[];
    if (selectedValues.includes(option)) {
      newValue = selectedValues.filter(v => v !== option);
    } else {
      newValue = [...selectedValues, option];
    }
    
    if (newValue.length > 0) {
      onChange(newValue.join(' /'));
    }
  };

  const handleTimeChange = (newValue: string) => {
    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue > 0) {
      setTimeValue(newValue);
      const unit = value.includes('HOUR') ? 'HOURS' : 'DAYS';
      onChange(`${newValue} ${unit}`);
    }
  };

  return (
    <div 
      className="p-2 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-[10px] text-gray-400 uppercase">{label}</div>
      <div className="text-xs ">{value}</div>
      
      {isHovered && (
        <div className="absolute top-0 left-0 w-full h-full p-2 bg-white flex flex-col justify-center items-center">
          {showNumberInput ? (
            <div className="flex p-0.5 bg-black rounded-[9px] justify-between items-center gap-0.5 h-full">
              <div className="bg-white h-full rounded-[7px]  flex items-center justify-center">
                <input
                  type="number"
                  value={timeValue}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full  px-1 py-1 text-center text-[10px] font-medium rounded-[7px] "
                  min="1"
                />
              </div>
              <div className="bg-white rounded-[7px] h-full w-full  flex items-center justify-center">
                <div className="text-black text-[10px] font-medium uppercase">
                  {value.includes('HOUR') ? 'HOURS' : 'DAYS'}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNumberInput(false);
                  setIsHovered(false);
                }}
                className=" h-full px-2   bg-red-500 text-white rounded-[7px] flex items-center justify-center"
              >
                <div className="text-center text-[10px] font-medium">
                  ✕
                </div>
              </button>
            </div>
          ) : (
            <div className="flex w-full p-0.5 bg-black rounded-[9px] justify-center items-center gap-0.5 h-full">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelection(option)}
                  className={`
                    w-full rounded-[7px] flex items-center h-full justify-center
                    ${selectedValues.includes(option) 
                      ? 'bg-white text-black border border-black/5' 
                      : 'bg-transparent text-white'}
                  `}
                >
                  <div className="text-center text-[10px] font-medium">
                    {option}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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

  // Function to render command interface
  const renderCommandInterface = () => (
    <div className=" h-full">
      {!selectedCommand ? (
        <div className=" mt-2 grid grid-cols-4 justify-items-center">
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
          

          <div className="flex-1">
            {selectedCommand === 'SYSTEM_STATUS' && (
              <div className="flex flex-col h-full">
                <MenuTitle 
                  title="SYSTEM STATUS"
                  onCancel={() => {
                    setSelectedCommand('');
                    setCommandParams({});
                  }}
                  onExecute={addCommand}
                />
                
                <div className="flex border-b ">
                  {[
                    { num: '1.', label: 'ALL' },
                    { num: '2.', label: 'POWER' },
                    { num: '3.', label: 'THERMAL' },
                    { num: '4.', label: 'COMMS' },
                    { num: '5.', label: 'INSTRUMENTS' }
                  ].map((item) => (
                    <div
                      key={item.label}
                      onClick={() => setCommandParams({ component: item.label.toLowerCase() })}
                      className={`
                        flex-1 p-2 cursor-pointer border-r last:border-r-0
                        ${commandParams.component === item.label.toLowerCase() 
                          ? 'bg-gray-100' 
                          : 'hover:bg-gray-50'}
                      `}
                    >
                      <div className="text-[10px] text-gray-500">{item.num}</div>
                      <div className="text-xs font-semibold">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex-grow"></div>
              </div>
            )}

            {selectedCommand === 'SYSTEM_DIAGNOSTICS' && (
              <div className="flex flex-col h-full">
                <MenuTitle 
                  title="SYSTEM DIAGNOSTICS"
                  onCancel={() => {
                    setSelectedCommand('');
                    setCommandParams({});
                  }}
                  onExecute={addCommand}
                />
                
                <div className="flex border-b">
                  {[
                    { num: '1.', label: 'BASIC', time: '30s' },
                    { num: '2.', label: 'ADVANCED', time: '120s' },
                    { num: '3.', label: 'FULL', time: '300s' }
                  ].map((item) => (
                    <div
                      key={item.label}
                      onClick={() => setCommandParams(prev => ({ 
                        ...prev, 
                        level: item.label.toLowerCase(),
                        timeout: item.time.replace('s', '') 
                      }))}
                      className={`
                        flex-1 p-2 cursor-pointer border-r last:border-r-0
                        ${commandParams.level === item.label.toLowerCase() 
                          ? 'bg-gray-100' 
                          : 'hover:bg-gray-50'}
                      `}
                    >
                      <div className="text-[10px] text-gray-500">{item.num}</div>
                      <div className="text-xs font-semibold">{item.label}</div>
                      <div className="text-[10px] text-gray-500 mt-1">{item.time}</div>
                    </div>
                  ))}
                </div>

                <div className="flex-grow"></div>
              </div>
            )}

            {selectedCommand === 'DATA_CAPTURE' && (
              <div className="flex flex-col h-full">
                <MenuTitle 
                  title="DATA CAPTURE"
                  onCancel={() => {
                    setSelectedCommand('');
                    setCommandParams({});
                  }}
                  onExecute={addCommand}
                  showAdvanced={true}
                  onAdvanced={() => {
                    console.log('Advanced settings clicked');
                  }}
                />

                <div className="grid grid-cols-3 border-b">
                  <div className="p-2 border-r">
                    <div className="text-[10px] text-gray-400 uppercase">LONGITUDE</div>
                    <input
                      type="text"
                      value={commandParams.longitude ?? ''}
                      placeholder="-90.3456°W"
                      onChange={(e) => setCommandParams(prev => ({ 
                        ...prev, 
                        longitude: e.target.value 
                      }))}
                      className="w-full text-xs mt-1 focus:outline-none"
                    />
                  </div>

                  <div className="p-2 border-r">
                    <div className="text-[10px] text-gray-400 uppercase">LATITUDE</div>
                    <input
                      type="text"
                      value={commandParams.latitude ?? ''}
                      placeholder="35.7865°N"
                      onChange={(e) => setCommandParams(prev => ({ 
                        ...prev, 
                        latitude: e.target.value 
                      }))}
                      className="w-full text-xs mt-1 focus:outline-none"
                    />
                  </div>

                  <SelectableButtonGroup
                    label="DURATION"
                    value={commandParams.duration || 'FULL'}
                    options={['HOUR', 'DAY', 'FULL']}
                    onChange={(value) => setCommandParams(prev => ({ ...prev, duration: value }))}
                    multiSelect={false}
                  />
                </div>

                <div className="flex flex-row ">
                  <div className="w-1/3 border-r">
                  <SelectableButtonGroup
                    label="SENSOR"
                    value={commandParams.sensor || 'OPTICAL /RADAR'}
                    options={['OPTICAL', 'RADAR']}
                    onChange={(value) => setCommandParams(prev => ({ ...prev, sensor: value }))}
                    multiSelect={true}
                  />
                  </div>

                  <div className="p-2 w-2/3">
                    <div className="text-[10px] text-gray-400 uppercase w-full flex justify-between">
                      ZOOM <span className="ml-auto text-black">{commandParams.zoom || '19'}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={commandParams.zoom || '19'}
                        onChange={(e) => setCommandParams(prev => ({ 
                          ...prev, 
                          zoom: e.target.value 
                        }))}
                        className="w-full h-[2px] bg-gray-200 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedCommand === 'SYSTEM_REBOOT' && (
              <div className="flex flex-col h-full">
                <MenuTitle 
                  title="REBOOT"
                  onCancel={() => {
                    setSelectedCommand('');
                    setCommandParams({});
                  }}
                  onExecute={addCommand}
                  isExecuteDisabled={!validateConfirmationCode(commandParams.confirmCode)}
                  executeError={
                    commandParams.confirmCode && !validateConfirmationCode(commandParams.confirmCode)
                      ? 'Invalid confirmation code'
                      : undefined
                  }
                />

                <div className="grid grid-cols-2 border-b">
                  <div className="p-2 border-r">
                    <div className="text-[10px] text-gray-400 uppercase mb-2">ENTER MISSION ID</div>
                    <input
                      type="text"
                      value={commandParams.missionId ?? ''}
                      placeholder="E0.SSO.43567.H.2D"
                      onChange={(e) => setCommandParams(prev => ({ 
                        ...prev, 
                        missionId: e.target.value 
                      }))}
                      className="w-full text-xs focus:outline-none"
                    />
                  </div>

                  <div className="p-2">
                    <div className="text-[10px] text-gray-400 uppercase mb-2">
                      ENTER CONFIRMATION CODE
                    </div>
                    <PinInput
                      value={commandParams.confirmCode || ''}
                      onChange={(value) => setCommandParams(prev => ({ ...prev, confirmCode: value }))}
                    />
                  </div>
                </div>

                <div className="p-1">
                  <div className="flex items-start space-x-2">
                    <div>
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase">
                      SYSTEM REBOOT WILL TERMINATE ALL ACTIVE OPERATIONS
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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