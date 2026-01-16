import { getColorTheme } from '@/lib/colors'
import { cn } from '@/lib/utils'
import * as SliderPrimitive from '@radix-ui/react-slider'

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  // color?: string | null;
}

const Slider = ({ color, className, ...props }: SliderProps) => (
  <SliderPrimitive.Root
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted-300">
      <SliderPrimitive.Range className={cn('absolute h-full', getColorTheme(color).bgClass)} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        'block h-5 w-5 rounded-full border-2 border-white bg-white shadow-md ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        getColorTheme(color).bgClass
      )}
    />
  </SliderPrimitive.Root>
)

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
