'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback, type CSSProperties } from 'react';
import Link from './Link';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';
import { useGameSounds } from '@/hooks/useGameSounds';
import { usePageTransition } from '@/hooks/usePageTransition';

type GameState = 'ready' | 'playing' | 'paused' | 'dying' | 'gameOver' | 'won';
type Ball = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};
type BrickChunk = {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot: number;
  bornAt: number;
};

const GRID_SIZE = 25;
const BASE_CELL_SIZE = 16;
const BOARD_BORDER_PX = 2;
const STACK_GAP_PX = 8;
const PADDLE_WIDTH = 5;
const PADDLE_HEIGHT = 1;
const PADDLE_Y = GRID_SIZE - 2;
const PADDLE_KEY_SPEED = 20;
const BALL_RADIUS = 0.5;
const SPEED_LEVELS = [12, 15, 18];
const SCORE_PER_SPEED_LEVEL = 16;
const MAX_SUBSTEP = 0.35;
const STARTING_LIVES = 3;
const CRUMBLE_DURATION_MS = 420;
const GLITCH_DURATION_MS = 400;
const FADE_DURATION_MS = 660;
const BEST_SCORE_STORAGE_KEY = 'breakout-404-best-score';

// 5x7 pixel digits, drawn with the same cells as the snake game
const PIXEL_DIGITS: Record<string, string[]> = {
  '4': [
    'X...X',
    'X...X',
    'X...X',
    'XXXXX',
    '....X',
    '....X',
    '....X',
  ],
  '0': [
    'XXXXX',
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    'XXXXX',
  ],
};
const BRICK_TEXT = '404';
const DIGIT_WIDTH = 5;
const DIGIT_GAP = 2;
const BRICKS_OFFSET_Y = 3;

const buildBricks = () => {
  const totalWidth = BRICK_TEXT.length * DIGIT_WIDTH + (BRICK_TEXT.length - 1) * DIGIT_GAP;
  const offsetX = Math.floor((GRID_SIZE - totalWidth) / 2);
  const bricks: Array<{ x: number; y: number }> = [];
  BRICK_TEXT.split('').forEach((char, digitIndex) => {
    const rows = PIXEL_DIGITS[char];
    rows.forEach((row, y) => {
      row.split('').forEach((cell, x) => {
        if (cell === 'X') {
          bricks.push({
            x: offsetX + digitIndex * (DIGIT_WIDTH + DIGIT_GAP) + x,
            y: BRICKS_OFFSET_Y + y,
          });
        }
      });
    });
  });
  return bricks;
};

const BRICKS = buildBricks();
const TOTAL_BRICKS = BRICKS.length;
const BRICK_KEYS = new Set(BRICKS.map(brick => `${brick.x},${brick.y}`));

// Multiball power-up: the white pixel in the hollow center of the zero
const POWER_UP_CELL = (() => {
  const totalWidth = BRICK_TEXT.length * DIGIT_WIDTH + (BRICK_TEXT.length - 1) * DIGIT_GAP;
  const offsetX = Math.floor((GRID_SIZE - totalWidth) / 2);
  return {
    x: offsetX + (DIGIT_WIDTH + DIGIT_GAP) + Math.floor(DIGIT_WIDTH / 2),
    y: BRICKS_OFFSET_Y + Math.floor(PIXEL_DIGITS['0'].length / 2),
  };
})();

const brickKey = (x: number, y: number) => `${x},${y}`;

// Paddle renders and collides snapped to whole grid cells
const snapPaddleCol = (centerX: number) =>
  Math.min(Math.max(Math.round(centerX - PADDLE_WIDTH / 2), 0), GRID_SIZE - PADDLE_WIDTH);

const snapPaddleCenter = (centerX: number) => snapPaddleCol(centerX) + PADDLE_WIDTH / 2;

export default function Breakout404() {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [boardSize, setBoardSize] = useState(GRID_SIZE * BASE_CELL_SIZE);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isNewBestScore, setIsNewBestScore] = useState(false);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [destroyed, setDestroyed] = useState<Set<string>>(() => new Set());
  const [chunks, setChunks] = useState<BrickChunk[]>([]);
  const [balls, setBalls] = useState<Array<{ id: number; x: number; y: number }>>([
    { id: 0, x: GRID_SIZE / 2, y: PADDLE_Y - BALL_RADIUS },
  ]);
  const [paddleX, setPaddleX] = useState(GRID_SIZE / 2);
  const [isPowerUpTaken, setIsPowerUpTaken] = useState(false);
  const [pressedKeys, setPressedKeys] = useState({ a: false, d: false });
  const [isBoardGlitching, setIsBoardGlitching] = useState(false);
  const [isGameFadingOut, setIsGameFadingOut] = useState(false);
  const [isGameOverVisible, setIsGameOverVisible] = useState(false);
  const [isMobileControls, setIsMobileControls] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const actualCellSize = boardSize / GRID_SIZE;

  const gameStateRef = useRef<GameState>('ready');
  const ballsRef = useRef<Ball[]>([{ id: 0, x: GRID_SIZE / 2, y: PADDLE_Y - BALL_RADIUS, vx: 0, vy: 0 }]);
  const ballIdRef = useRef(1);
  const powerUpTakenRef = useRef(false);
  const paddleXRef = useRef(GRID_SIZE / 2);
  const keysHeldRef = useRef({ left: false, right: false });
  const destroyedRef = useRef<Set<string>>(new Set());
  const livesRef = useRef(STARTING_LIVES);
  const wonRef = useRef(false);
  const cellSizeRef = useRef(BASE_CELL_SIZE);
  const pointerDragRef = useRef<{
    id: number;
    startClientX: number;
    startPaddleX: number;
    moved: boolean;
    startTime: number;
  } | null>(null);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const playAreaRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const scoreRowRef = useRef<HTMLDivElement | null>(null);
  const keyRowRef = useRef<HTMLDivElement | null>(null);
  const footerRowRef = useRef<HTMLDivElement | null>(null);

  const brickSoundRef = useRef<HTMLAudioElement | null>(null);
  const deadSoundRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useKeyboardSound();
  const { playThruster, playBounce } = useGameSounds();
  const { navigate } = usePageTransition();

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useLayoutEffect(() => {
    cellSizeRef.current = actualCellSize;
  }, [actualCellSize]);

  // Initialize sound effects (same assets as the snake game)
  useEffect(() => {
    brickSoundRef.current = new Audio('/eat.mp3');
    deadSoundRef.current = new Audio('/dead.mp3');
    brickSoundRef.current.volume = 0.4;
    deadSoundRef.current.volume = 0.5;
    brickSoundRef.current.preload = 'auto';
    deadSoundRef.current.preload = 'auto';

    return () => {
      if (brickSoundRef.current) {
        brickSoundRef.current.src = '';
      }
      if (deadSoundRef.current) {
        deadSoundRef.current.src = '';
      }
    };
  }, []);

  // Load best score from localStorage on mount
  useEffect(() => {
    const savedBestScore = localStorage.getItem(BEST_SCORE_STORAGE_KEY);
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore, 10));
    }
  }, []);

  // Handle best score update when a run ends
  useEffect(() => {
    if (gameState !== 'gameOver' && gameState !== 'won') return;
    setBestScore(prevBestScore => {
      const isNewBest = score > prevBestScore;
      setIsNewBestScore(isNewBest);
      if (isNewBest) {
        localStorage.setItem(BEST_SCORE_STORAGE_KEY, score.toString());
        return score;
      }
      return prevBestScore;
    });
  }, [gameState, score]);

  useEffect(() => {
    if (gameState === 'gameOver' || gameState === 'won') {
      const frame = requestAnimationFrame(() => {
        setIsGameOverVisible(true);
      });
      return () => cancelAnimationFrame(frame);
    }
    setIsGameOverVisible(false);
  }, [gameState]);

  // Detect mobile / coarse pointers for control hints
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const updateControls = () => setIsMobileControls(mediaQuery.matches);
    updateControls();
    mediaQuery.addEventListener('change', updateControls);
    return () => mediaQuery.removeEventListener('change', updateControls);
  }, []);

  const isBoardState = gameState === 'ready' || gameState === 'playing' || gameState === 'paused' || gameState === 'dying';

  // Calculate board size to fit the view and align to the grid
  useLayoutEffect(() => {
    if (!isBoardState) return;
    const playArea = playAreaRef.current;
    if (!playArea) return;

    const updateBoardSize = () => {
      const width = playArea.clientWidth;
      const height = playArea.clientHeight;
      const scoreHeight = scoreRowRef.current?.offsetHeight ?? 0;
      const keyHeight = keyRowRef.current?.offsetHeight ?? 0;
      const footerHeight = footerRowRef.current?.offsetHeight ?? 0;
      const gapTotal = STACK_GAP_PX * 3;
      const availableHeight = height - scoreHeight - keyHeight - footerHeight - gapTotal;
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
      if (footerRowRef.current) resizeObserver.observe(footerRowRef.current);
      return () => resizeObserver.disconnect();
    }

    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, [isBoardState]);

  const scheduleTimer = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const currentBallSpeed = useCallback(() => {
    const level = Math.min(Math.floor(destroyedRef.current.size / SCORE_PER_SPEED_LEVEL), SPEED_LEVELS.length - 1);
    return SPEED_LEVELS[level];
  }, []);

  const movePaddleTo = useCallback((nextX: number) => {
    const half = PADDLE_WIDTH / 2;
    const clamped = Math.min(Math.max(nextX, half), GRID_SIZE - half);
    paddleXRef.current = clamped;
    setPaddleX(clamped);
    if (gameStateRef.current === 'ready') {
      const restingX = snapPaddleCenter(clamped);
      const restingBall = ballsRef.current[0];
      if (restingBall) {
        restingBall.x = restingX;
        restingBall.y = PADDLE_Y - BALL_RADIUS;
      }
      setBalls(ballsRef.current.map(b => ({ id: b.id, x: b.x, y: b.y })));
    }
  }, []);

  const launchBall = useCallback(() => {
    if (gameStateRef.current !== 'ready') return;
    const restingBall = ballsRef.current[0];
    if (!restingBall) return;
    const speed = currentBallSpeed();
    const vx = speed * 0.3 * (Math.random() < 0.5 ? -1 : 1);
    restingBall.vx = vx;
    restingBall.vy = -Math.sqrt(speed * speed - vx * vx);
    playThruster();
    setGameState('playing');
  }, [currentBallSpeed, playThruster]);

  const destroyBrick = useCallback((cellX: number, cellY: number, now: number) => {
    destroyedRef.current.add(brickKey(cellX, cellY));
    setDestroyed(new Set(destroyedRef.current));
    setScore(destroyedRef.current.size);

    const angle = Math.random() * Math.PI;
    const distance = 0.6 + Math.random() * 1.2;
    const margin = 0.2;
    const rawDx = Math.cos(angle) * distance * (Math.random() < 0.5 ? -1 : 1);
    const rawDy = Math.abs(Math.sin(angle)) * distance + 0.4;
    const dx = Math.min(Math.max(rawDx, -cellX + margin), GRID_SIZE - 1 - cellX - margin);
    const dy = Math.min(Math.max(rawDy, -cellY + margin), GRID_SIZE - 1 - cellY - margin);
    const chunk: BrickChunk = {
      id: `${cellX}-${cellY}-${now}`,
      x: cellX,
      y: cellY,
      dx,
      dy,
      rot: Math.random() * 80 - 40,
      bornAt: now,
    };
    setChunks(prev => [
      ...prev.filter(existing => now - existing.bornAt < CRUMBLE_DURATION_MS + 100),
      chunk,
    ]);

    if (brickSoundRef.current) {
      brickSoundRef.current.currentTime = 0;
      brickSoundRef.current.play().catch(() => {});
    }
  }, []);

  const finishRun = useCallback((won: boolean) => {
    wonRef.current = won;
    setGameState('dying');
    setIsGameFadingOut(false);
    if (!won) {
      setIsBoardGlitching(true);
    }
    const holdMs = won ? 500 : GLITCH_DURATION_MS;
    scheduleTimer(() => {
      setIsBoardGlitching(false);
      setIsGameFadingOut(true);
    }, holdMs);
    scheduleTimer(() => {
      setGameState(won ? 'won' : 'gameOver');
    }, holdMs + FADE_DURATION_MS);
  }, [scheduleTimer]);

  const resetBallOnPaddle = useCallback(() => {
    const restingX = snapPaddleCenter(paddleXRef.current);
    ballsRef.current = [{
      id: ballIdRef.current++,
      x: restingX,
      y: PADDLE_Y - BALL_RADIUS,
      vx: 0,
      vy: 0,
    }];
    setBalls(ballsRef.current.map(b => ({ id: b.id, x: b.x, y: b.y })));
  }, []);

  const handleLifeLost = useCallback(() => {
    livesRef.current -= 1;
    setLives(livesRef.current);

    if (deadSoundRef.current) {
      deadSoundRef.current.currentTime = 0;
      deadSoundRef.current.play().catch(() => {});
    }

    resetBallOnPaddle();

    if (livesRef.current > 0) {
      setIsBoardGlitching(true);
      scheduleTimer(() => setIsBoardGlitching(false), GLITCH_DURATION_MS);
      setGameState('ready');
      return;
    }

    finishRun(false);
  }, [finishRun, resetBallOnPaddle, scheduleTimer]);

  const handleWin = useCallback(() => {
    ballsRef.current.forEach(ballBody => {
      ballBody.vx = 0;
      ballBody.vy = 0;
    });
    finishRun(true);
  }, [finishRun]);

  const stepGame = useCallback((dt: number, now: number) => {
    const held = keysHeldRef.current;
    const keyDirection = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    if (keyDirection !== 0) {
      movePaddleTo(paddleXRef.current + keyDirection * PADDLE_KEY_SPEED * dt);
    }

    if (gameStateRef.current === 'ready') {
      const restingX = snapPaddleCenter(paddleXRef.current);
      const restingBall = ballsRef.current[0];
      if (restingBall) {
        restingBall.x = restingX;
        restingBall.y = PADDLE_Y - BALL_RADIUS;
      }
      setBalls(ballsRef.current.map(b => ({ id: b.id, x: b.x, y: b.y })));
      return;
    }

    const paddleCenter = snapPaddleCenter(paddleXRef.current);
    const paddleHalf = PADDLE_WIDTH / 2;
    const speed = currentBallSpeed();
    const substeps = Math.max(1, Math.ceil((speed * dt) / MAX_SUBSTEP));
    const stepDt = dt / substeps;

    const rescaleAllBalls = () => {
      const nextSpeed = currentBallSpeed();
      ballsRef.current.forEach(each => {
        const magnitude = Math.hypot(each.vx, each.vy);
        if (magnitude === 0) return;
        each.vx = (each.vx / magnitude) * nextSpeed;
        each.vy = (each.vy / magnitude) * nextSpeed;
      });
    };

    for (let i = 0; i < substeps; i++) {
      // Snapshot length: balls spawned mid-substep start moving next substep
      const ballCount = ballsRef.current.length;
      let anyBallLost = false;

      for (let b = 0; b < ballCount; b++) {
        const ballBody = ballsRef.current[b];
        const prevY = ballBody.y;
        ballBody.x += ballBody.vx * stepDt;
        ballBody.y += ballBody.vy * stepDt;

        // Walls
        if (ballBody.x < BALL_RADIUS) {
          ballBody.x = BALL_RADIUS;
          ballBody.vx = Math.abs(ballBody.vx);
        } else if (ballBody.x > GRID_SIZE - BALL_RADIUS) {
          ballBody.x = GRID_SIZE - BALL_RADIUS;
          ballBody.vx = -Math.abs(ballBody.vx);
        }
        if (ballBody.y < BALL_RADIUS) {
          ballBody.y = BALL_RADIUS;
          ballBody.vy = Math.abs(ballBody.vy);
        }

        // Paddle
        if (
          ballBody.vy > 0 &&
          ballBody.y + BALL_RADIUS >= PADDLE_Y &&
          prevY + BALL_RADIUS <= PADDLE_Y + PADDLE_HEIGHT &&
          Math.abs(ballBody.x - paddleCenter) <= paddleHalf + BALL_RADIUS
        ) {
          const offset = Math.min(Math.max((ballBody.x - paddleCenter) / (paddleHalf + BALL_RADIUS), -1), 1);
          const bounceSpeed = currentBallSpeed();
          const vx = offset * bounceSpeed * 0.75;
          ballBody.vx = vx;
          ballBody.vy = -Math.sqrt(Math.max(bounceSpeed * bounceSpeed - vx * vx, (bounceSpeed * 0.35) ** 2));
          ballBody.y = PADDLE_Y - BALL_RADIUS;
          playBounce();
        }

        // Probe the ball's leading edges so a brick pops the moment it's touched
        const stepX = Math.sign(ballBody.vx);
        const stepY = Math.sign(ballBody.vy);
        const probes: Array<{ cellX: number; cellY: number; axis: 'x' | 'y' | 'both' }> = [];
        if (stepY !== 0) {
          probes.push({ cellX: Math.floor(ballBody.x), cellY: Math.floor(ballBody.y + stepY * BALL_RADIUS), axis: 'y' });
        }
        if (stepX !== 0) {
          probes.push({ cellX: Math.floor(ballBody.x + stepX * BALL_RADIUS), cellY: Math.floor(ballBody.y), axis: 'x' });
        }
        if (stepX !== 0 && stepY !== 0) {
          probes.push({ cellX: Math.floor(ballBody.x + stepX * BALL_RADIUS), cellY: Math.floor(ballBody.y + stepY * BALL_RADIUS), axis: 'both' });
        }

        for (const probe of probes) {
          if (probe.cellX < 0 || probe.cellX >= GRID_SIZE || probe.cellY < 0 || probe.cellY >= GRID_SIZE) continue;

          const reflect = () => {
            if (probe.axis === 'y' || probe.axis === 'both') ballBody.vy = -ballBody.vy;
            if (probe.axis === 'x' || probe.axis === 'both') ballBody.vx = -ballBody.vx;
          };

          // Multiball power-up: the pixel splits into a second ball
          if (
            !powerUpTakenRef.current &&
            probe.cellX === POWER_UP_CELL.x &&
            probe.cellY === POWER_UP_CELL.y
          ) {
            powerUpTakenRef.current = true;
            setIsPowerUpTaken(true);

            // The new ball continues along the original path, the old one bounces off
            ballsRef.current.push({
              id: ballIdRef.current++,
              x: POWER_UP_CELL.x + 0.5,
              y: POWER_UP_CELL.y + 0.5,
              vx: ballBody.vx,
              vy: ballBody.vy,
            });
            reflect();

            if (brickSoundRef.current) {
              brickSoundRef.current.currentTime = 0;
              brickSoundRef.current.play().catch(() => {});
            }
            break;
          }

          // Bricks
          const key = brickKey(probe.cellX, probe.cellY);
          if (BRICK_KEYS.has(key) && !destroyedRef.current.has(key)) {
            destroyBrick(probe.cellX, probe.cellY, now);
            reflect();
            rescaleAllBalls();

            if (destroyedRef.current.size >= TOTAL_BRICKS) {
              setBalls(ballsRef.current.map(each => ({ id: each.id, x: each.x, y: each.y })));
              handleWin();
              return;
            }
            break;
          }
        }

        // Bottom — ball lost
        if (ballBody.y - BALL_RADIUS > GRID_SIZE) {
          anyBallLost = true;
        }
      }

      if (anyBallLost) {
        ballsRef.current = ballsRef.current.filter(each => each.y - BALL_RADIUS <= GRID_SIZE);
        if (ballsRef.current.length === 0) {
          handleLifeLost();
          return;
        }
        playSound();
      }
    }

    setBalls(ballsRef.current.map(each => ({ id: each.id, x: each.x, y: each.y })));
  }, [currentBallSpeed, destroyBrick, handleLifeLost, handleWin, movePaddleTo, playBounce, playSound]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'ready') return;

    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      stepGame(dt, now);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [gameState, stepGame]);

  const restartGame = useCallback(() => {
    clearTimers();
    destroyedRef.current = new Set();
    setDestroyed(new Set());
    setChunks([]);
    setScore(0);
    livesRef.current = STARTING_LIVES;
    setLives(STARTING_LIVES);
    wonRef.current = false;
    keysHeldRef.current = { left: false, right: false };
    setPressedKeys({ a: false, d: false });
    paddleXRef.current = GRID_SIZE / 2;
    setPaddleX(GRID_SIZE / 2);
    powerUpTakenRef.current = false;
    setIsPowerUpTaken(false);
    resetBallOnPaddle();
    setIsBoardGlitching(false);
    setIsGameFadingOut(false);
    setIsGameOverVisible(false);
    setIsNewBestScore(false);
    setGameState('ready');
  }, [clearTimers, resetBallOnPaddle]);

  // Keyboard controls
  useEffect(() => {
    if (gameState === 'dying') return;

    const resolveKeyDirection = (e: KeyboardEvent): 'left' | 'right' | null => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft' || e.key.toLowerCase() === 'a' || e.key === 'ArrowLeft') return 'left';
      if (e.code === 'KeyD' || e.code === 'ArrowRight' || e.key.toLowerCase() === 'd' || e.key === 'ArrowRight') return 'right';
      return null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        if (gameState === 'ready') {
          launchBall();
        } else if (gameState === 'playing' || gameState === 'paused') {
          setGameState(prevState => (prevState === 'playing' ? 'paused' : 'playing'));
        } else if (gameState === 'gameOver' || gameState === 'won') {
          playSound();
          restartGame();
        }
        return;
      }

      const keyDirection = resolveKeyDirection(e);
      if (!keyDirection) return;

      e.preventDefault();
      e.stopPropagation();

      if (gameState !== 'ready' && gameState !== 'playing') return;

      keysHeldRef.current[keyDirection] = true;
      setPressedKeys(prev => {
        const nextKey = keyDirection === 'left' ? 'a' : 'd';
        if (prev[nextKey]) return prev;
        return { ...prev, [nextKey]: true };
      });
      if (!e.repeat) {
        playThruster();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyDirection = resolveKeyDirection(e);
      if (!keyDirection) return;
      keysHeldRef.current[keyDirection] = false;
      setPressedKeys(prev => ({ ...prev, [keyDirection === 'left' ? 'a' : 'd']: false }));
    };

    const handleBlur = () => {
      keysHeldRef.current = { left: false, right: false };
      setPressedKeys({ a: false, d: false });
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState, launchBall, playSound, playThruster, restartGame]);

  // Pointer controls: mouse follows the cursor, touch drags the paddle, tap launches
  const clientXToPaddleX = useCallback((clientX: number) => {
    const board = boardRef.current;
    if (!board) return paddleXRef.current;
    const rect = board.getBoundingClientRect();
    return (clientX - rect.left) / cellSizeRef.current;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (gameStateRef.current !== 'ready' && gameStateRef.current !== 'playing') return;
    if ((e.target as HTMLElement).closest('a, button')) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer may already be released; dragging still works while it stays over the area
    }
    pointerDragRef.current = {
      id: e.pointerId,
      startClientX: e.clientX,
      startPaddleX: paddleXRef.current,
      moved: false,
      startTime: performance.now(),
    };
    if (e.pointerType === 'mouse') {
      movePaddleTo(clientXToPaddleX(e.clientX));
    }
  }, [clientXToPaddleX, movePaddleTo]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (gameStateRef.current !== 'ready' && gameStateRef.current !== 'playing') return;

    const drag = pointerDragRef.current;
    if (drag && e.pointerId === drag.id) {
      if (!drag.moved && Math.abs(e.clientX - drag.startClientX) > 8) {
        drag.moved = true;
        if (e.pointerType !== 'mouse') {
          playThruster();
        }
      }
      if (e.pointerType === 'mouse') {
        movePaddleTo(clientXToPaddleX(e.clientX));
      } else {
        const deltaCells = (e.clientX - drag.startClientX) / cellSizeRef.current;
        movePaddleTo(drag.startPaddleX + deltaCells * 1.15);
      }
      return;
    }

    if (!drag && e.pointerType === 'mouse') {
      movePaddleTo(clientXToPaddleX(e.clientX));
    }
  }, [clientXToPaddleX, movePaddleTo, playThruster]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = pointerDragRef.current;
    if (!drag || e.pointerId !== drag.id) return;
    pointerDragRef.current = null;

    const isTap = !drag.moved && performance.now() - drag.startTime < 400;
    if (isTap && gameStateRef.current === 'ready') {
      launchBall();
    }
  }, [launchBall]);

  const handlePointerCancel = useCallback(() => {
    pointerDragRef.current = null;
  }, []);

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

  const goHomeLink = (
    <Link
      theme="dark"
      onClick={() => navigate('/#work', 'back')}
      className="[text-underline-offset:25%] decoration-solid font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.32)] text-nowrap tracking-[0.24px] underline uppercase whitespace-pre"
    >
      go home
    </Link>
  );

  // Game over / win screens
  if (gameState === 'gameOver' || gameState === 'won') {
    const won = gameState === 'won';
    const heading = won ? '404 destroyed' : 'GAMe over';
    const copy = won
      ? 'Error cleared. The page is still missing, though.'
      : score === 0
        ? 'Try moving. A, D, please...'
        : isNewBestScore
          ? 'Very nice!'
          : 'The 404 survived. It usually does.';
    const finalBestScore = isNewBestScore ? score : bestScore;

    return (
      <div
        className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-0 min-w-px overflow-hidden p-[8px] relative shrink-0 w-full h-full transition-opacity"
        style={{
          opacity: isGameOverVisible ? 1 : 0,
          transitionDuration: `${FADE_DURATION_MS}ms`,
        }}
      >
        <div className="content-stretch flex flex-col gap-[32px] items-center justify-center max-w-[400px] mt-[8px] relative shrink-0 w-full">
          <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full">
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
                {isNewBestScore && !won ? 'BEST score' : heading}
              </p>
            </div>
            <div className="mt-[16px] font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.32)] text-center tracking-[0.24px] w-[280px]">
              <p className="mb-[8px]">
                {copy}
              </p>
              <p className="text-white">
                {score} / {TOTAL_BRICKS}
              </p>
            </div>
            <div
              className={`${getButtonStyles()} mt-[24px]`}
              onMouseDown={handleMouseDown}
              onMouseUp={handleRestartClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
            >
              <p className={getTextStyles()}>
                Restart
              </p>
            </div>
            <div className="content-stretch flex gap-[8px] items-center justify-center mt-[16px] relative shrink-0">
              {goHomeLink}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPaused = gameState === 'paused';
  const isDying = gameState === 'dying';
  const boardOuter = boardSize + BOARD_BORDER_PX * 2;
  const paddleLeft = snapPaddleCol(paddleX) * actualCellSize;
  const centerHint = isMobileControls
    ? gameState === 'ready' ? 'tap to launch · drag to move' : isPaused ? 'paused' : 'drag to move'
    : gameState === 'ready' ? '[space] launch' : isPaused ? '[space] resume' : '[space] pause';

  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-0 min-w-px overflow-hidden p-[8px] relative shrink-0 w-full h-full transition-opacity"
      style={{
        opacity: isDying && isGameFadingOut ? 0 : 1,
        transitionDuration: `${FADE_DURATION_MS}ms`,
      }}
    >
      <div
        ref={playAreaRef}
        className="content-stretch flex flex-col gap-[8px] items-center justify-center max-w-[400px] relative shrink-0 w-full h-full min-h-0"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className="content-stretch flex flex-col gap-[8px] items-center justify-center relative shrink-0 mx-auto"
          style={{
            width: `${boardOuter}px`,
            maxWidth: '100%',
          }}
        >
          <div
            ref={scoreRowRef}
            className="content-stretch flex items-center justify-between relative shrink-0 w-full"
          >
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
              <p className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-white text-nowrap tracking-[0.24px] uppercase whitespace-pre">
                {score}
              </p>
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0" aria-label={`${lives} balls left`}>
                {Array.from({ length: STARTING_LIVES }, (_, index) => (
                  <span
                    key={`life-${index}`}
                    className="relative shrink-0 transition-colors duration-300"
                    style={{
                      width: '6px',
                      height: '6px',
                      background: index < lives ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.16)',
                    }}
                  />
                ))}
              </div>
            </div>
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
            className={`bg-[rgba(255,255,255,0.02)] border-2 border-[rgba(255,255,255,0.04)] border-solid box-content relative shrink-0 mx-auto overflow-hidden ${isBoardGlitching ? 'animate-glitch' : ''}`}
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
            {/* The 404, brick by brick */}
            {BRICKS.map(brick => {
              if (destroyed.has(brickKey(brick.x, brick.y))) return null;
              return (
                <div
                  key={`brick-${brick.x}-${brick.y}`}
                  className="absolute bg-[rgba(255,255,255,0.16)]"
                  style={{
                    left: `${brick.x * actualCellSize}px`,
                    top: `${brick.y * actualCellSize}px`,
                    width: `${actualCellSize}px`,
                    height: `${actualCellSize}px`,
                  }}
                />
              );
            })}
            {/* Crumbling bricks */}
            {chunks.map(chunk => (
              <div
                key={chunk.id}
                className="absolute bg-[rgba(255,255,255,0.16)] animate-brick-crumble"
                style={{
                  left: `${chunk.x * actualCellSize}px`,
                  top: `${chunk.y * actualCellSize}px`,
                  width: `${actualCellSize}px`,
                  height: `${actualCellSize}px`,
                  ...({
                    '--dx': `${chunk.dx * actualCellSize}px`,
                    '--dy': `${chunk.dy * actualCellSize}px`,
                    '--rot': `${chunk.rot}deg`,
                    '--crumble-duration': `${CRUMBLE_DURATION_MS}ms`,
                  } as CSSProperties),
                }}
              />
            ))}
            {/* Multiball power-up: brick-gray pixel with a slowly orbiting white glint */}
            {!isPowerUpTaken && !isDying && (
              <div
                className="absolute overflow-hidden"
                style={{
                  left: `${POWER_UP_CELL.x * actualCellSize}px`,
                  top: `${POWER_UP_CELL.y * actualCellSize}px`,
                  width: `${actualCellSize}px`,
                  height: `${actualCellSize}px`,
                }}
              >
                <div
                  className="absolute animate-powerup-spin"
                  style={{
                    inset: '-100%',
                    background: 'conic-gradient(from 0deg, #383838 0deg, rgba(255,255,255,0.95) 70deg, #383838 140deg, #383838 360deg)',
                  }}
                />
                {/* Solid equivalent of the brick tint over the board background */}
                <div className="absolute bg-[#383838]" style={{ inset: '2px' }} />
              </div>
            )}
            {/* Paddle */}
            <div
              className="absolute bg-[rgba(255,255,255,0.16)]"
              style={{
                left: `${paddleLeft}px`,
                top: `${PADDLE_Y * actualCellSize}px`,
                width: `${PADDLE_WIDTH * actualCellSize}px`,
                height: `${PADDLE_HEIGHT * actualCellSize}px`,
              }}
            />
            {/* Balls */}
            {!isDying && balls.map(each => (
              <div
                key={`ball-${each.id}`}
                className={`absolute bg-white ${gameState === 'ready' ? 'animate-pulse' : ''}`}
                style={{
                  left: `${(each.x - BALL_RADIUS) * actualCellSize}px`,
                  top: `${(each.y - BALL_RADIUS) * actualCellSize}px`,
                  width: `${actualCellSize}px`,
                  height: `${actualCellSize}px`,
                }}
              />
            ))}
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
            {!isMobileControls && (
              <p className={`relative shrink-0 transition-all duration-150 ease-out ${pressedKeys.a ? 'text-white scale-110' : 'text-[rgba(255,255,255,0.4)] scale-100'}`}>
                [A]
              </p>
            )}
            <p className={`relative shrink-0 text-[rgba(255,255,255,0.4)] ${isMobileControls ? 'mx-auto' : ''}`}>
              {centerHint}
            </p>
            {!isMobileControls && (
              <p className={`relative shrink-0 transition-all duration-150 ease-out ${pressedKeys.d ? 'text-white scale-110' : 'text-[rgba(255,255,255,0.4)] scale-100'}`}>
                [D]
              </p>
            )}
          </div>
          <div
            ref={footerRowRef}
            className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0 w-full"
          >
            {goHomeLink}
          </div>
        </div>
      </div>
    </div>
  );
}
