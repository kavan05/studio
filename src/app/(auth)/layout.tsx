import Link from "next/link";
import { BizHubIcon } from "@/components/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-secondary/50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
                <BizHubIcon className="h-8 w-8" />
                <span className="text-xl font-bold tracking-tight">BizHub API</span>
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
