/**
 * Desktop "API" nav dropdown — OpenAPI docs (new tab) + in-app API Status.
 */

import { Link, useLocation } from "react-router-dom";
import { BookOpen, ChevronDown, LineChart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ApiNavDropdown({ className }: { className?: string }) {
  const location = useLocation();
  const docsUrl = `${API_BASE_URL}/docs`;
  const onApiStatus = location.pathname === "/api-status";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg px-1 py-0.5",
            onApiStatus && "text-sky-300",
            className,
          )}
        >
          API Details
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-full max-h-none overflow-visible"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            window.open(docsUrl, "_blank", "noopener,noreferrer");
          }}
        >
          <BookOpen className="h-4 w-4 text-sky-300" />
          <span className="flex-1">API Docs</span>
          <ExternalLink className="h-3.5 w-3.5 text-white/40" />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer gap-2">
          <Link to="/api-status" className="flex w-full items-center gap-2">
            <LineChart className="h-4 w-4 text-emerald-300" />
            API Status
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
