import { createElement, type CSSProperties } from "react";

import { Icons } from "@/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Tech } from "@/lib/tech-stack";
import { cn } from "@/lib/utils";

interface OrbitTechIconProps {
  tech: Tech;
  iconClassName: string;
  className?: string;
  style?: CSSProperties;
}

export function OrbitTechIcon({
  tech,
  iconClassName,
  className,
  style,
}: OrbitTechIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={tech.name}
          className={cn(
            "flex cursor-default items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary",
            className,
          )}
          style={style}
        >
          {createElement(Icons[tech.icon], { className: iconClassName })}
        </button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6} className="max-w-56">
        <p className="font-semibold">{tech.name}</p>
        <p className="opacity-70">{tech.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
