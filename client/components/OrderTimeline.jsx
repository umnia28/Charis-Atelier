'use client';

export default function OrderTimeline({ timeline = [] }) {
  if (!timeline.length) {
    return <p className="text-slate-500">No status updates yet.</p>;
  }

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold text-slate-700">Status Timeline</h2>

      <div className="mt-4 space-y-4">
        {timeline.map((t, idx) => (
          <div key={t.order_status_id || idx} className="flex gap-3">
            {/* left line + dot */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-slate-700 mt-1" />
              {idx !== timeline.length - 1 && (
                <div className="w-[2px] flex-1 bg-slate-200 mt-1" />
              )}
            </div>

            {/* content */}
            <div className="flex-1 border rounded-xl p-3">
              <p className="font-medium text-slate-800">{t.status_type}</p>
              <p className="text-xs text-slate-500 mt-1">
                {t.status_time ? new Date(t.status_time).toLocaleString() : ""}
                {t.updated_by_username ? ` • by ${t.updated_by_username}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
