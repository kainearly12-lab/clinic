import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GsapTextRevealProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h1' | 'div' | 'p';
  id?: string;
  scrub?: boolean | number;
}

export function GsapTextReveal({
  children,
  className = '',
  as: Component = 'h2',
  id,
  scrub = 0.8,
}: GsapTextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Select all split word/token spans within this heading
    const words = el.querySelectorAll<HTMLElement>('.reveal-word');
    if (!words.length) return;

    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set(words, {
        opacity: 0.25,
        color: 'currentColor',
        filter: 'blur(1.5px)',
        y: 6,
      });

      // Scrubbed reveal animation matching scroll velocity
      gsap.to(words, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        stagger: {
          each: 0.08,
          from: 'start',
        },
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          end: 'top 45%',
          scrub: scrub,
          toggleActions: 'play reverse play reverse',
        },
      });
    }, el);

    return () => ctx.revert();
  }, [scrub]);

  // Recursively process children into word spans while preserving custom highlight spans and markup
  const renderFormattedChildren = (nodes: React.ReactNode): React.ReactNode => {
    return React.Children.map(nodes, (node, nodeIdx) => {
      if (typeof node === 'string') {
        const words = node.split(/(\s+)/);
        return words.map((word, wordIdx) => {
          if (/^\s+$/.test(word)) {
            return word; // preserve whitespace
          }
          return (
            <span
              key={`word-${nodeIdx}-${wordIdx}`}
              className="reveal-word inline-block transition-colors duration-300 will-change-[opacity,transform,filter]"
            >
              {word}
            </span>
          );
        });
      }

      if (React.isValidElement(node)) {
        // If it's a React element (e.g. <span className="text-[#00B8A9]">...</span> or <br />)
        if (node.type === 'br') {
          return node;
        }

        const elementProps = node.props as { children?: React.ReactNode; className?: string };
        return React.cloneElement(
          node,
          {
            ...elementProps,
            key: `elem-${nodeIdx}`,
            className: `${elementProps.className || ''} inline-block`,
          },
          renderFormattedChildren(elementProps.children)
        );
      }

      return node;
    });
  };

  return (
    <Component
      ref={containerRef as unknown as React.RefObject<HTMLHeadingElement>}
      id={id}
      className={`gsap-text-reveal-container ${className}`}
    >
      {renderFormattedChildren(children)}
    </Component>
  );
}
