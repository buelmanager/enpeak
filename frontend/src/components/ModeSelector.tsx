export type TalkMode = 'free' | 'expression' | 'roleplay';

interface ModeSelectorProps {
  currentMode: TalkMode;
  onModeChange: (mode: TalkMode) => void;
}

const modes: { key: TalkMode; label: string }[] = [
  { key: 'free', label: '자유 대화' },
  { key: 'expression', label: '표현 연습' },
  { key: 'roleplay', label: '롤플레이' },
];

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-2">
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onModeChange(mode.key)}
          className={`flex-1 py-3 rounded-xl text-sm transition-colors ${
            currentMode === mode.key
              ? 'bg-[#0D9488] text-white'
              : 'bg-white border border-[#e5e5e5]'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
