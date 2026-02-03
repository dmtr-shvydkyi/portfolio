'use client';

import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';
import Leaderboard, { type LeaderboardEntry } from '@/components/Leaderboard';

type GameState = 'idle' | 'playing' | 'paused' | 'dying' | 'gameOver';
type Direction = 'up' | 'down' | 'left' | 'right';
type Position = { x: number; y: number };
type DeathChunk = {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot: number;
  delay: number;
  isHead: boolean;
};

const GRID_SIZE = 25;
const BASE_CELL_SIZE = 16;
const BASE_GAME_SPEED = 150;
const MIN_GAME_SPEED = 70;
const SPEED_STEP_MS = 10;
const FOODS_PER_SPEED_STEP = 4;
const BOARD_BORDER_PX = 2;
const STACK_GAP_PX = 8;
const CRUMBLE_DURATION_MS = 320;
const CRUMBLE_STAGGER_MS = 10;
const FADE_DURATION_MS = 660;
const LEADERBOARD_LIMIT = 5;
const LEADERBOARD_COOKIE = 'snake_nick';
const LEADERBOARD_API = '/api/snake/leaderboard';
const NICKNAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const readCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find(part => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
};

const writeCookie = (name: string, value: string, days: number) => {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  let cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
  if (window.location.protocol === 'https:') {
    cookie += '; Secure';
  }
  document.cookie = cookie;
};

const generateNickname = () => {
  const randomBlock = () => Math.floor(Math.random() * 1000);
  const suffix = Array.from({ length: 3 }, () =>
    NICKNAME_CHARS[Math.floor(Math.random() * NICKNAME_CHARS.length)]
  ).join('');
  return `${randomBlock()}.${randomBlock()}.${randomBlock()}.${suffix}`;
};

export default function Play() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [actualCellSize, setActualCellSize] = useState(BASE_CELL_SIZE);
  const [boardSize, setBoardSize] = useState(GRID_SIZE * BASE_CELL_SIZE);
  const [speed, setSpeed] = useState(BASE_GAME_SPEED);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [snake, setSnake] = useState<Position[]>([]);
  const [deathChunks, setDeathChunks] = useState<DeathChunk[]>([]);
  const [food, setFood] = useState<Position>({ x: 0, y: 0 });
  const [direction, setDirection] = useState<Direction>('right');
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isNewBestScore, setIsNewBestScore] = useState(false);
  const [isGameFadingOut, setIsGameFadingOut] = useState(false);
  const [isGameOverVisible, setIsGameOverVisible] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [isMobileControls, setIsMobileControls] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [leaderboardNick, setLeaderboardNick] = useState<string | null>(null);
  
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextDirectionRef = useRef<Direction>('right');
  const snakeRef = useRef<Position[]>([]);
  const foodRef = useRef<Position>({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement | null>(null);
  const playAreaRef = useRef<HTMLDivElement | null>(null);
  const scoreRowRef = useRef<HTMLDivElement | null>(null);
  const keyRowRef = useRef<HTMLDivElement | null>(null);
  const dpadRef = useRef<HTMLDivElement | null>(null);
  const playSound = useKeyboardSound();
  const runIdRef = useRef(0);
  const submittedRunIdRef = useRef<number | null>(null);
  
  // Sound effects
  const eatSoundRef = useRef<HTMLAudioElement | null>(null);
  const deadSoundRef = useRef<HTMLAudioElement | null>(null);
  const crumbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameOverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize sound effects
  useEffect(() => {
    eatSoundRef.current = new Audio('/eat.mp3');
    deadSoundRef.current = new Audio('/dead.mp3');
    
    // Set volume to 50%
    eatSoundRef.current.volume = 0.5;
    deadSoundRef.current.volume = 0.5;
    
    // Preload sounds
    eatSoundRef.current.preload = 'auto';
    deadSoundRef.current.preload = 'auto';
    
    return () => {
      // Cleanup
      if (eatSoundRef.current) {
        eatSoundRef.current.src = '';
      }
      if (deadSoundRef.current) {
        deadSoundRef.current.src = '';
      }
    };
  }, []);

  // Load best score from localStorage on mount
  useEffect(() => {
    const savedBestScore = localStorage.getItem('snake-game-best-score');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore, 10));
    }
  }, []);

  // Handle best score update when game ends
  useEffect(() => {
    if (gameState === 'gameOver') {
      setBestScore(prevBestScore => {
        const isNewBest = score > prevBestScore;
        setIsNewBestScore(isNewBest);
        
        if (isNewBest) {
          localStorage.setItem('snake-game-best-score', score.toString());
          return score;
        }
        return prevBestScore;
      });
    }
  }, [gameState, score]);

  useEffect(() => {
    if (gameState === 'gameOver') {
      const frame = requestAnimationFrame(() => {
        setIsGameOverVisible(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    setIsGameOverVisible(false);
  }, [gameState]);

  // Dynamically adjust speed as the score grows
  useEffect(() => {
    const steps = Math.floor(score / FOODS_PER_SPEED_STEP);
    const nextSpeed = Math.max(BASE_GAME_SPEED - steps * SPEED_STEP_MS, MIN_GAME_SPEED);
    setSpeed(nextSpeed);
  }, [score]);

  // Detect mobile / coarse pointers for D-pad visibility
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const updateControls = () => setIsMobileControls(mediaQuery.matches);
    updateControls();
    mediaQuery.addEventListener('change', updateControls);
    return () => mediaQuery.removeEventListener('change', updateControls);
  }, []);

  // Keep food ref in sync with food state
  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(`${LEADERBOARD_API}?limit=${LEADERBOARD_LIMIT}`, {
        cache: 'no-store',
      });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data?.entries)) {
        setLeaderboardEntries(data.entries);
      }
    } catch {
      // Ignore fetch errors
    }
  }, []);

  const postLeaderboardScore = useCallback(async (value: number, nick: string) => {
    try {
      await fetch(LEADERBOARD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: value, nick }),
      });
    } catch {
      // Ignore POST errors
    }
  }, []);

  useEffect(() => {
    const existingNick = readCookie(LEADERBOARD_COOKIE);
    const nextNick = existingNick ?? generateNickname();
    if (!existingNick) {
      writeCookie(LEADERBOARD_COOKIE, nextNick, 365);
    }
    setLeaderboardNick(nextNick);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Keep snake ref in sync with snake state
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  // Calculate board size to fit the view and align to the grid
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'paused') return;
    const playArea = playAreaRef.current;
    if (!playArea) return;

    const updateBoardSize = () => {
      const width = playArea.clientWidth;
      const height = playArea.clientHeight;
      const scoreHeight = scoreRowRef.current?.offsetHeight ?? 0;
      const keyHeight = keyRowRef.current?.offsetHeight ?? 0;
      const dpadHeight = isMobileControls ? dpadRef.current?.offsetHeight ?? 0 : 0;
      const itemCount = isMobileControls ? 4 : 3;
      const gapTotal = STACK_GAP_PX * (itemCount - 1);
      const availableHeight = height - scoreHeight - keyHeight - dpadHeight - gapTotal;
      const rawSize = Math.min(width, availableHeight);

      if (!Number.isFinite(rawSize) || rawSize <= 0) return;

      const adjustedSize = Math.max(rawSize - BOARD_BORDER_PX * 2, GRID_SIZE);
      const contentSize = Math.floor(adjustedSize / GRID_SIZE) * GRID_SIZE;
      const nextSize = Math.max(contentSize, GRID_SIZE);

      setBoardSize(prev => (prev === nextSize ? prev : nextSize));
    };

    updateBoardSize();

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(updateBoardSize);
      resizeObserver.observe(playArea);
      if (scoreRowRef.current) resizeObserver.observe(scoreRowRef.current);
      if (keyRowRef.current) resizeObserver.observe(keyRowRef.current);
      if (dpadRef.current) resizeObserver.observe(dpadRef.current);
      return () => resizeObserver.disconnect();
    }

    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, [gameState, isMobileControls]);

  useEffect(() => {
    setActualCellSize(boardSize / GRID_SIZE);
  }, [boardSize]);

  useEffect(() => {
    if (gameState === 'idle') {
      fetchLeaderboard();
    }
  }, [gameState, fetchLeaderboard]);

  useEffect(() => {
    if (gameState !== 'gameOver') return;

    const nick = leaderboardNick ?? readCookie(LEADERBOARD_COOKIE) ?? generateNickname();
    if (!leaderboardNick) {
      setLeaderboardNick(nick);
      writeCookie(LEADERBOARD_COOKIE, nick, 365);
    }

    if (score <= 0) {
      fetchLeaderboard();
      return;
    }

    if (submittedRunIdRef.current === runIdRef.current) {
      fetchLeaderboard();
      return;
    }

    submittedRunIdRef.current = runIdRef.current;
    (async () => {
      await postLeaderboardScore(score, nick);
      await fetchLeaderboard();
    })();
  }, [gameState, score, leaderboardNick, fetchLeaderboard, postLeaderboardScore]);

  const clearDeathTimers = useCallback(() => {
    if (crumbleTimeoutRef.current) {
      clearTimeout(crumbleTimeoutRef.current);
      crumbleTimeoutRef.current = null;
    }
    if (gameOverTimeoutRef.current) {
      clearTimeout(gameOverTimeoutRef.current);
      gameOverTimeoutRef.current = null;
    }
  }, []);



  // Initialize snake position
  const initializeSnake = useCallback((): Position[] => {
    const center = Math.floor(GRID_SIZE / 2);
    return [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ];
  }, []);

  // Generate random food position
  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y)
    );
    return newFood;
  }, []);

  // Check collision
  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // Self collision - check if head collides with any body segment (excluding the current head)
    return body.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  // Game update logic
  const updateGame = useCallback(() => {
    const prevSnake = snakeRef.current;
    if (!prevSnake.length) return;

    const currentDirection = nextDirectionRef.current;
    setDirection(currentDirection);
    
    const head = { ...prevSnake[0] };
    
    // Move head based on direction
    switch (currentDirection) {
      case 'up':
        head.y -= 1;
        break;
      case 'down':
        head.y += 1;
        break;
      case 'left':
        head.x -= 1;
        break;
      case 'right':
        head.x += 1;
        break;
    }

    // Check collision
    if (checkCollision(head, prevSnake)) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }

      if (deadSoundRef.current) {
        deadSoundRef.current.currentTime = 0;
        deadSoundRef.current.play().catch(console.error);
      }

      clearDeathTimers();
      const now = Date.now();
      const maxStaggerIndex = Math.min(prevSnake.length - 1, 10);
      const maxDelay = maxStaggerIndex > 0 ? maxStaggerIndex * CRUMBLE_STAGGER_MS : 0;
      const nextChunks = prevSnake.map((segment, index) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 0.6 + Math.random() * 1.2;
        const margin = 0.2;
        const minDx = -segment.x + margin;
        const maxDx = GRID_SIZE - 1 - segment.x - margin;
        const minDy = -segment.y + margin;
        const maxDy = GRID_SIZE - 1 - segment.y - margin;
        const rawDx = Math.cos(angle) * distance;
        const rawDy = Math.sin(angle) * distance;
        const dx = Math.min(Math.max(rawDx, minDx), maxDx);
        const dy = Math.min(Math.max(rawDy, minDy), maxDy);
        const delay = Math.min(index, 10) * CRUMBLE_STAGGER_MS;
        return {
          id: `${now}-${index}`,
          x: segment.x,
          y: segment.y,
          dx,
          dy,
          rot: Math.random() * 50 - 25,
          delay,
          isHead: index === 0,
        };
      });

      setDeathChunks(nextChunks);
      setIsGameOverVisible(false);
      setIsGameFadingOut(false);
      setGameState('dying');
      const crumbleTotal = CRUMBLE_DURATION_MS + maxDelay;
      crumbleTimeoutRef.current = setTimeout(() => {
        setIsGameFadingOut(true);
      }, crumbleTotal);
      gameOverTimeoutRef.current = setTimeout(() => {
        setGameState('gameOver');
      }, crumbleTotal + FADE_DURATION_MS);
      
      return;
    }

    const currentFood = foodRef.current;
    const ateFood = head.x === currentFood.x && head.y === currentFood.y;
    let newSnake: Position[];

    if (ateFood) {
      newSnake = [head, ...prevSnake];
      const newFood = generateFood(newSnake);
      setFood(newFood);
      foodRef.current = newFood;
      setScore(prevScore => prevScore + 1);
      if (eatSoundRef.current) {
        eatSoundRef.current.currentTime = 0;
        eatSoundRef.current.play().catch(console.error);
      }
    } else {
      newSnake = [head, ...prevSnake.slice(0, -1)];
    }

    snakeRef.current = newSnake;
    setSnake(newSnake);
  }, [checkCollision, clearDeathTimers, generateFood]);

  // Start game
  const startGame = useCallback(() => {
    clearDeathTimers();
    runIdRef.current += 1;
    const initialSnake = initializeSnake();
    snakeRef.current = initialSnake;
    setSnake(initialSnake);
    setDeathChunks([]);
    setIsGameOverVisible(false);
    setIsGameFadingOut(false);
    const initialFood = generateFood(initialSnake);
    setFood(initialFood);
    foodRef.current = initialFood;
    setScore(0);
    setSpeed(BASE_GAME_SPEED);
    setDirection('right');
    nextDirectionRef.current = 'right';
    setGameState('playing');
    setIsNewBestScore(false);
  }, [clearDeathTimers, generateFood, initializeSnake]);

  // Restart game
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Game loop based on current speed and game state
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const loop = setInterval(updateGame, speed);
    gameLoopRef.current = loop;
    return () => {
      clearInterval(loop);
      gameLoopRef.current = null;
    };
  }, [gameState, speed, updateGame]);

  const requestDirectionChange = useCallback((newDirection: Direction) => {
    if (gameState !== 'playing') return;
    const currentDirection = direction;
    const isOpposite =
      (currentDirection === 'up' && newDirection === 'down') ||
      (currentDirection === 'down' && newDirection === 'up') ||
      (currentDirection === 'left' && newDirection === 'right') ||
      (currentDirection === 'right' && newDirection === 'left');
    
    if (!isOpposite && newDirection !== currentDirection) {
      nextDirectionRef.current = newDirection;
    }
  }, [direction, gameState]);

  // Handle keyboard input - WASD only for game controls
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'paused') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        setPressedKey(null);
        setGameState(prevState => prevState === 'playing' ? 'paused' : 'playing');
        return;
      }

      if (gameState !== 'playing') return;

      const key = e.key.toLowerCase();
      let newDirection: Direction | null = null;

      // Handle WASD keys only (not arrow keys)
      switch (key) {
        case 'w':
          if (direction !== 'down') newDirection = 'up';
          setPressedKey('w');
          break;
        case 's':
          if (direction !== 'up') newDirection = 'down';
          setPressedKey('s');
          break;
        case 'a':
          if (direction !== 'right') newDirection = 'left';
          setPressedKey('a');
          break;
        case 'd':
          if (direction !== 'left') newDirection = 'right';
          setPressedKey('d');
          break;
      }

      if (newDirection && newDirection !== direction) {
        e.preventDefault();
        e.stopPropagation();
        requestDirectionChange(newDirection);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setPressedKey(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    window.addEventListener('keyup', handleKeyUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [gameState, direction, requestDirectionChange]);

  // Handle touch/swipe controls for mobile
  useEffect(() => {
    if (gameState !== 'playing') return;

    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 30; // Minimum distance for a swipe

    const boardEl = boardRef.current;
    if (!boardEl) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX || !touchStartY) return;

      const touch = e.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Check if swipe distance is sufficient
      if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
        return;
      }

      let newDirection: Direction | null = null;

      // Determine swipe direction (prioritize the larger delta)
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && direction !== 'left') {
          newDirection = 'right';
        } else if (deltaX < 0 && direction !== 'right') {
          newDirection = 'left';
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && direction !== 'up') {
          newDirection = 'down';
        } else if (deltaY < 0 && direction !== 'down') {
          newDirection = 'up';
        }
      }

      if (newDirection && newDirection !== direction) {
        requestDirectionChange(newDirection);
      }

      // Reset touch coordinates
      touchStartX = 0;
      touchStartY = 0;
    };

    // Add touch event listeners to the game area
    boardEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    boardEl.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      boardEl.removeEventListener('touchstart', handleTouchStart);
      boardEl.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, direction, requestDirectionChange]);

  // Cleanup game loop on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (crumbleTimeoutRef.current) {
        clearTimeout(crumbleTimeoutRef.current);
      }
      if (gameOverTimeoutRef.current) {
        clearTimeout(gameOverTimeoutRef.current);
      }
    };
  }, []);

  const handleStartClick = () => {
    playSound();
    setIsPressed(false);
    startGame();
  };

  const handleRestartClick = () => {
    playSound();
    setIsPressed(false);
    restartGame();
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const getButtonStyles = () => {
    const baseStyles = "box-border content-stretch flex gap-[8px] items-center justify-center px-[4px] py-[2px] relative shrink-0 cursor-pointer transition-all duration-200";
    const scaleClass = isPressed ? "scale-95" : "";
    if (isHovered) {
      return `${baseStyles} bg-[rgba(255,255,255,0.24)] ${scaleClass}`;
    }
    return `${baseStyles} bg-[rgba(255,255,255,0.16)] ${scaleClass}`;
  };

  const getTextStyles = () => {
    const baseStyles = "font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-nowrap tracking-[0.24px] uppercase whitespace-pre transition-all duration-200";
    if (isHovered) {
      return `${baseStyles} text-[rgba(255,255,255,1)]`;
    }
    return `${baseStyles} text-[rgba(255,255,255,0.88)]`;
  };

  const leaderboardDivider = leaderboardEntries.length ? (
    <div className="w-[80px] h-px bg-[rgba(255,255,255,0.08)]" />
  ) : null;

  const leaderboardSection = leaderboardEntries.length ? (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full">
      <p className="font-mono font-bold leading-[26px] relative shrink-0 text-[20px] md:text-[22px] text-white text-center uppercase w-full">
        LEADERBOARD
      </p>
      <Leaderboard entries={leaderboardEntries} currentNick={leaderboardNick} />
    </div>
  ) : null;

  const finalBestScore = isNewBestScore ? score : bestScore;
  const gameOverContent = (
    <div className="content-stretch flex flex-col gap-[24px] md:gap-[32px] items-center justify-center max-w-[400px] my-auto relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-0 items-center justify-center relative shrink-0 w-full">
        <div className="content-stretch flex flex-col font-mono font-semibold gap-[8px] items-center relative shrink-0 uppercase w-full">
          {!isNewBestScore && (
            <div className="content-stretch flex gap-[8px] items-start justify-center leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.4)] text-nowrap tracking-[0.24px] whitespace-pre">
              <p className="relative shrink-0">
                Best Score:
              </p>
              <p className="relative shrink-0">
                {finalBestScore}
              </p>
            </div>
          )}
          <p className="leading-[48px] min-w-full relative shrink-0 text-[40px] text-white text-center w-[min-content]">
            {isNewBestScore ? 'BEST score' : 'GAMe over'}
          </p>
        </div>
        <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0">
          <div className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.32)] text-center tracking-[0.24px] w-[280px]">
            <p className="mb-[8px]">
              {score === 0 ? 'Try moving, WASD, please...' :
              isNewBestScore ? 'Very nice!' :
              'Not bad. Could be better.'}
            </p>
            <p className="text-white">
              {score}
            </p>
          </div>
        </div>
        <div 
          className={getButtonStyles()}
          onMouseDown={handleMouseDown}
          onMouseUp={handleRestartClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
        >
          <p className={getTextStyles()}>
            Restart
          </p>
        </div>
      </div>
      {leaderboardDivider}
      {leaderboardSection}
    </div>
  );

  // Idle state (empty state)
  if (gameState === 'idle') {
    return (
      <div className="basis-0 box-border content-stretch flex flex-col gap-0 grow items-center justify-start min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[24px] md:gap-[32px] items-center justify-center max-w-[400px] my-auto relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[24px] items-center justify-center relative shrink-0 w-full">
            <div className="content-stretch flex flex-col font-mono font-semibold gap-[8px] items-center relative shrink-0 uppercase w-full">
              <div className="content-stretch flex gap-[8px] items-start justify-center leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.4)] text-nowrap tracking-[0.24px] whitespace-pre">
                <p className="relative shrink-0">
                  Best Score:
                </p>
                <p className="relative shrink-0">
                  {bestScore}
                </p>
              </div>
              <p className="leading-[48px] min-w-full relative shrink-0 text-[40px] text-white text-center w-[min-content]">
                snake GAMe
              </p>
            </div>
            <div className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.32)] text-center tracking-[0.24px] w-full max-w-[280px]">
              <p className="mb-[8px]">This was supposed to be a detailed case study. Then I got bored.</p>
              <p>♡</p>
            </div>
            <div 
              className={getButtonStyles()}
              onMouseDown={handleMouseDown}
              onMouseUp={handleStartClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
            >
              <p className={getTextStyles()}>
                Start
              </p>
            </div>
          </div>
          {leaderboardDivider}
          {leaderboardSection}
        </div>
      </div>
    );
  }

  // Playing state
  if (gameState === 'playing' || gameState === 'paused' || gameState === 'dying') {
    const isPaused = gameState === 'paused';
    const isDying = gameState === 'dying';
    const shouldFadeOut = isDying && isGameFadingOut;
    const crossSize = Math.max(3, Math.round(actualCellSize * 0.23));
    const crossStroke = Math.max(1, Math.round(actualCellSize * 0.06));
    const crossInsetX = Math.round(actualCellSize * 0.2);
    const crossInsetY = Math.round(actualCellSize * 0.24);
    const boardOuter = boardSize + BOARD_BORDER_PX * 2;
    
    return (
      <div
        className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-0 min-w-px overflow-hidden p-[8px] relative shrink-0 w-full h-full transition-opacity"
        style={{
          opacity: shouldFadeOut ? 0 : 1,
          transitionDuration: `${FADE_DURATION_MS}ms`,
        }}
      >
        <div
          ref={playAreaRef}
          className="content-stretch flex flex-col gap-[8px] items-center justify-start md:justify-center max-w-[400px] relative shrink-0 w-full h-full min-h-0"
        >
          <div
            className="content-stretch flex flex-col gap-[8px] items-center justify-start md:justify-center relative shrink-0 mx-auto"
            style={{
              width: `${boardOuter}px`,
              maxWidth: '100%',
            }}
          >
            <div
              ref={scoreRowRef}
              className="content-stretch flex items-start justify-between relative shrink-0 w-full"
            >
            <p className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-white text-nowrap tracking-[0.24px] uppercase whitespace-pre">
              {score}
            </p>
            <div className="content-stretch flex font-mono font-semibold gap-[8px] items-start justify-center leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.4)] text-nowrap tracking-[0.24px] uppercase whitespace-pre">
              <p className="relative shrink-0">
                Best Score:
              </p>
              <p className="relative shrink-0">
                {bestScore}
              </p>
            </div>
          </div>
          <div 
            ref={boardRef}
            className="bg-[rgba(255,255,255,0.02)] border-2 border-[rgba(255,255,255,0.04)] border-solid box-content relative shrink-0 mx-auto overflow-hidden"
            data-game-board
            style={{
              width: `${boardSize}px`,
              height: `${boardSize}px`,
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
                `,
                backgroundSize: `${actualCellSize}px ${actualCellSize}px`,
                backgroundPosition: '0 0',
              }}
            />
            {/* Snake segments */}
            {!isDying && snake.map((segment, index) => {
              const isHead = index === 0;
              if (isHead) {
                const rotation =
                  direction === 'up' ? '-90deg' :
                  direction === 'down' ? '90deg' :
                  direction === 'left' ? '180deg' : '0deg';

                return (
                  <div
                    key="snake-head"
                    className="absolute bg-[rgba(255,255,255,0.2)]"
                    style={{
                      left: `${segment.x * actualCellSize}px`,
                      top: `${segment.y * actualCellSize}px`,
                      width: `${actualCellSize}px`,
                      height: `${actualCellSize}px`,
                      transform: `rotate(${rotation})`,
                      transformOrigin: 'center',
                    }}
                  >
                    <div
                      className="absolute bg-white"
                      style={{
                        width: '20%',
                        height: '20%',
                        right: '18%',
                        top: '20%',
                      }}
                    />
                    <div
                      className="absolute bg-white"
                      style={{
                        width: '20%',
                        height: '20%',
                        right: '18%',
                        bottom: '20%',
                      }}
                    />
                  </div>
                );
              }

              return (
                <div
                  key={`snake-${index}`}
                  className="absolute bg-[rgba(255,255,255,0.16)]"
                  style={{
                    left: `${segment.x * actualCellSize}px`,
                    top: `${segment.y * actualCellSize}px`,
                    width: `${actualCellSize}px`,
                    height: `${actualCellSize}px`,
                  }}
                />
              );
            })}
            {isDying && deathChunks.map(chunk => (
              <div
                key={chunk.id}
                className={`absolute animate-snake-crumble ${chunk.isHead ? 'bg-[rgba(255,255,255,0.2)]' : 'bg-[rgba(255,255,255,0.16)]'}`}
                style={{
                  left: `${chunk.x * actualCellSize}px`,
                  top: `${chunk.y * actualCellSize}px`,
                  width: `${actualCellSize}px`,
                  height: `${actualCellSize}px`,
                  ...( {
                    '--dx': `${chunk.dx * actualCellSize}px`,
                    '--dy': `${chunk.dy * actualCellSize}px`,
                    '--rot': `${chunk.rot}deg`,
                    '--delay': `${chunk.delay}ms`,
                    '--crumble-duration': `${CRUMBLE_DURATION_MS}ms`,
                  } as CSSProperties ),
                }}
              >
                {chunk.isHead && (
                  <>
                    <div
                      className="absolute"
                      style={{
                        width: `${crossSize}px`,
                        height: `${crossSize}px`,
                        right: `${crossInsetX}px`,
                        top: `${crossInsetY}px`,
                      }}
                    >
                      <div
                        className="absolute bg-white"
                        style={{
                          width: '100%',
                          height: `${crossStroke}px`,
                          top: '50%',
                          left: 0,
                          transform: 'translateY(-50%) rotate(45deg)',
                        }}
                      />
                      <div
                        className="absolute bg-white"
                        style={{
                          width: '100%',
                          height: `${crossStroke}px`,
                          top: '50%',
                          left: 0,
                          transform: 'translateY(-50%) rotate(-45deg)',
                        }}
                      />
                    </div>
                    <div
                      className="absolute"
                      style={{
                        width: `${crossSize}px`,
                        height: `${crossSize}px`,
                        right: `${crossInsetX}px`,
                        bottom: `${crossInsetY}px`,
                      }}
                    >
                      <div
                        className="absolute bg-white"
                        style={{
                          width: '100%',
                          height: `${crossStroke}px`,
                          top: '50%',
                          left: 0,
                          transform: 'translateY(-50%) rotate(45deg)',
                        }}
                      />
                      <div
                        className="absolute bg-white"
                        style={{
                          width: '100%',
                          height: `${crossStroke}px`,
                          top: '50%',
                          left: 0,
                          transform: 'translateY(-50%) rotate(-45deg)',
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
            {/* Food */}
            {!isDying && (
              <div
                className="absolute bg-white animate-pulse"
                style={{
                  left: `${food.x * actualCellSize}px`,
                  top: `${food.y * actualCellSize}px`,
                  width: `${actualCellSize}px`,
                  height: `${actualCellSize}px`,
                }}
              />
            )}
            {isPaused && (
              <div className="absolute inset-0 bg-[rgba(0,0,0,0.32)] backdrop-blur-[2px] flex items-center justify-center">
                <p className="font-mono text-white text-[14px] tracking-[0.24px] uppercase">
                  Paused
                </p>
              </div>
            )}
          </div>
          <div
            ref={keyRowRef}
            className="content-stretch flex font-mono font-semibold items-start justify-between leading-[16px] relative shrink-0 text-[12px] text-nowrap tracking-[0.24px] uppercase w-full whitespace-pre"
          >
            <p className={`relative shrink-0 transition-all duration-150 ease-out ${pressedKey === 'w' ? 'text-white scale-110' : 'text-[rgba(255,255,255,0.4)] scale-100'}`}>
              [W]
            </p>
            <p className={`relative shrink-0 transition-all duration-150 ease-out ${pressedKey === 'a' ? 'text-white scale-110' : 'text-[rgba(255,255,255,0.4)] scale-100'}`}>
              [A]
            </p>
            <p className={`relative shrink-0 transition-all duration-150 ease-out ${pressedKey === 's' ? 'text-white scale-110' : 'text-[rgba(255,255,255,0.4)] scale-100'}`}>
              [S]
            </p>
            <p className={`relative shrink-0 transition-all duration-150 ease-out ${pressedKey === 'd' ? 'text-white scale-110' : 'text-[rgba(255,255,255,0.4)] scale-100'}`}>
              [D]
            </p>
          </div>
          {isMobileControls && (
            <div
              ref={dpadRef}
              className="content-stretch grid grid-cols-3 grid-rows-3 gap-[6px] items-center justify-center max-w-[200px] w-full"
            >
              <div />
              <button
                type="button"
                aria-label="Up"
                className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] rounded-none appearance-none h-[36px] w-full active:scale-95 transition"
                onClick={() => requestDirectionChange('up')}
              />
              <div />
              <button
                type="button"
                aria-label="Left"
                className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] rounded-none appearance-none h-[36px] w-full active:scale-95 transition"
                onClick={() => requestDirectionChange('left')}
              />
              <div />
              <button
                type="button"
                aria-label="Right"
                className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] rounded-none appearance-none h-[36px] w-full active:scale-95 transition"
                onClick={() => requestDirectionChange('right')}
              />
              <div />
              <button
                type="button"
                aria-label="Down"
                className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] rounded-none appearance-none h-[36px] w-full active:scale-95 transition"
                onClick={() => requestDirectionChange('down')}
              />
              <div />
            </div>
          )}
          </div>
        </div>
      </div>
    );
  }

  // Game over state
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-start min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full transition-opacity"
      style={{
        opacity: isGameOverVisible ? 1 : 0,
        transitionDuration: `${FADE_DURATION_MS}ms`,
      }}
    >
      {gameOverContent}
    </div>
  );
}
