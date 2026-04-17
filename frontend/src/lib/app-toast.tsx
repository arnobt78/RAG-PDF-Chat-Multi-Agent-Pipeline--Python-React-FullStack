import * as React from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  FileUp,
  MessageSquare,
  Trash2,
  Download,
  RotateCcw,
  History,
  Ban,
} from "lucide-react";

function wrapIcon(node: React.ReactNode) {
  return (
    <span className="flex shrink-0 [&_svg]:size-4 [&_svg]:text-current">
      {node}
    </span>
  );
}

export const appToast = {
  pdfUploading: (subtitle?: string) =>
    toast.loading("Uploading PDF", {
      id: "pdf-upload",
      description: subtitle ?? "Sending your file to the server…",
      icon: wrapIcon(<FileUp className="text-sky-400" />),
    }),

  pdfReady: (fileName: string, chunks?: number) =>
    toast.success("PDF ready", {
      id: "pdf-upload",
      description:
        chunks != null
          ? `${fileName} · ${chunks} chunks indexed`
          : `${fileName} is ready to chat about.`,
      icon: wrapIcon(<CheckCircle2 className="text-emerald-400" />),
    }),

  pdfError: (detail: string) =>
    toast.error("Upload failed", {
      id: "pdf-upload",
      description: detail,
      icon: wrapIcon(<XCircle className="text-rose-400" />),
    }),

  replyReady: (questionPreview: string, model?: string) =>
    toast.success("Reply ready", {
      description: model
        ? `${questionPreview} · ${model}`
        : questionPreview,
      icon: wrapIcon(<MessageSquare className="text-purple-400" />),
    }),

  chatError: (detail: string) =>
    toast.error("Chat request failed", {
      description: detail,
      icon: wrapIcon(<XCircle className="text-rose-400" />),
    }),

  generationStopped: () =>
    toast.message("Generation stopped", {
      description: "The model stopped before finishing a reply.",
      icon: wrapIcon(<Ban className="text-amber-400" />),
    }),

  sessionRestored: (pdfName: string, count: number) =>
    toast.success("Session restored", {
      description: `${pdfName} · ${count} saved message${count === 1 ? "" : "s"}`,
      icon: wrapIcon(<History className="text-purple-400" />),
    }),

  sessionDeleted: (pdfName: string) =>
    toast.success("Session removed", {
      description: `Deleted saved chat for "${pdfName}".`,
      icon: wrapIcon(<Trash2 className="text-slate-400" />),
    }),

  allSessionsCleared: (count: number) =>
    toast.success("All sessions cleared", {
      description: `Removed ${count} saved session${count === 1 ? "" : "s"} from this browser.`,
      icon: wrapIcon(<Trash2 className="text-slate-400" />),
    }),

  chatExported: () =>
    toast.success("Chat exported", {
      description: "Your transcript was downloaded as a text file.",
      icon: wrapIcon(<Download className="text-sky-400" />),
    }),

  chatCleared: () =>
    toast.message("Chat cleared", {
      description: "Messages were removed from this view (PDF stays loaded).",
      icon: wrapIcon(<Trash2 className="text-slate-400" />),
    }),

  uploadReset: () =>
    toast.message("Upload reset", {
      description: "Pick another PDF to start a fresh session.",
      icon: wrapIcon(<RotateCcw className="text-amber-400" />),
    }),
};
