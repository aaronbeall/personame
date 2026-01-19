import { getColorTheme } from '@/lib/colors'
import { cn } from '@/lib/utils'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { useMemo, useState } from 'react';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  // color?: string | null;
  center?: number;
}

const Slider = ({ color, className, onValueChange, center, value, ...props }: SliderProps) => {


  const handleValueChange = (newValues: number[]) => {
    if (center === undefined) {
      onValueChange?.(newValues);
      return;
    }

    // The fixed thumb must remain at the center value.
    // The user interacts with the other value.
    if (newValues[0] === center) {
      onValueChange?.([newValues[1]]);
    } else {
      onValueChange?.([newValues[0]]);
    }
  };

  const sliderValue = useMemo(() => {
    if (center === undefined) {
      return value;
    }
    // Insert the center value into the correct position
    if (Array.isArray(value)) {
      if (value[0] < center) {
        return [value[0], center];
      } else {
        return [center, value[0]];
      }
    }
    return value;
  }, [value, center]);

  // Determine which thumb is the fixed one (for hiding)
  const fixedThumbIndex = center !== undefined && sliderValue?.indexOf(center);

  return (
    <SliderPrimitive.Root
      className={cn('relative flex w-full touch-none select-none items-center', className)}
      value={sliderValue}
      onValueChange={handleValueChange}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted-300">
        <SliderPrimitive.Range className={cn('absolute h-full', getColorTheme(color).bgClass)} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          'block h-5 w-5 rounded-full border-2 border-white bg-white shadow-md ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          getColorTheme(color).bgClass,
          fixedThumbIndex === 0 ? 'opacity-0' : ''
        )}
      />
      {
        center !== undefined && (
          <SliderPrimitive.Thumb
            className={cn(
              'block h-5 w-5 rounded-full border-2 border-white bg-white shadow-md ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
              getColorTheme(color).bgClass,
              fixedThumbIndex === 1 ? 'opacity-0' : ''
            )}
          />
        )
      }
    </SliderPrimitive.Root>
  )
}

export { Slider }



// import * as SliderPrimitive from "@radix-ui/react-slider";
// import React, { useState } from "react";
// import "./Slider.css"; // Your custom CSS file

const CenterFillSlider = () => {
  const centerValue = 0;
  // Use a state for the user-controlled value
  const [value, setValue] = useState([centerValue, 50]); // Default user value is 50

  const handleValueChange = (newValues) => {
    // The fixed thumb must remain at the centerValue.
    // The user interacts with the other value.
    if (newValues[0] === centerValue) {
      setValue([centerValue, newValues[1]]);
    } else {
      setValue([newValues[0], centerValue]);
    }
  };

  // Determine which thumb is the fixed one (for hiding)
  const fixedThumbIndex = value.indexOf(centerValue);

  return (
    <form>
      <SliderPrimitive.Root
        className="SliderRoot"
        value={value}
        onValueChange={handleValueChange}
        min={-100}
        max={100}
        step={1}
      >
        <SliderPrimitive.Track className="SliderTrack">
          <SliderPrimitive.Range className="SliderRange" />
        </SliderPrimitive.Track>

        {/* Thumb 1 (fixed or movable) */}
        <SliderPrimitive.Thumb className={`SliderThumb ${fixedThumbIndex === 0 ? 'SliderThumbFixed' : ''}`} />

        {/* Thumb 2 (fixed or movable) */}
        <SliderPrimitive.Thumb className={`SliderThumb ${fixedThumbIndex === 1 ? 'SliderThumbFixed' : ''}`} />
      </SliderPrimitive.Root>
    </form>
  );
};

export default CenterFillSlider;
