import React, { useState } from 'react';

export const AttendanceBarChart = ({
  data,
  attendanceRecords = [],
  height = 180
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Compute from real records or provided data
  const chartData = data || (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(dayName => {
      const dayRecs = attendanceRecords.filter(r => {
        if (!r.date) return false;
        try {
          const d = new Date(r.date + 'T00:00:00');
          const dName = d.toLocaleDateString('en-US', { weekday: 'short' });
          return dName === dayName;
        } catch (e) {
          return false;
        }
      });
      const pres = dayRecs.filter(r => r.status === 'Present').length;
      const rate = dayRecs.length > 0 ? Math.round((pres / dayRecs.length) * 100) : 0;
      return { day: dayName, rate, present: pres, total: dayRecs.length };
    });
  })();

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* Tooltip */}
      {hoveredIdx !== null && chartData[hoveredIdx] && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: `${(hoveredIdx / chartData.length) * 100 + 4}%`,
            transform: 'translateX(-50%)',
            background: 'var(--text-primary)',
            color: '#ffffff',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: 'var(--shadow-md)',
            zIndex: 10
          }}
        >
          {chartData[hoveredIdx].day}: {chartData[hoveredIdx].rate}% ({chartData[hoveredIdx].present}/{chartData[hoveredIdx].total})
        </div>
      )}

      {/* Grid horizontal guidelines */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ borderBottom: '1px dashed var(--border-subtle)', width: '100%', height: 0 }}></div>
        <div style={{ borderBottom: '1px dashed var(--border-subtle)', width: '100%', height: 0 }}></div>
        <div style={{ borderBottom: '1px dashed var(--border-subtle)', width: '100%', height: 0 }}></div>
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', padding: '0 0.5rem', zIndex: 1 }}>
        {chartData.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          const barHeight = Math.max(4, (item.rate / 100) * (height - 35));

          return (
            <div
              key={item.day}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
                cursor: 'pointer',
                padding: '0 0.25rem'
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${barHeight}px`,
                  background: isHovered
                    ? 'var(--brand-primary)'
                    : item.total > 0
                    ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)'
                    : 'var(--border-subtle)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: hoveredIdx !== null && !isHovered ? 0.45 : 1
                }}
              />
              <span
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: isHovered ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
