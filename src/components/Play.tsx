'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';

type GameState = 'idle' | 'playing' | 'gameOver';
type Direction = 'up' | 'down' | 'left' | 'right';
type Position = { x: number; y: number };

const GRID_SIZE = 25;
const BASE_CELL_SIZE = 16;
const GAME_SPEED = 150;

export default function Play() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [actualCellSize, setActualCellSize] = useState(BASE_CELL_SIZE);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [snake, setSnake] = useState<Position[]>([]);
  const [food, setFood] = useState<Position>({ x: 0, y: 0 });
  const [direction, setDirection] = useState<Direction>('right');
  const [nextDirection, setNextDirection] = useState<Direction>('right');
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isNewBestScore, setIsNewBestScore] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const nextDirectionRef = useRef<Direction>('right');
  const foodRef = useRef<Position>({ x: 0, y: 0 });
  const playSound = useKeyboardSound();
  
  // Sound effects
  const eatSoundRef = useRef<HTMLAudioElement | null>(null);
  const deadSoundRef = useRef<HTMLAudioElement | null>(null);

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

  // Keep food ref in sync with food state
  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  // Calculate actual cell size based on rendered board size
  useEffect(() => {
    const calculateCellSize = () => {
      const gameBoard = document.querySelector('[data-game-board]');
      if (gameBoard) {
        const actualWidth = gameBoard.getBoundingClientRect().width;
        const newCellSize = actualWidth / GRID_SIZE;
        setActualCellSize(newCellSize);
      }
    };

    calculateCellSize();
    window.addEventListener('resize', calculateCellSize);
    return () => window.removeEventListener('resize', calculateCellSize);
  }, [gameState]); // Recalculate when game state changes



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
    setSnake(prevSnake => {
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
        // Game over
        setGameState('gameOver');
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
          gameLoopRef.current = null;
        }
        
        // Play dead sound
        if (deadSoundRef.current) {
          deadSoundRef.current.currentTime = 0;
          deadSoundRef.current.play().catch(console.error);
        }
        
        return prevSnake;
      }

      // Check if food eaten - use ref to get current food position
      const currentFood = foodRef.current;
      const ateFood = head.x === currentFood.x && head.y === currentFood.y;
      
      if (ateFood) {
        // Play eat sound
        if (eatSoundRef.current) {
          eatSoundRef.current.currentTime = 0;
          eatSoundRef.current.play().catch(console.error);
        }
        
        // Update score
        setScore(prevScore => prevScore + 1);
        
        // Snake grows: add new head, keep all previous segments (don't remove tail)
        const newSnake = [head, ...prevSnake];
        
        // Generate new food that doesn't overlap with the new snake
        const newFood = generateFood(newSnake);
        setFood(newFood);
        foodRef.current = newFood;
        
        return newSnake;
      } else {
        // Normal movement: add new head, remove tail (snake length stays same)
        return [head, ...prevSnake.slice(0, -1)];
      }
    });
  }, [checkCollision, generateFood]);

  // Start game
  const startGame = useCallback(() => {
    const initialSnake = initializeSnake();
    setSnake(initialSnake);
    const initialFood = generateFood(initialSnake);
    setFood(initialFood);
    foodRef.current = initialFood;
    setScore(0);
    setDirection('right');
    nextDirectionRef.current = 'right';
    setNextDirection('right');
    setGameState('playing');
    setIsNewBestScore(false);
    
    // Start game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    gameLoopRef.current = setInterval(updateGame, GAME_SPEED);
  }, [initializeSnake, generateFood, updateGame]);

  // Restart game
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Handle keyboard input - WASD only for game controls
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

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
        nextDirectionRef.current = newDirection;
        setNextDirection(newDirection);
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
  }, [gameState, direction]);

  // Handle touch/swipe controls for mobile
  useEffect(() => {
    if (gameState !== 'playing') return;

    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 30; // Minimum distance for a swipe

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
        nextDirectionRef.current = newDirection;
        setNextDirection(newDirection);
      }

      // Reset touch coordinates
      touchStartX = 0;
      touchStartY = 0;
    };

    // Add touch event listeners to the game area
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, direction]);

  // Cleanup game loop on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  const handleStartClick = () => {
    playSound();
    startGame();
  };

  const handleRestartClick = () => {
    playSound();
    restartGame();
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
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

  // Idle state (empty state)
  if (gameState === 'idle') {
    return (
      <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[16px] items-center justify-center max-w-[400px] relative shrink-0 w-full">
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
      </div>
    );
  }

  // Playing state
  if (gameState === 'playing') {
    return (
      <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[8px] items-center justify-center max-w-[400px] relative shrink-0 w-full">
          <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
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
            className="bg-[rgba(255,255,255,0.02)] border-2 border-[rgba(255,255,255,0.02)] border-solid h-[400px] w-[400px] max-w-[90vw] max-h-[90vw] relative shrink-0 mx-auto aspect-square overflow-hidden"
            data-game-board
          >
            {/* Snake segments */}
            {snake.map((segment, index) => (
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
            ))}
            {/* Food */}
            <div
              className="absolute bg-white"
              style={{
                left: `${food.x * actualCellSize}px`,
                top: `${food.y * actualCellSize}px`,
                width: `${actualCellSize}px`,
                height: `${actualCellSize}px`,
              }}
            />
          </div>
          <div className="content-stretch flex font-mono font-semibold items-start justify-between leading-[16px] relative shrink-0 text-[12px] text-nowrap tracking-[0.24px] uppercase w-full whitespace-pre">
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
        </div>
      </div>
    );
  }

  // Game over state
  const finalBestScore = isNewBestScore ? score : bestScore;

  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[16px] items-center justify-center max-w-[400px] relative shrink-0 w-full">
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
    </div>
  );
}
