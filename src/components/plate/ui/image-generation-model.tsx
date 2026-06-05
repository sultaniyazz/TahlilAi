import {
  generateImageAction,
  type ImageModelList,
} from "@/app/_actions/apps/image-studio/generate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotesState } from "@/states/notes-state";
import { ImagePlugin } from "@platejs/media/react";
import { useEditorRef } from "platejs/react";
import { useState } from "react";
import { toast } from "sonner";

const MODEL_OPTIONS = [
  {
    label: "Flux 2 Flash",
    value: "fal-ai/flux-2/flash",
  },
  {
    label: "Flux Dev",
    value: "fal-ai/flux/dev",
  },
  {
    label: "Flux 2 Pro",
    value: "fal-ai/flux-2-pro",
  },
];

export function GenerateImageDialogContent({
  setOpen,
  isGenerating,
  setIsGenerating,
}: {
  setOpen: (value: boolean) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}) {
  const editor = useEditorRef();
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<ImageModelList>(
    "fal-ai/flux-2/flash",
  );

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Iltimos, so'rov kiriting");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateImageAction(prompt, selectedModel);
      const image = "image" in result ? result.image : undefined;

      if (!result.success) {
        throw new Error(result.error ?? "Rasm yaratib bo'lmadi");
      }

      if (!image?.url) {
        throw new Error("Rasmni yaratib bo'lmadi");
      }

      editor.tf.insertNodes({
        children: [{ text: "" }],
        type: ImagePlugin.key,
        url: image.url,
        query: prompt,
      });

      setOpen(false);
      toast.success("Rasm muvaffaqiyatli yaratildi!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Rasmni yaratib bo'lmadi",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>AI yordamida rasm yaratish</AlertDialogTitle>
        <AlertDialogDescription>
          Yaratmoqchi bo'lgan rasm tavsifini kiriting
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-4">
        <div className="relative w-full">
          <Label htmlFor="prompt">So'rov</Label>
          <Input
            id="prompt"
            className="w-full"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isGenerating) void generateImage();
            }}
            type="text"
            autoFocus
            disabled={isGenerating}
          />
        </div>

        {isGenerating && (
          <div className="mt-4 space-y-3">
            <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="text-center text-sm text-gray-500">
              Sizning rasmingiz yaratilmoqda...
            </div>
          </div>
        )}
      </div>

      <AlertDialogFooter>
        <Select
          value={selectedModel}
          onValueChange={(value) => setSelectedModel(value as ImageModelList)}
          disabled={isGenerating}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Modelni tanlang" />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <AlertDialogCancel disabled={isGenerating}>Bekor qilish</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void generateImage();
            }}
            disabled={isGenerating}
          >
            {isGenerating ? "Yaratilmoqda..." : "Yaratish"}
          </AlertDialogAction>
        </div>
      </AlertDialogFooter>
    </>
  );
}

export default function ImageGenerationModel() {
  const { isImageGenerationModelOpen, setIsImageGenerationModelOpen } =
    useNotesState();
  const [isGenerating, setIsGenerating] = useState(false);
  return (
    <AlertDialog
      open={isImageGenerationModelOpen}
      onOpenChange={(value) => {
        setIsImageGenerationModelOpen(value);
        setIsGenerating(false);
      }}
    >
      <AlertDialogContent className="gap-6">
        <GenerateImageDialogContent
          setOpen={setIsImageGenerationModelOpen}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
