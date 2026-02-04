type LeaderboardEntry = {
  nick: string;
  score: number;
  ts?: number;
};

type LeaderboardProps = {
  entries: LeaderboardEntry[];
  currentNick?: string | null;
};

const getYouPrefix = (nick: string) => {
  const parts = nick.split('.');
  if (parts.length >= 3) {
    return `${parts.slice(0, 3).join('.')}.`;
  }
  return `${nick}.`;
};

export default function Leaderboard({ entries, currentNick }: LeaderboardProps) {
  if (!entries.length) return null;

  return (
    <div className="bg-[rgba(255,255,255,0.02)] border-2 border-[rgba(255,255,255,0.02)] border-solid content-stretch inline-flex flex-col font-mono font-semibold gap-[8px] items-center justify-center px-[16px] py-[12px] relative text-[12px] leading-[16px] tracking-[0.24px] whitespace-pre-wrap">
      {entries.slice(0, 5).map((entry, index) => {
        const isYou = currentNick && entry.nick === currentNick;
        const place = String(index + 1).padStart(2, '0');

        return (
          <div
            key={`${entry.nick}-${entry.score}-${entry.ts ?? index}`}
            className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0"
          >
            <p
              className={`relative shrink-0 w-[40px] ${isYou ? 'text-white' : 'text-[rgba(255,255,255,0.32)]'}`}
            >
              {place}
            </p>
            {isYou ? (
              <p className="relative shrink-0 text-[rgba(255,255,255,0.32)] whitespace-nowrap">
                <span>{getYouPrefix(entry.nick)}</span>
                <span className="text-white">YOU</span>
              </p>
            ) : (
              <p className="relative shrink-0 text-[rgba(255,255,255,0.32)] whitespace-nowrap">
                {entry.nick}
              </p>
            )}
            <p
              className={`relative shrink-0 text-right w-[42px] ${isYou ? 'text-white' : 'text-[rgba(255,255,255,0.32)]'}`}
            >
              {entry.score}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export type { LeaderboardEntry };
