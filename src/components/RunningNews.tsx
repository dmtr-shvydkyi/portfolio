'use client';

interface RunningNewsProps {
  className?: string;
  state?: '2' | '1';
}

export default function RunningNews({ className }: RunningNewsProps) {
  const text = "always under construction ⋅ ";
  const repeatedText = text.repeat(8); // Repeat the text multiple times for seamless scrolling

  return (
    <div className={`${className} overflow-hidden`} data-name="State=1" data-node-id="622:1625">
      <div className="horizontal-scrolling-items">
        <div className="horizontal-scrolling-items__item">
          {repeatedText}
        </div>
        <div className="horizontal-scrolling-items__item">
          {repeatedText}
        </div>
      </div>
    </div>
  );
}
