import NextImage from 'next/image'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { getColorTheme } from '@/lib/colors'
import {
  Accessibility, Activity, AlarmClock, Anchor, Apple, Atom, Award,
  Baby, Backpack, Bell, Bike, Binary, Binoculars, Bird,
  Bolt, BookOpen, Brain, Briefcase, Bug, Bus, Cake,
  Calculator, Camera, Candy, Car, Castle, Cat, ChartLine,
  ChefHat, Cherry, CircleHelp, Clapperboard, Cloud, CloudRain, CloudSnow,
  Code, Coffee, Compass, Cookie, Cpu, Croissant, Crown,
  CupSoda, Diamond, Dice5, Dog, DoorOpen, Drama, Droplet,
  Dumbbell, Earth, Eye, Feather, Fish, Flag, Flame,
  FlaskConical, Flower2, Footprints, Frown, Gamepad2, Gem, Gift,
  GlassWater, Globe, GraduationCap, Guitar, Hammer, HandHeart, Handshake,
  Headphones, Heart, HeartPulse, Hourglass, House, IceCreamCone, Image,
  KeyRound, Lamp, Laptop, Laugh, Leaf, Lightbulb, Lock,
  Magnet, Map, MapPin, Medal, MessagesSquare, Mic, Microscope,
  Moon, Mountain, MountainSnow, Music, NotebookPen, Package, Paintbrush,
  Palette, PawPrint, PenTool, Pencil, PersonStanding, Piano, Pizza,
  Plane, Puzzle, Rainbow, Rocket, Sandwich, Scale, Scissors,
  Search, Shapes, Shell, Shield, Ship, ShoppingBag, Signpost,
  Smile, SmilePlus, Snowflake, Soup, Sparkles, Sprout, Star,
  Sun, Target, Telescope, Tent, TestTube, Ticket, Timer,
  TrainFront, TreeDeciduous, TreePine, Trophy, Umbrella, Users, Utensils,
  Wallet, WandSparkles, Watch, Waves, Wind, Wrench, Zap,
} from 'lucide-react'

const iconGroups = {
  'nature outdoors animals': {
    Bird, Bug, Cat, Cloud, CloudRain, CloudSnow, Dog,
    Droplet, Feather, Fish, Flame, Flower2, Leaf, Moon,
    Mountain, PawPrint, Rainbow, Shell, Snowflake, Sprout, Sun,
    TreeDeciduous, TreePine, Waves, Wind,
  },
  'travel places adventure': {
    Anchor, Backpack, Bike, Binoculars, Bus, Car, Castle,
    Compass, Earth, Flag, Globe, House, Map, MapPin,
    MountainSnow, Plane, Ship, Signpost, Tent, TrainFront,
  },
  'creative arts entertainment': {
    Camera, Clapperboard, Drama, Gamepad2, Guitar, Headphones, Image,
    Mic, Music, Paintbrush, Palette, PenTool, Pencil, Piano,
    Puzzle, Scissors, Shapes, Sparkles, Ticket, WandSparkles,
  },
  'science learning work': {
    Atom, Binary, BookOpen, Brain, Briefcase, Calculator, ChartLine,
    Code, Cpu, FlaskConical, GraduationCap, Hammer, Laptop, Lightbulb,
    Microscope, NotebookPen, Rocket, Telescope, TestTube, Wrench,
  },
  'people feelings wellness': {
    Accessibility, Activity, Baby, CircleHelp, Dumbbell, Eye, Footprints,
    Frown, HandHeart, Handshake, Heart, HeartPulse, Laugh, MessagesSquare,
    PersonStanding, Shield, Smile, SmilePlus, Users, Zap,
  },
  'food drink cooking': {
    Apple, Cake, Candy, ChefHat, Cherry, Coffee, Cookie,
    Croissant, CupSoda, GlassWater, IceCreamCone, Pizza, Sandwich, Soup,
    Utensils,
  },
  'objects goals achievement': {
    AlarmClock, Award, Bell, Bolt, Crown, Diamond, Dice5,
    DoorOpen, Gem, Gift, Hourglass, KeyRound, Lamp, Lock,
    Magnet, Medal, Package, Scale, Search, ShoppingBag, Star,
    Target, Timer, Trophy, Umbrella, Wallet, Watch,
  },
}

const icons: Record<string, LucideIcon> = Object.assign({}, ...Object.values(iconGroups))

const iconChoices = Object.entries(iconGroups)
  .flatMap(([keywords, group]) => Object.keys(group).map(id => ({
    value: `icon:${id}`,
    label: id.replace(/([a-z])([A-Z0-9])/g, '$1 $2'),
    keywords,
  })))
  .sort((a, b) => a.label.localeCompare(b.label, 'en'))

const personas = [
  ['explorer', 'Explorer', 'travel curious adventure'],
  ['scholar', 'Scholar', 'study knowledge book'],
  ['caregiver', 'Caregiver', 'kind garden nurture'],
  ['rebel', 'Rebel', 'bold independent'],
  ['dreamer', 'Dreamer', 'imagination creative'],
  ['inventor', 'Inventor', 'science maker curious'],
] as const

export const symbolChoices = {
  Icons: iconChoices,
  Personas: personas.map(([id, label, keywords]) => ({
    value: `persona:${id}`, label, keywords,
  })),
}

/** Chart labels render plain text rather than a symbol component. */
export function textSymbol(value?: string | null) {
  return value && !value.startsWith('icon:') && !value.startsWith('persona:') ? value : ''
}

export function QuizSymbol({ value, fallback, color }: {
  value?: string | null
  fallback?: ReactNode
  color?: string | null
}) {
  if (value?.startsWith('icon:')) {
    const id = value.slice(5)
    const Icon = Object.hasOwn(icons, id) ? icons[id] : undefined
    return Icon ? <Icon
      className="quiz-symbol-icon"
      style={color ? { color: getColorTheme(color).hex } : undefined}
      aria-hidden="true"
    /> : fallback
  }
  if (value?.startsWith('persona:')) {
    const persona = personas.find(([id]) => id === value.slice(8))
    return persona ? (
      <NextImage
        className="quiz-symbol-icon"
        src={`/images/personas/${persona[0]}.webp`}
        width={128}
        height={128}
        alt=""
      />
    ) : fallback
  }
  return value || fallback
}
