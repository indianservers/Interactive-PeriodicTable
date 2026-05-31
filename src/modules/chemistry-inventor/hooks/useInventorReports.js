import { useCallback, useEffect, useState } from 'react';

const REPORTS_KEY = 'cu-chemistry-inventor-reports';

const readReports = () => {
  try {
    const stored = window.localStorage.getItem(REPORTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export function useInventorReports() {
  const [reports, setReports] = useState(readReports);

  useEffect(() => {
    window.localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }, [reports]);

  const saveReport = useCallback(report => {
    const nextReport = {
      ...report,
      savedAt: new Date().toLocaleString(),
    };
    setReports(previous => [nextReport, ...previous.filter(item => item.id !== nextReport.id)].slice(0, 30));
    return nextReport;
  }, []);

  const loadReport = useCallback(id => reports.find(report => report.id === id) || null, [reports]);

  return { reports, saveReport, loadReport };
}
