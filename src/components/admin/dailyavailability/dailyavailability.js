import React, { useEffect, useMemo, useState } from 'react';
import './dailyavailability.css'; // reuse your styles; table/buttons/inputs match EventDetails
import * as XLSX from 'xlsx';
import MenuBar from "../../menumain/menubar";
import { formatDate } from '../../common/utils';

const API = 'https://www.agathiyarpyramid.org/api/dailyavailability';

const fmtISO = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const da = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
};

const parseAsISODate = (maybeDate) => {
  // supports "YYYY-MM-DD" and other date-able strings
  const dt = new Date(maybeDate);
  return Number.isNaN(dt.getTime()) ? null : new Date(fmtISO(dt)); // normalized to start-of-day
};

// Safely read values with lenient keys
const pickCounts = (row) => {
  const date = row.date || row.day || row.dt || '';
  const agathiyar =
    row.agathiyar ?? row.Agathiyar ?? row.agathiya ?? row.agathi ?? 0;
  const patriji =
    row.patriji ?? row.patrjii ?? row.Patriji ?? row.patri ?? 0;
  const dormitory =
    row.dormitory ?? row.Dormitory ?? row.dorm ?? 0;
  return { date, agathiyar, patriji, dormitory };
};

const DailyAvailability = () => {
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  // Fetch once
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setLoadErr('');
      try {
        const res = await fetch(API);
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          setAllRows([]);
          setLoadErr('Failed to load availability.');
        } else {
          // Normalize each row
          const normalized = data
            .map((r) => pickCounts(r))
            .filter((r) => r.date); // require date
          setAllRows(normalized);
        }
      } catch (e) {
        console.error(e);
        setLoadErr('Error fetching availability.');
        setAllRows([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Apply client-side date filtering and sort by date ASC
  const filteredRows = useMemo(() => {
    const start = dateFilter.start ? parseAsISODate(dateFilter.start) : null;
    const end = dateFilter.end ? parseAsISODate(dateFilter.end) : null;

    const rows = allRows.filter((r) => {
      const d = parseAsISODate(r.date);
      if (!d) return false;
      const afterStart = start ? d >= start : true;
      const beforeEnd = end ? d <= end : true;
      return afterStart && beforeEnd;
    });

    return rows.sort((a, b) => {
      const da = parseAsISODate(a.date)?.getTime() ?? 0;
      const db = parseAsISODate(b.date)?.getTime() ?? 0;
      return da - db;
    });
  }, [allRows, dateFilter]);

  const noResults = !loading && filteredRows.length === 0;

  const exportToExcel = () => {
    if (filteredRows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DailyAvailability');
    XLSX.writeFile(wb, 'daily_availability.xlsx');
  };

  const clearFilter = () => setDateFilter({ start: '', end: '' });

  return (
    <div className="event-mgmt-container">
      <MenuBar />
      <h2>Daily Room Availability</h2>

      {/* Date Filter */}
      <div className="section">
        <h4 style={{ marginBottom: 10, width: '100%' }}>Filter by Date:</h4>
        <input
          className="input-event"
          type="date"
          value={dateFilter.start}
          onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
        />
        <input
          className="input-event"
          type="date"
          value={dateFilter.end}
          onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
        />
        <button className="btn-event" style={{ marginLeft: 8 }} onClick={clearFilter}>
          Reset
        </button>
        <button className="btn-event" style={{ marginLeft: 8 }} onClick={exportToExcel}>
          Export Excel
        </button>
      </div>

      {loading && <p style={{ marginTop: 12 }}>Loading...</p>}
      {loadErr && <p style={{ color: 'tomato', marginTop: 12 }}>{loadErr}</p>}

      {/* Results */}
      {!loading && !loadErr && (
        <>
          {noResults ? (
            <div className="no-results">
              <p>No records found.</p>
            </div>
          ) : (
            <div className="user-list">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 220, textAlign: 'center' }}>Date</th>
                    <th style={{ textAlign: 'center' }}>Agathiyar Bhavan</th>
                    <th style={{ textAlign: 'center' }}>Patriji Bhavan</th>
                    <th style={{ textAlign: 'center'}}>Dormitory</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, idx) => (
                    <tr key={`${r.date}-${idx}`}>
                      <td style={{ textAlign: 'center' }}>{formatDate(r.date)}</td>
                      <td style={{ textAlign: 'center' }}>{r.agathiyar ?? 0}</td>
                      <td style={{ textAlign: 'center' }}>{r.patriji ?? 0}</td>
                      <td style={{ textAlign: 'center' }}>{r.dormitory ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DailyAvailability;