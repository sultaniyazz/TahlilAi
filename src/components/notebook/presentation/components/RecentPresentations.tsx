"use client";

import { fetchPresentations } from "@/app/_actions/notebook/presentation/fetchPresentations";
import { deletePresentation } from "@/app/_actions/notebook/presentation/presentationActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Presentation, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function RecentPresentations() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedPresentation, setSelectedPresentation] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["recentPresentations"],
    queryFn: () => fetchPresentations(0),
    staleTime: 1000 * 60 * 5,
  });

  const items = data?.items ?? [];

  const handleDelete = async () => {
    if (!selectedPresentation) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePresentation(selectedPresentation.id);
      toast.success("Taqdimot muvaffaqiyatli o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["recentPresentations"] });
      setSelectedPresentation(null);
    } catch (error) {
      console.error(error);
      toast.error("O'chirishda xatolik yuz berdi");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="px-4 py-16 sm:px-6">
      <Card className="border-border/60 bg-background/70 shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Presentation className="h-5 w-5 text-primary" />
            Tayyorlangan taqdimotlar
          </CardTitle>
          {!isLoading && items.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Oxirgi saqlangan {items.length} taqdimotdan eng ko'p ishlatilganlari.
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-6 text-sm text-muted-foreground">
              Hozircha saqlangan taqdimotlar mavjud emas.
            </div>
          ) : (
            <AlertDialog
              open={Boolean(selectedPresentation)}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedPresentation(null);
                }
              }}
            >
              <div className="space-y-3">
                {items.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-4 transition hover:shadow-lg"
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/presentation/${item.id}`)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-base font-semibold text-foreground">
                        {item.title || "Nomsiz taqdimot"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Yangilangan{' '}
                        {formatDistanceToNow(new Date(item.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </button>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition hover:border-destructive hover:text-destructive"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedPresentation({
                            id: item.id,
                            title: item.title || "Nomsiz taqdimot",
                          });
                        }}
                        aria-label={`O'chirish ${item.title || "Nomsiz taqdimot"}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </AlertDialogTrigger>
                  </div>
                ))}
              </div>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Taqdimotni o'chirish
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Siz <span className="font-semibold">{selectedPresentation?.title}</span> nomli taqdimotni o'chirishni xohlaysizmi? Bu amalni qayta tiklab bo'lmaydi.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {!isLoading && items.length > 8 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/presentation")}
              >
                Barchasini ko‘rish
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
