import React, { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { addDays, addMonths, addYears, differenceInDays, startOfToday } from 'date-fns';

interface CalenderProps {
    onChange: (dateRange: DateRange | undefined) => void;
    value: DateRange | undefined;
    disabled: boolean;
    onDisabledClick: () => void;
}

const Calender: React.FC<CalenderProps> = ({ onChange, value, disabled, onDisabledClick }) => {
    const [durationValues, setDurationValues] = useState({ days: 0, months: 0, years: 0 });
    const [month, setMonth] = useState<Date>(startOfToday());
    const today = startOfToday();

    const handleDurationChange = (type: 'days' | 'months' | 'years', inputValue: number) => {
        if (disabled) {
            onDisabledClick();
            return;
        }
        const newDurationValues = { ...durationValues, [type]: inputValue };
        setDurationValues(newDurationValues);
        updateDateRange(newDurationValues);
    };

    const updateDateRange = (newDuration: typeof durationValues) => {
        if (value?.from) {
            const to = addYears(
                addMonths(
                    addDays(value.from, newDuration.days),
                    newDuration.months
                ),
                newDuration.years
            );
            onChange({ from: value.from, to });
        }
    };

    const handleReset = () => {
        if (disabled) {
            onDisabledClick();
            return;
        }
        onChange(undefined);
        setDurationValues({ days: 0, months: 0, years: 0 });
        setMonth(startOfToday());
    };

    useEffect(() => {
        if (value?.from && value?.to) {
            const totalDays = differenceInDays(value.to, value.from) + 1; // Add 1 to include both start and end dates
            const years = Math.floor(totalDays / 365);
            const remainingDays = totalDays % 365;
            const months = Math.floor(remainingDays / 30);
            const days = remainingDays % 30;

            setDurationValues({ days, months, years });
        } else {
            setDurationValues({ days: 0, months: 0, years: 0 });
        }
    }, [value]);

    return (
        <div className="flex flex-col items-center w-full">
            <h2 className="text-lg font-semibold mb-4">Select Rental Period</h2>
            <div className="flex flex-row items-start w-full">
                <div className="mr-4 flex-1">
                    <DayPicker
                        mode="range"
                        selected={value}
                        onSelect={(newValue) => {
                            if (!disabled) {
                                onChange(newValue);
                                if (newValue?.from) {
                                    setMonth(newValue.from);
                                }
                            }
                        }}
                        disabled={{ before: today, ...(disabled ? { after: today } : {}) }}
                        fromDate={today}
                        toDate={addYears(today, 10)}
                        month={month}
                        onMonthChange={setMonth}
                        numberOfMonths={1}
                        className={`border border-gray-300 rounded p-2 ${disabled ? 'opacity-50' : ''}`}
                    />
                    {!value && <p className="text-sm text-gray-600 mt-2">* Select a start date on the calendar</p>}
                    {value && value.from && (
                        <p className="mt-2 text-sm text-gray-600">
                            Selected range: {value.from.toDateString()} 
                            {value.to ? ` to ${value.to.toDateString()}` : ''}
                        </p>
                    )}
                </div>
                <div className="flex flex-col flex-1">
                    <div className="flex flex-col space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                            <input
                                type="number"
                                value={durationValues.days}
                                onChange={(e) => handleDurationChange('days', Math.max(0, parseInt(e.target.value) || 0))}
                                className={`border border-gray-300 rounded px-2 py-1 w-16 mr-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                min="0"
                                disabled={disabled}
                            />
                            <span className="text-sm">Days</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <input
                                type="number"
                                value={durationValues.months}
                                onChange={(e) => handleDurationChange('months', Math.max(0, parseInt(e.target.value) || 0))}
                                className={`border border-gray-300 rounded px-2 py-1 w-16 mr-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                min="0"
                                disabled={disabled}
                            />
                            <span className="text-sm">Months</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <input
                                type="number"
                                value={durationValues.years}
                                onChange={(e) => handleDurationChange('years', Math.max(0, parseInt(e.target.value) || 0))}
                                className={`border border-gray-300 rounded px-2 py-1 w-16 mr-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                min="0"
                                disabled={disabled}
                            />
                            <span className="text-sm">Years</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleReset} 
                        className={`px-3 py-1 bg-red-500 text-white rounded text-sm w-full ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                        disabled={disabled}
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Calender;
