import React, { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { addDays, addMonths, addYears, differenceInDays, startOfToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface CalenderProps {
    onChange: (dateRange: DateRange | undefined) => void;
    value: DateRange | undefined;
    disabled: boolean;
    onDisabledClick: () => void;
}

const NumberAnimation = ({ value }: { value: number }) => (
    <AnimatePresence mode="wait">
        <motion.span
            key={value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-semibold"
        >
            {value}
        </motion.span>
    </AnimatePresence>
);

// Extract common button styles
const buttonBaseStyles = "p-3 rounded-sm border border-gray-200 hover:bg-gray-50 active:bg-gray-100";
const disabledStyles = "opacity-50 cursor-not-allowed";

// Extract SVG components for reusability
const ChevronLeft = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6"/>
    </svg>
);

const ChevronRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6"/>
    </svg>
);

// Simplified DurationControl component
const DurationControl = ({ 
    value, 
    label, 
    onIncrement, 
    onDecrement, 
    disabled 
}: { 
    value: number;
    label: string;
    onIncrement: () => void;
    onDecrement: () => void;
    disabled: boolean;
}) => (
    <div className="flex items-center justify-center gap-3">
        <button 
            onClick={onDecrement}
            className={`${buttonBaseStyles} ${disabled ? disabledStyles : ''}`}
            disabled={disabled}
        >
            <ChevronLeft />
        </button>
        
        <div className="flex flex-col items-center w-16">
            <NumberAnimation value={value} />
            <span className="text-xs text-gray-500 uppercase mt-1">{label}</span>
        </div>

        <button 
            onClick={onIncrement}
            className={`${buttonBaseStyles} ${disabled ? disabledStyles : ''}`}
            disabled={disabled}
        >
            <ChevronRight />
        </button>
    </div>
);

const Calender: React.FC<CalenderProps> = ({ onChange, value, disabled, onDisabledClick }) => {
    const [durationValues, setDurationValues] = useState({ days: 0, months: 0, years: 0 });
    const [month, setMonth] = useState<Date>(startOfToday());
    const today = startOfToday();

    const handleDurationChange = (type: 'days' | 'months' | 'years', inputValue: number) => {
        if (disabled) {
            onDisabledClick();
            return;
        }
        const newDurationValues = { ...durationValues, [type]: Math.max(0, inputValue) };
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

    // Helper function to create duration controls
    const renderDurationControl = (type: 'days' | 'months' | 'years') => (
        <DurationControl
            value={durationValues[type]}
            label={type}
            onIncrement={() => handleDurationChange(type, durationValues[type] + 1)}
            onDecrement={() => handleDurationChange(type, durationValues[type] - 1)}
            disabled={disabled}
        />
    );

    return (
        <div className="flex flex-col  w-full text-black">
            <h2 className="text-lg font-semibold mb-4">Select Rental Period</h2>
            <div className="flex flex-row items-start w-full">
                <div className="mr-4 flex-1">
                    <DayPicker
                        mode="range"
                        showOutsideDays
                        selected={value}
                        onSelect={(newValue) => {
                            if (!disabled) {
                                onChange(newValue);
                                if (newValue?.from) {
                                    setMonth(newValue.from);
                                }
                            }
                        }}

                        classNames={{
                            selected: 'bg-black  ',
                            today: 'font-bold  bg-zinc-100 rounded-full ',
                            range_start: 'bg-black rounded-l-sm text-white ',
                            range_middle: 'text-black bg-zinc-100 ',
                            range_end: 'bg-black rounded-r-sm text-white ',             
                            chevron: 'text-black ',
                        }}
                        
                        disabled={{ before: today, ...(disabled ? { after: today } : {}) }}
                        
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
                <div className="flex flex-col flex-1 w-full">
                    <div className="flex flex-col space-y-6 mb-4 ">
                        {renderDurationControl('days')}
                        {renderDurationControl('months')}
                        {renderDurationControl('years')}
                    </div>

                    <button 
                        onClick={handleReset} 
                        className={`px-2 py-1  bg-red-500 text-white  text-sm 
                            ${disabled ? disabledStyles : 'hover:bg-red-600'}`}
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
