'use client';

import type { ReactNode } from 'react';
import { Children, Fragment, cloneElement, isValidElement, useEffect, useMemo, useRef } from 'react';
import Link from './Link';

type GlitchCharRecord = {
  el: HTMLElement;
  originalChar: string;
  renderChar: string;
  isWhitespace: boolean;
  centerX: number;
  centerY: number;
  glitchUntil: number;
};

type TrailPoint = {
  x: number;
  y: number;
  t: number;
};

function findNearestScrollableAncestor(start: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = start.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const isScrollableOverflow = overflowY === 'auto' || overflowY === 'scroll';
    const isScrollable = isScrollableOverflow && current.scrollHeight > current.clientHeight + 1;
    if (isScrollable) return current;
    current = current.parentElement;
  }
  return null;
}

function wrapNode(node: ReactNode, path: string): ReactNode {
  if (node === null || node === undefined || typeof node === 'boolean') return node;

  if (typeof node === 'string' || typeof node === 'number') {
    const str = String(node);
    const tokens = str.split(/(\s+)/);
    return tokens.map((token, tokenIndex) => {
      if (token === '') return null;
      if (/^\s+$/.test(token)) {
        return (
          <Fragment key={`${path}.ws.${tokenIndex}`}>
            {token}
          </Fragment>
        );
      }

      let i = 0;
      const chars = Array.from(token);
      return (
        <span key={`${path}.w.${tokenIndex}`} className="inline-block align-baseline">
          {chars.map(ch => {
            const codePoint = ch.codePointAt(0);
            const code = codePoint === undefined ? 0 : codePoint;
            const renderChar = ch === ' ' ? '\u00A0' : ch;
            const key = `${path}.w.${tokenIndex}.c.${i}`;
            i += 1;
            return (
              <span
                key={key}
                data-glitch-char="1"
                data-glitch-code={String(code)}
                className="inline-block"
              >
                {renderChar}
              </span>
            );
          })}
        </span>
      );
    });
  }

  if (Array.isArray(node)) {
    return node.map((child, idx) => (
      <Fragment key={`${path}.${idx}`}>
        {wrapNode(child, `${path}.${idx}`)}
      </Fragment>
    ));
  }

  if (isValidElement(node)) {
    // Hard exclude: links and interactive elements must remain untouched and clickable.
    if (node.type === Link) return node;
    if (typeof node.type === 'string') {
      const tag = node.type.toLowerCase();
      if (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'option') {
        return node;
      }
    }

    const children = (node.props as { children?: ReactNode } | undefined)?.children;
    if (children === undefined) return node;

    const wrappedChildren = Children.map(children, (child, idx) => wrapNode(child, `${path}.${idx}`));
    return cloneElement(node, { children: wrappedChildren } as never);
  }

  return node;
}

export default function GlitchScramble({
  className,
  children,
  radius = 60,
  radiusYFactor = 1,
  tailRadiusFactor = 0.7,
  trailDurationMs = 1000,
  glitchHoldMs = 2400,
  symbols = '01#%&@$+-*/<>[]{}?!',
}: {
  className?: string;
  children: ReactNode;
  radius?: number;
  radiusYFactor?: number;
  tailRadiusFactor?: number;
  trailDurationMs?: number;
  glitchHoldMs?: number;
  symbols?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoveringRef = useRef(false);
  const activeRef = useRef(false);
  const pointsRef = useRef<TrailPoint[]>([]);
  const lastMoveRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const recordsRef = useRef<GlitchCharRecord[]>([]);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const scheduledCentersRef = useRef(false);

  const wrappedChildren = useMemo(() => wrapNode(children, 'root'), [children]);

  const restoreAll = () => {
    for (const record of recordsRef.current) {
      record.el.textContent = record.renderChar;
    }
  };

  const stop = () => {
    hoveringRef.current = false;
    activeRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    restoreAll();
  };

  const stopBurst = () => {
    activeRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    restoreAll();
  };

  const updateRecords = () => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-glitch-char="1"]'));
    recordsRef.current = nodes.map(el => {
      const codeStr = el.dataset.glitchCode;
      const code = codeStr ? Number.parseInt(codeStr, 10) : NaN;
      const originalChar = Number.isFinite(code) ? String.fromCodePoint(code) : (el.textContent ?? '');
      const isWhitespace = originalChar === ' ';
      const renderChar = isWhitespace ? '\u00A0' : originalChar;
      el.textContent = renderChar;
      return { el, originalChar, renderChar, isWhitespace, centerX: 0, centerY: 0, glitchUntil: 0 };
    });
  };

  const updateCenters = () => {
    for (const record of recordsRef.current) {
      const rect = record.el.getBoundingClientRect();
      record.centerX = rect.left + rect.width / 2;
      record.centerY = rect.top + rect.height / 2;
    }
  };

  const scheduleUpdateCenters = () => {
    if (scheduledCentersRef.current) return;
    scheduledCentersRef.current = true;
    requestAnimationFrame(() => {
      scheduledCentersRef.current = false;
      updateCenters();
    });
  };

  const randomSymbol = () => {
    if (!symbols || symbols.length === 0) return '';
    const i = Math.floor(Math.random() * symbols.length);
    return symbols[i] ?? '';
  };

  const tick = (now: number) => {
    if (!hoveringRef.current && !activeRef.current) return;

    const root = rootRef.current;
    if (!root) {
      stop();
      return;
    }

    if (root.closest('.pointer-events-none')) {
      stop();
      return;
    }

    const frameIntervalMs = 40;
    if (now - lastFrameRef.current < frameIntervalMs) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    lastFrameRef.current = now;

    const tailFactor = Math.max(0.1, tailRadiusFactor);
    const rx = Math.max(1, radius * tailFactor);
    const ry = Math.max(1, radius * Math.max(0.05, radiusYFactor) * tailFactor);
    const trailMs = Math.max(0, trailDurationMs);
    const holdMs = Math.max(0, glitchHoldMs);

    if (trailMs === 0) {
      pointsRef.current = [];
    } else {
      pointsRef.current = pointsRef.current.filter(point => now - point.t <= trailMs);
    }

    let hasActiveGlitch = false;
    for (const record of recordsRef.current) {
      if (record.isWhitespace) continue;
      let maxIntensity = 0;

      for (const point of pointsRef.current) {
        const age = now - point.t;
        const ageFactor = trailMs > 0 ? Math.max(0, 1 - age / trailMs) : 0;
        if (ageFactor <= 0) continue;
        const dx = point.x - record.centerX;
        const dy = point.y - record.centerY;
        const norm = Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
        if (norm < 1) {
          const rawIntensity = Math.max(0, 1 - norm) * ageFactor;
          const intensity = rawIntensity ** 1.3;
          if (intensity > maxIntensity) maxIntensity = intensity;
        }
      }

      if (maxIntensity > 0) {
        const until = now + holdMs;
        if (until > record.glitchUntil) record.glitchUntil = until;
      }

      if (record.glitchUntil > now) {
        hasActiveGlitch = true;
        const remaining = record.glitchUntil - now;
        const fade = holdMs > 0 ? Math.min(1, remaining / holdMs) : 0;
        const p = fade * fade;
        record.el.textContent = Math.random() < p ? randomSymbol() : record.renderChar;
      } else {
        record.el.textContent = record.renderChar;
      }
    }

    const hasActiveTrail = pointsRef.current.length > 0;
    activeRef.current = hasActiveTrail || hasActiveGlitch;

    if (activeRef.current || hoveringRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      stopBurst();
    }
  };

  const startLoop = () => {
    if (reducedMotionRef.current) return;
    activeRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    lastFrameRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const root = rootRef.current;
    if (!root) return;

    updateRecords();
    updateCenters();

    scrollParentRef.current = findNearestScrollableAncestor(root);

    const handleScroll = () => scheduleUpdateCenters();
    const handleResize = () => scheduleUpdateCenters();

    if (scrollParentRef.current) {
      scrollParentRef.current.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('resize', handleResize);

    resizeObserverRef.current = new ResizeObserver(() => scheduleUpdateCenters());
    resizeObserverRef.current.observe(root);

    return () => {
      stop();
      if (scrollParentRef.current) {
        scrollParentRef.current.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleResize);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      scrollParentRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      className={className}
      onPointerEnter={e => {
        if (reducedMotionRef.current) return;
        hoveringRef.current = true;
        pointerRef.current = { x: e.clientX, y: e.clientY };
        updateRecords();
        updateCenters();
        startLoop();
      }}
      onPointerMove={e => {
        if (!hoveringRef.current || reducedMotionRef.current) return;
        const now = performance.now();
        const { clientX, clientY } = e;
        pointerRef.current = { x: clientX, y: clientY };

        const lastMove = lastMoveRef.current;
        const dx = lastMove ? clientX - lastMove.x : Infinity;
        const dy = lastMove ? clientY - lastMove.y : Infinity;
        const dist = Math.hypot(dx, dy);
        const dt = lastMove ? now - lastMove.t : Infinity;
        if (dist > 2 || dt > 24) {
          pointsRef.current.push({ x: clientX, y: clientY, t: now });
          lastMoveRef.current = { x: clientX, y: clientY, t: now };
          if (!activeRef.current) {
            updateRecords();
            updateCenters();
            startLoop();
          }
        }
      }}
      onPointerLeave={() => {
        hoveringRef.current = false;
        lastMoveRef.current = null;
      }}
    >
      {wrappedChildren}
    </div>
  );
}
