import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  ENERGY_API_URL,
  ENERGY_CREATE_ENTRY_URL,
  IS_DEFAULT_ENERGY_API,
} from '@/hooks/useEnergyData';
import { useToast } from '@/components/ui/use-toast';

interface AddEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MutationError extends Error {
  status?: number;
}

const AddEntryDialog = ({ open, onOpenChange }: AddEntryDialogProps) => {
  const [score, setScore] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const trimmedNotes = useMemo(() => notes.trim(), [notes]);

  const {
    mutate: createEntry,
    isPending,
    reset,
  } = useMutation<unknown, MutationError, { score: number; thoughts: string }>(
    {
      mutationKey: ['create-energy-entry'],
      mutationFn: async ({ score, thoughts }) => {
        const payload = {
          score,
          thoughts,
          createdAt: new Date().toISOString(),
        };

        const response = await fetch(ENERGY_CREATE_ENTRY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const text = await response.text();
        let parsed: unknown = null;
        if (text) {
          try {
            parsed = JSON.parse(text);
          } catch (error) {
            // ignore JSON parse error, fall back to text
          }
        }

        if (!response.ok) {
          const baseMessage =
            typeof parsed === 'object' && parsed !== null && 'error' in parsed
              ? String((parsed as { error?: unknown }).error)
              : text || 'Не удалось сохранить запись';

          const message =
            response.status === 405
              ? 'Текущий эндпоинт принимает только чтение. Укажите переменную VITE_ENERGY_CREATE_ENTRY_URL с адресом, который поддерживает POST-запросы, или обновите облачную функцию.'
              : baseMessage;

          const error: MutationError = new Error(message);
          error.status = response.status;
          throw error;
        }

        return parsed;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['energy-data'] });
        toast({
          title: 'Запись сохранена',
          description: 'Мы обновили статистику и добавили новую запись.',
        });
        setScore(null);
        setNotes('');
        setFormError(null);
        onOpenChange(false);
      },
      onError: (error) => {
        const statusMessage =
          error.status === 405
            ? 'Этот API доступен только для чтения. Добавьте эндпоинт записи в VITE_ENERGY_CREATE_ENTRY_URL.'
            : error.message;
        const message =
          statusMessage && statusMessage.trim().length > 0
            ? statusMessage
            : 'Не удалось сохранить запись';
        setFormError(message);
        toast({
          title: 'Ошибка при сохранении',
          description: message,
          variant: 'destructive',
        });
      },
    },
  );

  useEffect(() => {
    if (!open) {
      setFormError(null);
      reset();
    }
  }, [open, reset]);

  const isSaveDisabled = isPending || score === null || trimmedNotes.length < 3;

  const isUsingReadOnlyDemoEndpoint =
    IS_DEFAULT_ENERGY_API && ENERGY_CREATE_ENTRY_URL === ENERGY_API_URL;

  const scores = [
    { value: 1, label: 'Очень плохо', color: 'bg-energy-low hover:bg-energy-low/80' },
    { value: 2, label: 'Плохо', color: 'bg-energy-medium-low hover:bg-energy-medium-low/80' },
    { value: 3, label: 'Нейтрально', color: 'bg-energy-neutral hover:bg-energy-neutral/80' },
    { value: 4, label: 'Хорошо', color: 'bg-energy-good hover:bg-energy-good/80' },
    { value: 5, label: 'Отлично', color: 'bg-energy-excellent hover:bg-energy-excellent/80' },
  ];

  const handleSave = () => {
    if (score === null) {
      setFormError('Поставьте оценку дню.');
      return;
    }

    if (trimmedNotes.length < 3) {
      setFormError('Добавьте короткую заметку — минимум 3 символа.');
      return;
    }

    setFormError(null);
    createEntry({ score, thoughts: trimmedNotes });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Plus" size={20} />
            Добавить запись
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <Label className="mb-3 block">Как прошёл твой день?</Label>
            <div className="grid grid-cols-5 gap-2">
              {scores.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setScore(item.value);
                    if (formError) {
                      setFormError(null);
                    }
                  }}
                  className={`aspect-square rounded-xl ${item.color} text-white font-heading font-bold text-2xl transition-all ${
                    score === item.value ? 'ring-4 ring-primary scale-110' : 'opacity-70'
                  }`}
                >
                  {item.value}
                </button>
              ))}
            </div>
            {score && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {scores.find(s => s.value === score)?.label}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes" className="mb-2 block">Заметки о дне</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (formError) {
                  setFormError(null);
                }
              }}
              placeholder="Что происходило сегодня? Какие были мысли и чувства?"
              className="min-h-32 resize-none"
            />
          </div>

          {formError && (
            <p className="text-sm text-destructive text-center">{formError}</p>
          )}

          {isUsingReadOnlyDemoEndpoint && !formError && (
            <p className="text-xs text-muted-foreground text-center">
              Сейчас используется демо-API только для чтения. Чтобы сохранять записи,
              укажите переменную <code>VITE_ENERGY_CREATE_ENTRY_URL</code> с адресом
              эндпоинта, который поддерживает POST-запросы.
            </p>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            size="lg"
          >
            {isPending ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Сохраняем...
              </>
            ) : (
              <>
                <Icon name="Save" size={20} className="mr-2" />
                Сохранить запись
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEntryDialog;
