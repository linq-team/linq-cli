import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Text } from 'ink';
import { FRAMES, BOUNDS } from './banner-frames.js';

// Color themes — edit these values to customize for each background type.
const THEME_DARK: Record<string, string> = {
  whiteBright: '#ffffff',
};

const THEME_LIGHT: Record<string, string> = {
  whiteBright: 'blackBright',
};

type PlaybackAPI = {
  play: () => void;
  pause: () => void;
  restart: () => void;
};

type LinqCliProps = {
  hasDarkBackground?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  onReady?: (api: PlaybackAPI) => void;
};

const DEFAULT_LOOP = false;

export const LinqCli: React.FC<LinqCliProps> = ({
  hasDarkBackground = true,
  autoPlay = true,
  loop = DEFAULT_LOOP,
  onReady,
}) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const frameElapsedRef = useRef(0);
  const lastTimestampRef = useRef(Date.now());

  // Select color theme based on background
  const theme = useMemo(() => hasDarkBackground ? THEME_DARK : THEME_LIGHT, [hasDarkBackground]);
  const getColor = useCallback((key: string): string => theme[key] || key, [theme]);
  const defaultFg = hasDarkBackground ? "white" : "black";

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const restart = useCallback(() => {
    setFrameIndex(0);
    frameElapsedRef.current = 0;
    lastTimestampRef.current = Date.now();
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (onReady) {
      onReady({ play, pause, restart });
    }
  }, [onReady, play, pause, restart]);

  useEffect(() => {
    if (!isPlaying || FRAMES.length <= 1) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTimestampRef.current;
      lastTimestampRef.current = now;
      frameElapsedRef.current += delta;

      const currentFrame = FRAMES[frameIndex];
      if (frameElapsedRef.current >= currentFrame.duration) {
        frameElapsedRef.current = 0;
        const nextIndex = frameIndex + 1;
        if (nextIndex >= FRAMES.length) {
          if (loop) {
            setFrameIndex(0);
          } else {
            setIsPlaying(false);
          }
        } else {
          setFrameIndex(nextIndex);
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, frameIndex, loop]);

  const frame = FRAMES[frameIndex];

  const visibleRows = frame.content.slice(BOUNDS.rowStart, BOUNDS.rowEnd + 1);

  return (
    <Box flexDirection="column" marginLeft={2} marginTop={1} marginBottom={1}>
      {visibleRows.map((row, ry) => {
        const y = ry + BOUNDS.rowStart;
        const slice = row.slice(BOUNDS.colStart, BOUNDS.colEnd + 1);
        return (
          <Box key={y}>
            {slice.split("").map((char, sx) => {
              const x = sx + BOUNDS.colStart;
              const posKey = `${x},${y}`;
              const fgRole = frame.fgColors[posKey];
              if (fgRole === 'black') {
                return <Text key={x}> </Text>;
              }
              const fg = fgRole ? getColor(fgRole) : defaultFg;
              return (
                <Text key={x} color={fg}>
                  {char}
                </Text>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};

export default LinqCli;

