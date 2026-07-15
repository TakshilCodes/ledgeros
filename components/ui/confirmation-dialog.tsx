"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ConfirmationTone = "warning" | "danger";

type ConfirmationOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string | null;
  tone?: ConfirmationTone;
};

type ConfirmationContextValue = {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
};

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const settle = useCallback((confirmed: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setOptions(null);
    resolve?.(confirmed);
  }, []);

  const confirm = useCallback((nextOptions: ConfirmationOptions) => {
    resolverRef.current?.(false);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOptions(nextOptions);
    });
  }, []);

  useEffect(
    () => () => {
      resolverRef.current?.(false);
      resolverRef.current = null;
    },
    []
  );

  const tone = options?.tone ?? "warning";
  const Icon = tone === "danger" ? Trash2 : AlertTriangle;
  const showCancel = options?.cancelLabel !== null;

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}

      <Dialog
        open={Boolean(options)}
        onOpenChange={(open) => {
          if (!open) settle(false);
        }}
      >
        <DialogContent className="max-w-md border-border/70 bg-card p-0 text-foreground">
          {options ? (
            <>
              <div className="flex items-start gap-3 px-5 pb-4 pr-12 pt-5 sm:px-6 sm:pb-5 sm:pr-12 sm:pt-6">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    tone === "danger"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-amber-500/10 text-amber-300"
                  )}
                >
                  <Icon aria-hidden="true" className="size-[18px]" />
                </div>

                <div className="min-w-0">
                  <DialogTitle className="text-base font-semibold leading-6 text-foreground">
                    {options.title}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm leading-5 text-muted-foreground">
                    {options.description}
                  </DialogDescription>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-border/70 bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                {showCancel ? (
                  <button
                    type="button"
                    onClick={() => settle(false)}
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    {options.cancelLabel ?? "Cancel"}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => settle(true)}
                  className={cn(
                    "inline-flex h-10 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2",
                    tone === "danger"
                      ? "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500/35"
                      : "bg-amber-500 text-black hover:bg-amber-400 focus-visible:ring-amber-400/35"
                  )}
                >
                  {options.confirmLabel ?? "Continue"}
                </button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext);

  if (!context) {
    throw new Error("useConfirmation must be used within ConfirmationProvider");
  }

  return context;
}
