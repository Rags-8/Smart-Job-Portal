import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger" // 'danger', 'warning', 'info'
}) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const colors = {
        danger: {
            icon: "bg-red-100 text-red-600",
            button: "bg-red-600 hover:bg-red-700",
            light: "bg-red-50 text-red-700 hover:bg-red-100"
        },
        warning: {
            icon: "bg-amber-100 text-amber-600",
            button: "bg-amber-600 hover:bg-amber-700",
            light: "bg-amber-50 text-amber-700 hover:bg-amber-100"
        },
        info: {
            icon: "bg-violet-100 text-violet-600",
            button: "bg-violet-600 hover:bg-violet-700",
            light: "bg-violet-50 text-violet-700 hover:bg-violet-100"
        }
    };

    const color = colors[type] || colors.info;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 ml-0">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                {/* Header/Close */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 pb-4 pt-10 text-center sm:text-left">
                    <div className={`mx-auto sm:mx-0 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${color.icon}`}>
                        <AlertTriangle className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">
                        {title}
                    </h3>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="p-8 pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-2xl border border-slate-100 transition-all active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-6 py-4 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 ${color.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
