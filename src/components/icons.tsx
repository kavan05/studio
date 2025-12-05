import type { SVGProps } from "react";

export function BizHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 12h7.5a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H12" />
      <path d="M12 12H4.5a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 4.5 3H12" />
      <path d="M12 12v9" />
      <path d="M10.5 21a1.5 1.5 0 0 0 3 0" />
      <path d="m5 6 2.5 2.5" />
      <path d="m14 6 2.5 2.5" />
      <path d="m9 12-1.5 3" />
      <path d="m15 12 1.5 3" />
    </svg>
  );
}
