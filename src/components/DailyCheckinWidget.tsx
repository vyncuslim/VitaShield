import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CheckinState {
  streak: number;             // 0-4
  lastCheckinDate: string;    // ISO date 'YYYY-MM-DD'
  completedDays: boolean[];   // [d1, d2, d3, d4]
  rewarded: boolean;
  consentGiven: boolean;
  totalDataPoints: number;    // for gamification
}

interface TaskResult {
  day: number;
  durationMs: number;
  clickSequence: Array<{ x: number; y: number; t: number; correct: boolean }>;
  reactionTimes: number[];
  completionRatio: number;
  behaviorToken: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const TODAY = () => new Date().toISOString().slice(0, 10);

const loadState = (): CheckinState => {
  try {
    const raw = localStorage.getItem('vms_checkin_state');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    streak: 0,
    lastCheckinDate: '',
    completedDays: [false, false, false, false],
    rewarded: false,
    consentGiven: false,
    totalDataPoints: 0,
  };
};

const saveState = (s: CheckinState) => {
  localStorage.setItem('vms_checkin_state', JSON.stringify(s));
};

const isYesterday = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10) === TODAY();
};

// ─── Daily Task Definitions ───────────────────────────────────────────────────
const DAYS = [
  {
    day: 1,
    title: 'Click the Robots',
    subtitle: 'Day 1 · Basic Human Check',
    icon: '🤖',
    desc: 'Tap all robot faces. Leave the humans alone.',
    color: '#00f2fe',
    gradient: 'linear-gradient(135deg, #00f2fe22, #0d1423)',
    glowColor: '#00f2fe',
  },
  {
    day: 2,
    title: 'Follow the Target',
    subtitle: 'Day 2 · Behavioral Analysis',
    icon: '🎯',
    desc: 'Move your cursor to follow the moving target naturally.',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f722, #0d1423)',
    glowColor: '#a855f7',
  },
  {
    day: 3,
    title: 'Pattern Memory',
    subtitle: 'Day 3 · Cognitive Verification',
    icon: '🧠',
    desc: 'Watch the sequence, then recreate it.',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b22, #0d1423)',
    glowColor: '#f59e0b',
  },
  {
    day: 4,
    title: 'Reaction Test',
    subtitle: 'Day 4 · Adaptive Challenge',
    icon: '⚡',
    desc: 'Tap when the shield turns green. Humans react naturally.',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b98122, #0d1423)',
    glowColor: '#10b981',
  },
];

// ─── Consent Modal ────────────────────────────────────────────────────────────
const ConsentModal: React.FC<{ onAccept: () => void; onDecline: () => void }> = ({ onAccept, onDecline }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(12px)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  }}>
    <div style={{
      background: 'rgba(13,20,35,0.98)', border: '1px solid rgba(0,242,254,0.3)',
      borderRadius: '20px', maxWidth: '480px', width: '100%',
      padding: '36px', boxShadow: '0 0 60px rgba(0,242,254,0.15)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛡️</div>
        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>
          Help Train VitaShield AI
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: '#00f2fe' }}>VitaShield Beta · Data Collection</strong>
        </p>
      </div>

      <div style={{
        background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.15)',
        borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '13px',
        color: '#94a3b8', lineHeight: 1.7,
      }}>
        参与每日 VitaShield 签到互动，将帮助我们改进 AI 人机验证系统。<br />
        <br />
        收集内容：<strong style={{ color: '#e2e8f0' }}>点击序列、鼠标轨迹、反应时间、设备信号</strong><br />
        用途：<strong style={{ color: '#e2e8f0' }}>训练 VitaShield 行为识别模型</strong><br />
        不会出售给任何第三方。可随时在设置中撤回同意。
      </div>

      <div style={{
        background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: '12px', padding: '14px', marginBottom: '24px',
        display: 'flex', alignItems: 'flex-start', gap: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>🎁</span>
        <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
          完成连续 <strong style={{ color: '#a855f7' }}>4 天签到</strong> → 自动获得{' '}
          <strong style={{ color: '#a855f7' }}>Neuro Plan 3 个月</strong>（免费）
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onDecline}
          style={{
            flex: 1, padding: '12px', background: 'transparent',
            border: '1px solid rgba(148,163,184,0.3)', borderRadius: '10px',
            color: '#64748b', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
          }}
        >
          跳过
        </button>
        <button
          onClick={onAccept}
          style={{
            flex: 2, padding: '12px',
            background: 'linear-gradient(135deg, #00f2fe, #a855f7)',
            border: 'none', borderRadius: '10px',
            color: '#0d1423', cursor: 'pointer', fontSize: '14px', fontWeight: 700,
            boxShadow: '0 0 20px rgba(0,242,254,0.3)',
          }}
        >
          ✓ 我同意并开始签到
        </button>
      </div>
    </div>
  </div>
);

// ─── Task 1: Click the Robots ─────────────────────────────────────────────────
interface Card { id: number; isRobot: boolean; emoji: string; clicked: boolean; correct: boolean | null; }

const Task1ClickRobots: React.FC<{ onComplete: (r: Partial<TaskResult>) => void }> = ({ onComplete }) => {
  const startTime = useRef(Date.now());
  const clickSeq  = useRef<TaskResult['clickSequence']>([]);
  const reactions = useRef<number[]>([]);
  const lastClickTime = useRef(Date.now());

  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

  const CARDS_INIT: Card[] = shuffle([
    { id: 0, isRobot: true,  emoji: '🤖', clicked: false, correct: null },
    { id: 1, isRobot: true,  emoji: '👾', clicked: false, correct: null },
    { id: 2, isRobot: true,  emoji: '⚙️', clicked: false, correct: null },
    { id: 3, isRobot: false, emoji: '👩', clicked: false, correct: null },
    { id: 4, isRobot: false, emoji: '👨', clicked: false, correct: null },
    { id: 5, isRobot: false, emoji: '🧒', clicked: false, correct: null },
  ]);

  const [cards, setCards] = useState<Card[]>(CARDS_INIT);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 3 });

  const handleClick = (id: number, e: React.MouseEvent) => {
    if (done) return;
    const now = Date.now();
    const reaction = now - lastClickTime.current;
    lastClickTime.current = now;

    setCards(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        const correct = c.isRobot;
        clickSeq.current.push({ x: e.clientX, y: e.clientY, t: now, correct });
        reactions.current.push(reaction);
        return { ...c, clicked: true, correct };
      });

      const allRobotsFound = updated.filter(c => c.isRobot).every(c => c.clicked);
      const wrongClicks = updated.filter(c => !c.isRobot && c.clicked).length;

      if (allRobotsFound || wrongClicks >= 2) {
        const correctCount = updated.filter(c => c.isRobot && c.clicked).length;
        setScore({ correct: correctCount, total: 3 });
        setDone(true);
        setTimeout(() => {
          onComplete({
            durationMs: now - startTime.current,
            clickSequence: clickSeq.current,
            reactionTimes: reactions.current,
            completionRatio: correctCount / 3,
          });
        }, 1200);
      }

      return updated;
    });
  };

  return (
    <div>
      <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
        点击所有 <strong style={{ color: '#00f2fe' }}>机器人</strong>，跳过所有真人
      </p>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
        maxWidth: '340px', margin: '0 auto',
      }}>
        {cards.map(card => (
          <button
            key={card.id}
            onClick={(e) => handleClick(card.id, e)}
            disabled={card.clicked || done}
            style={{
              padding: '16px 12px',
              background: card.clicked
                ? (card.correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)')
                : 'rgba(255,255,255,0.05)',
              border: card.clicked
                ? (card.correct ? '2px solid #10b981' : '2px solid #ef4444')
                : '2px solid rgba(255,255,255,0.1)',
              borderRadius: '14px', cursor: card.clicked ? 'default' : 'pointer',
              transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '6px',
              transform: card.clicked ? 'scale(0.95)' : 'scale(1)',
              boxShadow: card.clicked
                ? (card.correct ? '0 0 16px rgba(16,185,129,0.3)' : '0 0 16px rgba(239,68,68,0.3)')
                : 'none',
            }}
          >
            <span style={{ fontSize: '28px' }}>{card.emoji}</span>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
              {card.clicked
                ? (card.correct ? '✓ ROBOT' : '✗ HUMAN')
                : '???'}
            </span>
          </button>
        ))}
      </div>
      {done && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#10b981', fontWeight: 700, fontSize: '15px' }}>
          {score.correct === 3 ? '🎉 Perfect! All robots found!' : `✓ ${score.correct}/3 robots found`}
        </div>
      )}
    </div>
  );
};

// ─── Task 2: Follow the Target ────────────────────────────────────────────────
const Task2FollowTarget: React.FC<{ onComplete: (r: Partial<TaskResult>) => void }> = ({ onComplete }) => {
  const startTime = useRef(Date.now());
  const areaRef = useRef<HTMLDivElement>(null);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [captured, setCaptured] = useState(0);
  const reactions = useRef<number[]>([]);
  const lastCapture = useRef(Date.now());
  const totalTargets = 5;

  useEffect(() => {
    const moveTarget = () => {
      setTargetPos({
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 70,
      });
    };
    const interval = setInterval(moveTarget, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const dist = Math.sqrt(Math.pow(x - targetPos.x, 2) + Math.pow(y - targetPos.y, 2));
    if (dist < 8) {
      const now = Date.now();
      reactions.current.push(now - lastCapture.current);
      lastCapture.current = now;
      setCaptured(prev => {
        const next = prev + 1;
        if (next >= totalTargets) {
          setTimeout(() => onComplete({
            durationMs: now - startTime.current,
            reactionTimes: reactions.current,
            completionRatio: next / totalTargets,
            clickSequence: [],
          }), 600);
        }
        return next;
      });
      setTargetPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    const dist = Math.sqrt(Math.pow(x - targetPos.x, 2) + Math.pow(y - targetPos.y, 2));
    if (dist < 10) {
      const now = Date.now();
      reactions.current.push(now - lastCapture.current);
      lastCapture.current = now;
      setCaptured(prev => {
        const next = prev + 1;
        if (next >= totalTargets) {
          setTimeout(() => onComplete({
            durationMs: now - startTime.current,
            reactionTimes: reactions.current,
            completionRatio: next / totalTargets,
            clickSequence: [],
          }), 600);
        }
        return next;
      });
      setTargetPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 });
    }
  };

  return (
    <div>
      <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
        用鼠标 / 手指跟随 <strong style={{ color: '#a855f7' }}>移动的目标</strong> · {captured}/{totalTargets} 捕获
      </p>
      <div
        ref={areaRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{
          position: 'relative', width: '100%', height: '220px',
          background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)',
          borderRadius: '14px', cursor: 'crosshair', overflow: 'hidden',
          touchAction: 'none',
        }}
      >
        {/* Target */}
        <div style={{
          position: 'absolute',
          left: `${targetPos.x}%`, top: `${targetPos.y}%`,
          transform: 'translate(-50%, -50%)',
          width: '36px', height: '36px',
          background: 'radial-gradient(circle, #a855f7, #7c3aed)',
          borderRadius: '50%', border: '3px solid #fff',
          boxShadow: '0 0 20px rgba(168,85,247,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', transition: 'left 0.4s ease, top 0.4s ease',
        }}>🎯</div>
        {/* Captured indicator */}
        <div style={{
          position: 'absolute', top: '10px', right: '12px',
          color: '#a855f7', fontSize: '12px', fontWeight: 700,
        }}>
          {Array.from({ length: totalTargets }).map((_, i) => (
            <span key={i} style={{ marginLeft: '3px' }}>{i < captured ? '⬛' : '⬜'}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Task 3: Pattern Memory ───────────────────────────────────────────────────
const PATTERN_COLORS = ['#00f2fe', '#a855f7', '#f59e0b', '#10b981'];
const Task3PatternMemory: React.FC<{ onComplete: (r: Partial<TaskResult>) => void }> = ({ onComplete }) => {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<'watch' | 'repeat' | 'done'>('watch');
  const [pattern] = useState(() => Array.from({ length: 4 }, () => Math.floor(Math.random() * 4)));
  const [showIdx, setShowIdx] = useState(0);
  const [userSeq, setUserSeq] = useState<number[]>([]);
  const [activeBtn, setActiveBtn] = useState<number | null>(null);
  const clickSeq = useRef<TaskResult['clickSequence']>([]);

  // Show pattern
  useEffect(() => {
    if (phase !== 'watch') return;
    if (showIdx < pattern.length) {
      const t = setTimeout(() => {
        setActiveBtn(pattern[showIdx]);
        setTimeout(() => { setActiveBtn(null); setShowIdx(i => i + 1); }, 600);
      }, 800);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setPhase('repeat'), 700);
      return () => clearTimeout(t);
    }
  }, [phase, showIdx, pattern]);

  const handleUserClick = (idx: number, e: React.MouseEvent) => {
    if (phase !== 'repeat') return;
    const now = Date.now();
    const newSeq = [...userSeq, idx];
    setActiveBtn(idx);
    setTimeout(() => setActiveBtn(null), 250);

    clickSeq.current.push({ x: e.clientX, y: e.clientY, t: now, correct: pattern[newSeq.length - 1] === idx });

    if (pattern[newSeq.length - 1] !== idx) {
      // wrong — restart
      setUserSeq([]);
      setPhase('watch');
      setShowIdx(0);
      return;
    }

    setUserSeq(newSeq);
    if (newSeq.length === pattern.length) {
      setPhase('done');
      setTimeout(() => onComplete({
        durationMs: now - startTime.current,
        clickSequence: clickSeq.current,
        reactionTimes: [],
        completionRatio: 1,
      }), 800);
    }
  };

  const emojis = ['🔵', '🟣', '🟡', '🟢'];

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>
        {phase === 'watch' && '👀 记住顺序...'}
        {phase === 'repeat' && `🔁 重复序列 (${userSeq.length}/${pattern.length})`}
        {phase === 'done' && '🎉 完美记忆！'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxWidth: '260px', margin: '0 auto' }}>
        {PATTERN_COLORS.map((color, i) => (
          <button
            key={i}
            onClick={(e) => handleUserClick(i, e)}
            disabled={phase !== 'repeat'}
            style={{
              height: '80px', borderRadius: '14px', border: 'none',
              background: activeBtn === i ? color : `${color}33`,
              boxShadow: activeBtn === i ? `0 0 24px ${color}` : 'none',
              cursor: phase === 'repeat' ? 'pointer' : 'default',
              transition: 'all 0.15s', fontSize: '28px',
              transform: activeBtn === i ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            {emojis[i]}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Task 4: Reaction Test ────────────────────────────────────────────────────
const Task4ReactionTest: React.FC<{ onComplete: (r: Partial<TaskResult>) => void }> = ({ onComplete }) => {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<'waiting' | 'ready' | 'done'>('waiting');
  const [tapCount, setTapCount] = useState(0);
  const [reactions, setReactions] = useState<number[]>([]);
  const greenTime = useRef(0);
  const total = 5;

  useEffect(() => {
    if (phase === 'waiting') {
      const delay = 1500 + Math.random() * 2000;
      const t = setTimeout(() => { setPhase('ready'); greenTime.current = Date.now(); }, delay);
      return () => clearTimeout(t);
    }
  }, [phase, tapCount]);

  const handleTap = (_e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== 'ready') return;
    const rt = Date.now() - greenTime.current;
    const newCount = tapCount + 1;
    const newReactions = [...reactions, rt];
    setReactions(newReactions);
    setTapCount(newCount);

    if (newCount >= total) {
      setPhase('done');
      setTimeout(() => onComplete({
        durationMs: Date.now() - startTime.current,
        reactionTimes: newReactions,
        clickSequence: [],
        completionRatio: 1,
      }), 600);
    } else {
      setPhase('waiting');
    }
  };

  const avgRt = reactions.length > 0 ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length) : 0;

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
        盾牌变绿时 <strong style={{ color: '#10b981' }}>立刻点击</strong>！ ({tapCount}/{total})
      </p>
      <div
        onClick={handleTap}
        onTouchStart={handleTap}
        style={{
          width: '140px', height: '140px', margin: '0 auto',
          borderRadius: '50%', cursor: phase === 'ready' ? 'pointer' : 'default',
          background: phase === 'ready'
            ? 'radial-gradient(circle, #10b981, #059669)'
            : phase === 'done' ? 'radial-gradient(circle, #10b981, #059669)'
            : 'radial-gradient(circle, #1e293b, #0f172a)',
          border: phase === 'ready' ? '4px solid #34d399' : '4px solid rgba(255,255,255,0.1)',
          boxShadow: phase === 'ready' ? '0 0 40px rgba(16,185,129,0.6)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '48px', transition: 'all 0.2s', userSelect: 'none',
          animation: phase === 'ready' ? 'vms-pulse 0.5s ease-in-out infinite alternate' : 'none',
        }}
      >
        🛡️
      </div>
      {reactions.length > 0 && (
        <div style={{ marginTop: '16px', color: '#64748b', fontSize: '12px' }}>
          平均反应时间: <strong style={{ color: '#10b981' }}>{avgRt}ms</strong>
          {avgRt < 200 && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>⚡ 极速！</span>}
          {avgRt > 500 && <span style={{ color: '#94a3b8', marginLeft: '8px' }}>🧘 沉稳</span>}
        </div>
      )}
      {phase === 'done' && (
        <div style={{ color: '#10b981', fontWeight: 700, marginTop: '8px' }}>✅ 人类反应确认！</div>
      )}
    </div>
  );
};

// ─── Task Modal ───────────────────────────────────────────────────────────────
const TaskModal: React.FC<{
  day: number;
  onComplete: (result: Partial<TaskResult>) => void;
  onClose: () => void;
}> = ({ day, onComplete, onClose }) => {
  const info = DAYS[day - 1];
  const [taskDone, setTaskDone] = useState(false);

  const handleTaskComplete = (r: Partial<TaskResult>) => {
    setTaskDone(true);
    setTimeout(() => onComplete(r), 500);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: 'rgba(13,20,35,0.98)', border: `1px solid ${info.color}44`,
        borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '32px',
        boxShadow: `0 0 60px ${info.glowColor}20`,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: info.color, fontWeight: 700, letterSpacing: '0.08em' }}>
            {info.subtitle}
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px',
          }}>✕</button>
        </div>
        <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 6px' }}>
          {info.icon} {info.title}
        </h3>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 24px' }}>{info.desc}</p>

        {/* Divider */}
        <div style={{ height: '1px', background: `${info.color}22`, marginBottom: '24px' }} />

        {/* Task component */}
        {!taskDone ? (
          <>
            {day === 1 && <Task1ClickRobots onComplete={handleTaskComplete} />}
            {day === 2 && <Task2FollowTarget onComplete={handleTaskComplete} />}
            {day === 3 && <Task3PatternMemory onComplete={handleTaskComplete} />}
            {day === 4 && <Task4ReactionTest onComplete={handleTaskComplete} />}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <div style={{ color: '#10b981', fontWeight: 700, fontSize: '18px' }}>验证完成！</div>
            <div style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>数据已安全记录 · 感谢你的贡献</div>
          </div>
        )}

        {/* VitaShield attribution */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: '#1e293b' }}>🛡️ Powered by</span>
          <span style={{ fontSize: '10px', color: '#334155', fontWeight: 700 }}>VitaShield Beta</span>
        </div>
      </div>
    </div>
  );
};

// ─── Success / Reward Modal ───────────────────────────────────────────────────
const RewardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
      backdropFilter: 'blur(16px)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: 'rgba(13,20,35,0.98)',
        border: '1px solid rgba(168,85,247,0.4)',
        borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '40px',
        boxShadow: '0 0 80px rgba(168,85,247,0.2)', textAlign: 'center',
      }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '0 0 8px' }}>
          Congratulations!
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
          你完成了连续 4 天的 VitaShield 验证签到！
        </p>

        <div style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(0,242,254,0.1))',
          border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: '16px', padding: '24px', marginBottom: '24px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧠</div>
          <div style={{ color: '#a855f7', fontWeight: 800, fontSize: '20px', marginBottom: '4px' }}>
            Neuro Plan · 3 个月
          </div>
          <div style={{ color: '#64748b', fontSize: '13px' }}>
            已自动添加到你的 VitaMind AI 账户
          </div>
        </div>

        <div style={{
          background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.15)',
          borderRadius: '12px', padding: '14px', marginBottom: '24px', fontSize: '12px', color: '#64748b',
        }}>
          🛡️ 你的 4 次验证数据已安全用于训练 VitaShield AI 模型。<br />
          感谢你帮助让互联网更安全。
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, #a855f7, #00f2fe)',
            border: 'none', borderRadius: '12px',
            color: '#0d1423', fontWeight: 700, fontSize: '15px',
            cursor: 'pointer', boxShadow: '0 0 24px rgba(168,85,247,0.3)',
          }}
        >
          开始使用 Neuro Plan →
        </button>
      </div>
    </div>
  );
};

// ─── Main DailyCheckin Widget ─────────────────────────────────────────────────
export const DailyCheckinWidget: React.FC = () => {
  const [state, setState] = useState<CheckinState>(loadState);
  const [showConsent, setShowConsent] = useState(false);
  const [activeTaskDay, setActiveTaskDay] = useState<number | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [justCompleted, setJustCompleted] = useState<number | null>(null);

  // ── Reset streak if gap > 1 day ───────────────────────────────────────────
  useEffect(() => {
    const today = TODAY();
    const last = state.lastCheckinDate;
    if (last && last !== today && !isYesterday(last)) {
      // streak broken
      const reset: CheckinState = {
        ...state,
        streak: 0,
        completedDays: [false, false, false, false],
        lastCheckinDate: last,
      };
      setState(reset);
      saveState(reset);
    }
  }, []);

  const todayDayIndex = state.streak; // next uncompleted day (0-3)
  const isCompletedToday = state.lastCheckinDate === TODAY() && state.completedDays[todayDayIndex - 1];
  const allDone = state.streak >= 4 && state.completedDays.every(Boolean);

  const handleStartClick = () => {
    if (!state.consentGiven) {
      setShowConsent(true);
      return;
    }
    if (allDone && !state.rewarded) {
      setShowReward(true);
      return;
    }
    if (!isCompletedToday && state.streak < 4) {
      setActiveTaskDay(state.streak + 1);
    }
  };

  const handleConsentAccept = () => {
    const updated = { ...state, consentGiven: true };
    setState(updated);
    saveState(updated);
    setShowConsent(false);
    setActiveTaskDay(state.streak + 1 || 1);
  };

  const handleTaskComplete = useCallback((result: Partial<TaskResult>) => {
    setActiveTaskDay(null);

    const newStreak = state.streak + 1;
    const newDays = [...state.completedDays] as boolean[];
    newDays[state.streak] = true;
    const newDataPoints = (state.totalDataPoints || 0) + (result.clickSequence?.length || 0) + (result.reactionTimes?.length || 0);

    const updated: CheckinState = {
      ...state,
      streak: newStreak,
      lastCheckinDate: TODAY(),
      completedDays: newDays,
      totalDataPoints: newDataPoints,
    };
    setState(updated);
    saveState(updated);
    setJustCompleted(state.streak + 1);
    setTimeout(() => setJustCompleted(null), 3000);

    if (newStreak >= 4) {
      setTimeout(() => {
        setShowReward(true);
        const rewarded = { ...updated, rewarded: true };
        setState(rewarded);
        saveState(rewarded);
      }, 1200);
    }

    // In production: POST to /api/checkin with result + behavior token
    console.log('[VitaShield DailyCheckin] Task completed', result);
  }, [state]);

  const handleRewardClose = () => {
    setShowReward(false);
  };

  return (
    <>
      {/* Modals */}
      {showConsent  && <ConsentModal onAccept={handleConsentAccept} onDecline={() => setShowConsent(false)} />}
      {activeTaskDay && (
        <TaskModal
          day={activeTaskDay}
          onComplete={handleTaskComplete}
          onClose={() => setActiveTaskDay(null)}
        />
      )}
      {showReward && <RewardModal onClose={handleRewardClose} />}

      {/* Widget Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(13,20,35,0.9), rgba(8,11,20,0.95))',
        border: '1px solid rgba(168,85,247,0.25)',
        borderRadius: '20px', padding: '24px',
        boxShadow: '0 0 40px rgba(168,85,247,0.08), 0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative', overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,0.5)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 60px rgba(168,85,247,0.15), 0 8px 32px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,0.25)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 40px rgba(168,85,247,0.08), 0 8px 32px rgba(0,0,0,0.4)';
        }}
      >
        {/* Glow decoration */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '120px', height: '120px',
          background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '16px' }}>🛡️</span>
              <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: 700, letterSpacing: '0.08em' }}>
                VITASHIELD BETA
              </span>
              <span style={{
                fontSize: '10px', background: 'rgba(168,85,247,0.15)',
                color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)',
                padding: '1px 7px', borderRadius: '20px', fontWeight: 600,
              }}>LIVE</span>
            </div>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: 0 }}>
              每日人类验证签到
            </h3>
            <p style={{ color: '#475569', fontSize: '11px', margin: '3px 0 0' }}>
              Help train the future of human verification
            </p>
          </div>

          {/* Streak counter */}
          <div style={{
            textAlign: 'center',
            background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '12px', padding: '8px 14px',
          }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#a855f7', lineHeight: 1 }}>
              {state.streak}/4
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>连续天数</div>
          </div>
        </div>

        {/* 4-day progress circles */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          {DAYS.map((d, i) => {
            const completed = state.completedDays[i];
            const isNext = i === state.streak && !allDone;
            const isFuture = i > state.streak;
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: '100%', aspectRatio: '1', borderRadius: '50%',
                  background: completed
                    ? `linear-gradient(135deg, ${d.color}, ${d.color}88)`
                    : isNext ? `${d.color}15`
                    : 'rgba(255,255,255,0.04)',
                  border: completed
                    ? `2px solid ${d.color}`
                    : isNext ? `2px solid ${d.color}60`
                    : '2px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                  boxShadow: completed ? `0 0 12px ${d.color}40` : 'none',
                  transition: 'all 0.3s',
                  animation: isNext ? 'vms-ping 2s ease-in-out infinite' : 'none',
                }}>
                  {completed ? '✓' : isFuture ? '○' : d.icon}
                </div>
                <div style={{ fontSize: '10px', color: completed ? d.color : '#334155', marginTop: '4px', fontWeight: 600 }}>
                  Day {d.day}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reward bar */}
        <div style={{
          background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)',
          borderRadius: '10px', padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px',
        }}>
          <span style={{ fontSize: '18px' }}>🎁</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#a855f7', fontWeight: 700 }}>4天奖励</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Neuro Plan 3 个月 · 免费解锁</div>
          </div>
          {/* Progress bar */}
          <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${(state.streak / 4) * 100}%`, height: '100%',
              background: 'linear-gradient(90deg, #a855f7, #00f2fe)',
              borderRadius: '3px', transition: 'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Data contribution note */}
        {state.totalDataPoints > 0 && (
          <div style={{
            fontSize: '11px', color: '#334155', textAlign: 'center', marginBottom: '12px',
          }}>
            🧠 你已贡献 <strong style={{ color: '#00f2fe' }}>{state.totalDataPoints}</strong> 个行为数据点
          </div>
        )}

        {/* Action button */}
        <button
          onClick={handleStartClick}
          disabled={isCompletedToday || allDone}
          style={{
            width: '100%', padding: '12px',
            background: allDone
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : isCompletedToday
              ? 'rgba(255,255,255,0.04)'
              : 'linear-gradient(135deg, #a855f7, #00f2fe)',
            border: isCompletedToday ? '1px solid rgba(255,255,255,0.08)' : 'none',
            borderRadius: '12px', color: isCompletedToday ? '#334155' : '#0d1423',
            fontWeight: 700, fontSize: '14px', cursor: isCompletedToday ? 'not-allowed' : 'pointer',
            boxShadow: (!isCompletedToday && !allDone) ? '0 0 24px rgba(168,85,247,0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {allDone && state.rewarded
            ? '🎉 已完成全部挑战！感谢你的贡献'
            : allDone
            ? '🎁 领取 Neuro Plan 3 个月奖励'
            : isCompletedToday
            ? `✓ 今日已签到 · 明天继续 (${state.streak}/4)`
            : state.streak === 0
            ? '🛡️ 开始 Day 1 验证 (~10秒)'
            : `🛡️ 继续 Day ${state.streak + 1} 验证 (~10秒)`}
        </button>

        {/* Just completed flash */}
        {justCompleted && (
          <div style={{
            position: 'absolute', bottom: '70px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(16,185,129,0.95)', color: '#fff',
            borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: 700,
            whiteSpace: 'nowrap', boxShadow: '0 0 20px rgba(16,185,129,0.5)',
            animation: 'vms-slide-up 0.4s ease',
          }}>
            ✅ Day {justCompleted} 完成！🔥 Streak: {state.streak}/4
          </div>
        )}
      </div>

      <style>{`
        @keyframes vms-ping {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168,85,247,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(168,85,247,0); }
        }
        @keyframes vms-pulse {
          from { box-shadow: 0 0 30px rgba(16,185,129,0.4); }
          to { box-shadow: 0 0 50px rgba(16,185,129,0.8); }
        }
        @keyframes vms-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default DailyCheckinWidget;
