import type { Participant, Faculty } from '@/types';

interface ParticipantCardProps {
  participant: Participant;
  faculty?: Faculty;
  onClick?: () => void;
  selected?: boolean;
}

export function ParticipantCard({
  participant,
  faculty,
  onClick,
  selected,
}: ParticipantCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-300 bg-white hover:border-blue-300'
      }`}
    >
      <div className="flex items-center gap-4">
        {participant.photoUrl && (
          <img
            src={participant.photoUrl}
            alt={participant.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">
            {participant.name}
          </h3>
          {participant.alias && (
            <p className="text-sm text-gray-600">"{participant.alias}"</p>
          )}
          {faculty && (
            <p
              className="text-sm font-semibold mt-1"
              style={{ color: faculty.colorHex }}
            >
              {faculty.name}
            </p>
          )}
          {participant.weightClass && (
            <p className="text-xs text-gray-500 mt-1">
              {participant.weightClass}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
