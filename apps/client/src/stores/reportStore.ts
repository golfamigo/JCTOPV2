import { create } from 'zustand';
import { EventReport, InvoiceSettings } from '@jctop-event/shared-types';

interface ReportState {
  // Report data
  currentReport: EventReport | null;
  reportLoading: boolean;
  reportError: string | null;

  // Export state
  isExporting: boolean;
  exportError: string | null;

  // Invoice settings
  invoiceSettings: InvoiceSettings | null;
  invoiceSettingsLoading: boolean;
  invoiceSettingsError: string | null;

  // Actions
  setReport: (report: EventReport | null) => void;
  setReportLoading: (loading: boolean) => void;
  setReportError: (error: string | null) => void;
  setExporting: (isExporting: boolean) => void;
  setExportError: (error: string | null) => void;
  setInvoiceSettings: (settings: InvoiceSettings | null) => void;
  setInvoiceSettingsLoading: (loading: boolean) => void;
  setInvoiceSettingsError: (error: string | null) => void;
  clearReport: () => void;
  clearInvoiceSettings: () => void;
  reset: () => void;
}

const initialState = {
  currentReport: null,
  reportLoading: false,
  reportError: null,
  isExporting: false,
  exportError: null,
  invoiceSettings: null,
  invoiceSettingsLoading: false,
  invoiceSettingsError: null,
};

export const useReportStore = create<ReportState>((set) => ({
  ...initialState,

  setReport: (report) => set({ currentReport: report }),
  setReportLoading: (loading) => set({ reportLoading: loading }),
  setReportError: (error) => set({ reportError: error }),
  setExporting: (isExporting) => set({ isExporting }),
  setExportError: (error) => set({ exportError: error }),
  setInvoiceSettings: (settings) => set({ invoiceSettings: settings }),
  setInvoiceSettingsLoading: (loading) => set({ invoiceSettingsLoading: loading }),
  setInvoiceSettingsError: (error) => set({ invoiceSettingsError: error }),
  
  clearReport: () => set({ 
    currentReport: null, 
    reportError: null 
  }),
  
  clearInvoiceSettings: () => set({ 
    invoiceSettings: null, 
    invoiceSettingsError: null 
  }),
  
  reset: () => set(initialState),
}));