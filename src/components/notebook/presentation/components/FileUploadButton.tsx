"use client";

import FileUpload from "@/components/ui/file-upload";
import { useFileAnalysis } from "@/hooks/presentation/useFileAnalysis";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

export function FileUploadButton() {
  const [files, setFiles] = useState<File[]>([]);
  const { analyzeFiles, isAnalyzing, analysisResult, clearAnalysis } =
    useFileAnalysis();

  return (
    <div className="rounded-lg border border-border/70 bg-background/80 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Hujjatni tahlil qilish</div>
          <p className="text-sm text-muted-foreground">
            PDF, DOCX yoki TXT faylni yuklang va tizim avtomatik ravishda taqdimot uchun tahliliy matn yaratadi.
          </p>
        </div>
        {isAnalyzing && (
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Tahlil qilinmoqda...
          </div>
        )}
      </div>

      <FileUpload
        files={files}
        setFiles={setFiles}
        onUpload={async (selectedFiles) => {
          const result = await analyzeFiles(selectedFiles);
          if (result) {
            setFiles([]);
          }
        }}
        isLoading={isAnalyzing}
        multiple={false}
        acceptedTypes={["pdf", "docx", "txt"]}
        info="Yuklangan fayl bir nechta sahifa bo‘lishi mumkin. Eng yaxshi natija uchun qisqa hujjatlarni tanlang."
        showUploadButton
      />

      {analysisResult?.summary ? (
        <div className="mt-4 rounded-lg border border-secondary/20 bg-secondary/5 p-3 text-sm text-muted-foreground">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">Hujjatdan olingan kontent qisqacha:</div>
              {analysisResult.fileName ? (
                <div className="text-xs text-muted-foreground">
                  Yuklangan fayl: {analysisResult.fileName}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                clearAnalysis();
                setFiles([]);
              }}
              className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-background px-2 py-1 text-xs transition-colors duration-200 hover:bg-muted/80"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Faylni olib tashlash
            </button>
          </div>
          <p>{analysisResult.summary}</p>
        </div>
      ) : null}
    </div>
  );
}
