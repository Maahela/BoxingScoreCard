import type { Faculty, FacultyTotals, Event } from '@/types';

interface TotalsTableProps {
  faculties: Faculty[];
  totals: FacultyTotals[];
  events?: Event[];
  showEventBreakdown?: boolean;
}

export function TotalsTable({
  faculties,
  totals,
  events,
  showEventBreakdown = false,
}: TotalsTableProps) {
  // Sort faculties by total score descending
  const sortedTotals = [...totals].sort(
    (a, b) => b.totalScore - a.totalScore
  );

  const getFacultyById = (id: string) => faculties.find((f) => f.id === id);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-3 text-left">Rank</th>
            <th className="p-3 text-left">Faculty</th>
            {showEventBreakdown &&
              events?.map((event) => (
                <th key={event.id} className="p-3 text-center">
                  {event.shortName}
                </th>
              ))}
            <th className="p-3 text-right font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {sortedTotals.map((total, index) => {
            const faculty = getFacultyById(total.facultyId);
            if (!faculty) return null;

            return (
              <tr
                key={total.facultyId}
                className={`border-b ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="p-3 font-bold text-gray-700">{index + 1}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: faculty.colorHex }}
                    />
                    <span className="font-semibold">{faculty.name}</span>
                  </div>
                </td>
                {showEventBreakdown &&
                  events?.map((event) => (
                    <td key={event.id} className="p-3 text-center">
                      {total.eventTotals[event.id]?.toFixed(2) || '0.00'}
                    </td>
                  ))}
                <td className="p-3 text-right font-bold text-xl text-blue-600">
                  {total.totalScore.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
