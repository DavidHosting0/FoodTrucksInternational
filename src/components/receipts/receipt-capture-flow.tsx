"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/types/database";
import {
  confirmReceiptSplitAction,
  scanReceiptAction,
  type ConfirmReceiptState,
  type ScanReceiptState,
} from "@/app/actions/receipt-scan";
import { compressImageForUpload } from "@/lib/images/compress-image";
import type { SplitData } from "@/lib/validations/split";
import { ReceiptReview } from "@/components/receipts/receipt-review";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const RECEIPT_CAMERA_INPUT_ID = "receipt-camera-input";
export const OPEN_RECEIPT_CAMERA_EVENT = "fig:open-receipt-camera";

type Phase = "capture" | "scanning" | "review";

export function openReceiptCamera() {
  const input = document.getElementById(
    RECEIPT_CAMERA_INPUT_ID
  ) as HTMLInputElement | null;
  if (!input) {
    window.dispatchEvent(new Event(OPEN_RECEIPT_CAMERA_EVENT));
    return;
  }
  input.value = "";
  input.click();
}

export function ReceiptCaptureFlow({
  categories,
  autoOpenCamera = true,
  onDone,
}: {
  categories: Category[];
  autoOpenCamera?: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("capture");
  const [preview, setPreview] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [draft, setDraft] = useState<SplitData | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingScan, startScan] = useTransition();
  const [pendingConfirm, startConfirm] = useTransition();

  const triggerCamera = () => {
    const input = fileRef.current;
    if (!input) return;
    input.value = "";
    input.click();
  };

  useEffect(() => {
    const onOpen = () => {
      const input = fileRef.current;
      if (!input) return;
      input.value = "";
      input.click();
    };
    window.addEventListener(OPEN_RECEIPT_CAMERA_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_RECEIPT_CAMERA_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!autoOpenCamera) return;
    const t = window.setTimeout(() => {
      const input = fileRef.current;
      if (!input) return;
      input.value = "";
      input.click();
    }, 50);
    return () => window.clearTimeout(t);
  }, [autoOpenCamera]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const reset = () => {
    setPhase("capture");
    setDraft(null);
    setScanId(null);
    setPreviewUrl(null);
    setScanError(null);
    setConfirmError(null);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const runScan = (file: File) => {
    setScanError(null);
    setPhase("scanning");

    startScan(async () => {
      try {
        const uploadFile = await compressImageForUpload(file);
        const fd = new FormData();
        fd.set("file", uploadFile);
        const result: ScanReceiptState = await scanReceiptAction({}, fd);
        if (result.error || !result.draft || !result.scanId) {
          setScanError(result.error ?? "Scan fehlgeschlagen");
          setPhase("capture");
          return;
        }
        setDraft(result.draft);
        setScanId(result.scanId);
        setPreviewUrl(result.previewUrl ?? null);
        setPhase("review");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Scan fehlgeschlagen";
        setScanError(
          message.includes("Body exceeded") || message.includes("413")
            ? "Foto zu groß — bitte näher ran oder erneut versuchen."
            : message
        );
        setPhase("capture");
      }
    });
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    runScan(file);
  };

  const onConfirm = (payload: {
    split: SplitData;
    categoryId: string;
    acceptMismatch: boolean;
  }) => {
    if (!scanId) return;
    setConfirmError(null);
    const fd = new FormData();
    fd.set("scanId", scanId);
    fd.set("category_id", payload.categoryId);
    fd.set("split_json", JSON.stringify(payload.split));
    if (payload.acceptMismatch) fd.set("accept_total_mismatch", "on");

    startConfirm(async () => {
      const result: ConfirmReceiptState = await confirmReceiptSplitAction(
        {},
        fd
      );
      if (result.error) {
        setConfirmError(result.error);
        return;
      }
      toast.success(result.success ?? "Gespeichert");
      onDone?.();
      router.push("/dashboard?tab=list");
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <input
        id={RECEIPT_CAMERA_INPUT_ID}
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onFileChange}
      />

      {phase === "capture" ? (
        <div className="space-y-4">
          {scanError ? (
            <Alert variant="destructive">
              <AlertDescription>{scanError}</AlertDescription>
            </Alert>
          ) : (
            <div className="metal-plate flex flex-col items-center justify-center gap-3 rounded-[1.75rem] px-4 py-16 text-white">
              <Loader2 className="size-8 animate-spin opacity-80" />
              <p className="text-lg font-semibold">Kamera öffnen…</p>
            </div>
          )}
          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={triggerCamera}
          >
            Foto aufnehmen
          </Button>
        </div>
      ) : null}

      {phase === "scanning" || pendingScan ? (
        <div className="metal-plate flex flex-col items-center justify-center gap-3 rounded-[1.75rem] px-4 py-20 text-white">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-lg font-semibold">Beleg wird gelesen…</p>
          <p className="text-sm text-white/70">OCR + KI-Analyse</p>
        </div>
      ) : null}

      {phase === "review" && draft && scanId ? (
        <div className="space-y-4">
          <ReceiptReview
            initial={draft}
            categories={categories}
            previewUrl={previewUrl ?? preview ?? undefined}
            scanId={scanId}
            error={confirmError ?? undefined}
            pending={pendingConfirm}
            onSubmit={onConfirm}
          />
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              reset();
              triggerCamera();
            }}
          >
            Anderes Foto
          </Button>
        </div>
      ) : null}
    </div>
  );
}
