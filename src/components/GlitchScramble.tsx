'use client';

import type { ReactNode } from 'react';
import { Children, Fragment, cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import Link from './Link';

type GlitchCharRecord = {
  el: HTMLElement;
  original: string;
  current: string;
  x: number;
  y: number;
  until: number;
};

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
  const rootRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const wrappedChildren = useMemo(
    () => enabled ? wrapNode(children, 'root') : children,
    [children, enabled]
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => setEnabled(visible && pointer.matches && !motion.matches);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(root);
    pointer.addEventListener('change', update);
    motion.addEventListener('change', update);
    return () => {
      observer.disconnect();
      pointer.removeEventListener('change', update);
      motion.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    const records: GlitchCharRecord[] = Array.from(
      root.querySelectorAll<HTMLElement>('[data-glitch-char]')
    ).map(el => {
      const original = String.fromCodePoint(Number(el.dataset.glitchCode));
      return { el, original, current: original, x: 0, y: 0, until: 0 };
    });
    const active = new Set<GlitchCharRecord>();
    let frame: number | null = null;
    let lastFrame = 0;
    let centersDirty = true;
    let lastPoint: { x: number; y: number } | null = null;
    const rx = Math.max(1, radius * Math.max(0.1, tailRadiusFactor));
    const ry = Math.max(1, rx * Math.max(0.05, radiusYFactor));

    const write = (record: GlitchCharRecord, value: string) => {
      if (record.current === value) return;
      record.el.textContent = value;
      record.current = value;
    };
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      for (const record of active) write(record, record.original);
      active.clear();
      lastPoint = null;
    };
    const invalidate = () => {
      centersDirty = true;
      stop();
    };
    const measure = () => {
      // Read geometry once before any text mutations, never on every scroll.
      for (const record of records) {
        const rect = record.el.getBoundingClientRect();
        record.x = rect.left + rect.width / 2;
        record.y = rect.top + rect.height / 2;
      }
      centersDirty = false;
    };
    const tick = (now: number) => {
      frame = null;
      if (now - lastFrame >= 40) {
        lastFrame = now;
        for (const record of active) {
          if (now >= record.until) {
            write(record, record.original);
            active.delete(record);
            continue;
          }
          const fade = glitchHoldMs > 0 ? Math.min(1, (record.until - now) / glitchHoldMs) : 0;
          const value = symbols && Math.random() < fade * fade
            ? symbols[Math.floor(Math.random() * symbols.length)]
            : record.original;
          write(record, value);
        }
      }
      if (active.size) frame = requestAnimationFrame(tick);
    };
    const enter = () => { centersDirty = true; lastPoint = null; };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || document.hidden) return;
      const x = event.clientX;
      const y = event.clientY;
      if (lastPoint && Math.hypot(x - lastPoint.x, y - lastPoint.y) < 2) return;
      if (centersDirty) measure();
      lastPoint = { x, y };
      const until = performance.now() + Math.max(0, trailDurationMs) + Math.max(0, glitchHoldMs);
      for (const record of records) {
        const dx = (x - record.x) / rx;
        const dy = (y - record.y) / ry;
        if (dx * dx + dy * dy >= 1) continue;
        record.until = until;
        active.add(record);
      }
      if (active.size && frame === null) frame = requestAnimationFrame(tick);
    };
    const leave = () => { lastPoint = null; };
    const visibility = () => { if (document.hidden) invalidate(); };
    const resizeObserver = new ResizeObserver(invalidate);
    resizeObserver.observe(root);
    root.addEventListener('pointerenter', enter);
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', leave);
    // Capture nested scroll events; invalidation does no geometry reads.
    document.addEventListener('scroll', invalidate, { capture: true, passive: true });
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('resize', invalidate);
    return () => {
      stop();
      resizeObserver.disconnect();
      root.removeEventListener('pointerenter', enter);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
      document.removeEventListener('scroll', invalidate, true);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('resize', invalidate);
    };
  }, [enabled, wrappedChildren, radius, radiusYFactor, tailRadiusFactor, trailDurationMs, glitchHoldMs, symbols]);

  return <div ref={rootRef} className={className}>{wrappedChildren}</div>;
}
