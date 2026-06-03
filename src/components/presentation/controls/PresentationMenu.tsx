"use client";

import {
  createBlankPresentation,
  duplicatePresentation,
} from "@/app/_actions/notebook/presentation/presentationActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePresentationHistoryState } from "@/states/presentation-history-state";
import { usePresentationState } from "@/states/presentation-state";
import { useMutation } from "@tanstack/react-query";
import {
  Bot,
  Copy,
  FileEdit,
  FolderOpen,
  Palette,
  Plus,
  Redo,
  Settings,
  Undo,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

export function PresentationMenu({
  readOnly = false,
}: {
  readOnly?: boolean;
}) {
  const currentPresentationId = usePresentationState(
    (state) => state.currentPresentationId,
  );
  const setCurrentPresentation = usePresentationState(
    (state) => state.setCurrentPresentation,
  );
  const setActiveRightPanel = usePresentationState(
    (state) => state.setActiveRightPanel,
  );
  const undo = usePresentationHistoryState((state) => state.undo);
  const redo = usePresentationHistoryState((state) => state.redo);
  const canUndo = usePresentationHistoryState((state) => state.canUndo);
  const canRedo = usePresentationHistoryState((state) => state.canRedo);
  const router = useRouter();

  const { mutateAsync: duplicatePresentationMutation, isPending: isDuplicating } =
    useMutation({
      mutationFn: async () => {
        if (!currentPresentationId) {
            toast.error("Joriy taqdimot mavjud emas");
          throw new Error("CURRENT_PRESENTATION_ID_MISSING");
        }

        return duplicatePresentation(currentPresentationId);
      },
      onSuccess: (data) => {
        if (data.success && data.presentation) {
          setCurrentPresentation(data.presentation.id, data.presentation.title);
          router.push(`/presentation/${data.presentation.id}`);
          return;
        }

        toast.error(data.message);
      },
      onError: () => {
        toast.error("Taqdimotni nusxalash muvaffaqiyatsiz tugadi");
      },
    });

  const {
    mutateAsync: createBlankPresentationMutation,
    isPending: isCreatingBlank,
  } = useMutation({
    mutationFn: async () => {
      const theme = usePresentationState.getState().theme;
      const language = usePresentationState.getState().language;

      return createBlankPresentation(
        "Untitled Presentation",
        theme ??
          (localStorage.getItem("theme") === "dark" ? "ebony" : "mystique"),
        language,
      );
    },
    onSuccess: (data) => {
      if (data.success && data.presentation) {
        setCurrentPresentation(data.presentation.id, data.presentation.title);
        router.push(`/presentation/${data.presentation.id}`);
        return;
      }

      toast.error(data.message);
    },
    onError: () => {
        toast.error("Taqdimot yaratib bo‘lmadi");
    },
  });

  const focusTitleInput = useCallback(() => {
    window.setTimeout(() => {
      const presentationTitleInput = document.getElementById(
        "presentation-title-input",
      );
      presentationTitleInput?.focus();
    }, 250);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open presentation menu">
          <FolderOpen className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuItem
          disabled={isCreatingBlank}
          onClick={() => void createBlankPresentationMutation()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Yangi taqdimot
        </DropdownMenuItem>
        {!readOnly ? (
          <DropdownMenuItem onClick={focusTitleInput}>
            <FileEdit className="mr-2 h-4 w-4" />
            Nomini o‘zgartirish
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          disabled={isDuplicating}
          onClick={() => void duplicatePresentationMutation()}
        >
          <Copy className="mr-2 h-4 w-4" />
          {readOnly ? "Hisobimga klonlash" : "Nusxalash"}
        </DropdownMenuItem>

        {!readOnly ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!canUndo} onClick={undo}>
              <Undo className="mr-2 h-4 w-4" />
              Bekor qilish
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!canRedo} onClick={redo}>
              <Redo className="mr-2 h-4 w-4" />
              Qayta bajarish
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setActiveRightPanel("globalSettings")}>
              <Settings className="mr-2 h-4 w-4" />
              Sahifa sozlamalari
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveRightPanel("theme")}>
              <Palette className="mr-2 h-4 w-4" />
              Mavzu paneli
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveRightPanel("agent")}>
              <Bot className="mr-2 h-4 w-4" />
              Agent paneli
            </DropdownMenuItem>
          </>
        ) : null}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/presentation")}>
          <FolderOpen className="mr-2 h-4 w-4" />
          Barcha taqdimotlar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
