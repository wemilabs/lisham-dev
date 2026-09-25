import { OrbitTechIcon } from "@/components/ui/orbit-tech-icon";
import type { Tech } from "@/lib/tech-stack";
import { cn } from "@/lib/utils";

interface OrbitRotationProps {
  icons: Tech[];
  orbitCount?: number;
  orbitGap?: number;
  centerIcon: Tech;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "size-16",
  md: "size-24",
  lg: "size-32",
};

const iconSizeClasses = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
};

export function OrbitRotation({
  icons,
  orbitCount = 3,
  orbitGap = 6,
  centerIcon,
  className,
  size = "md",
  ...props
}: OrbitRotationProps) {
  const iconsPerOrbit = Math.ceil(icons.length / orbitCount);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-full overflow-visible",
        className,
      )}
      style={{ minHeight: "32rem" }}
      {...props}
    >
      <div className="group/orbit relative flex items-center justify-center">
        <OrbitTechIcon
          tech={centerIcon}
          iconClassName={iconSizeClasses[size]}
          className={cn(
            "bg-background/90 border-border border shadow-xl backdrop-blur-sm",
            sizeClasses[size],
          )}
        />

        {[...Array(orbitCount)].map((_, orbitIdx) => {
          const orbitSize = `${8 + orbitGap * (orbitIdx + 1)}rem`;
          const angleStep = (2 * Math.PI) / iconsPerOrbit;
          const animationDuration = `${24 + orbitIdx * 12}s`;

          return (
            <div
              key={orbitSize}
              className="pointer-events-none absolute rounded-full border-2 border-dotted border-border group-focus-within/orbit:[animation-play-state:paused] group-hover/orbit:[animation-play-state:paused]"
              style={{
                width: orbitSize,
                height: orbitSize,
                animationName: "orbit-spin",
                animationDuration,
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
              }}
            >
              {icons
                .slice(
                  orbitIdx * iconsPerOrbit,
                  orbitIdx * iconsPerOrbit + iconsPerOrbit,
                )
                .map((tech, iconIdx) => {
                  const angle = iconIdx * angleStep;
                  const radius = 50;
                  const x = (radius + radius * Math.cos(angle)).toFixed(5);
                  const y = (radius + radius * Math.sin(angle)).toFixed(5);

                  return (
                    <OrbitTechIcon
                      key={tech.icon}
                      tech={tech}
                      iconClassName={iconSizeClasses[size]}
                      className="pointer-events-auto absolute bg-background/80 p-2 shadow-lg backdrop-blur-sm"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: "translate(-50%, -50%) rotate(0deg)",
                      }}
                    />
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
