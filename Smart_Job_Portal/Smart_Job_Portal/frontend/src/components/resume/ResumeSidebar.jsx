import React from 'react';

const steps = [
    'Personal Details',
    'Skills',
    'Projects',
    'Experience',
    'Education',
    'Certifications',
    'Achievements',
    'Preview / Save'
];

const ResumeSidebar = ({ currentStep, setCurrentStep }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 font-display tracking-tight">Steps</h2>
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <div
                            key={index}
                            onClick={() => setCurrentStep(index)}
                            className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${isActive
                                ? 'bg-violet-50/80 border-l-4 border-violet-600 shadow-sm'
                                : isCompleted
                                    ? 'hover:bg-gray-50 border-l-4 border-green-500'
                                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                                }`}
                        >
                            <span
                                className={`flex flex-shrink-0 items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${isActive
                                    ? 'bg-violet-600 text-white shadow-md shadow-blue-500/30'
                                    : isCompleted
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                    }`}
                            >
                                {isCompleted ? '✓' : index + 1}
                            </span>
                            <span
                                className={`text-sm font-medium ${isActive
                                    ? 'text-violet-800'
                                    : isCompleted
                                        ? 'text-green-700'
                                        : 'text-gray-600'
                                    }`}
                            >
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResumeSidebar;
