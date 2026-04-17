import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      richColors
      closeButton
      expand={false}
      toastOptions={{
        classNames: {
          toast:
            "group border border-white/10 bg-slate-900/95 text-white shadow-xl backdrop-blur-md",
          title: "text-sm font-semibold text-white",
          description: "text-xs text-slate-300",
        },
      }}
    />
  );
}
