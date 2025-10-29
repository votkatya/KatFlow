import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import EnergyCalendar from '@/components/EnergyCalendar';
import EnergyStats from '@/components/EnergyStats';
import EnergyTrends from '@/components/EnergyTrends';
import AddEntryDialog from '@/components/AddEntryDialog';
import { useEnergyData } from '@/hooks/useEnergyData';

type TimePeriod = '3days' | 'week' | 'month' | 'year';

const DAY_MS = 24 * 60 * 60 * 1000;
const TIME_PERIOD_WINDOWS: Record<TimePeriod, number> = {
  '3days': 3 * DAY_MS,
  week: 7 * DAY_MS,
  month: 30 * DAY_MS,
  year: 365 * DAY_MS,
};

const nowWithinWindow = (timestamp: number, windowSize: number) => {
  const now = Date.now();
  return timestamp >= now - windowSize && timestamp <= now;
};

const parseDate = (dateStr: string): Date => {
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
};

const Index = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const { data, isLoading, error, refetch } = useEnergyData();

  const getColorClass = (score: number) => {
    if (score >= 5) return 'energy-excellent';
    if (score >= 4) return 'energy-good';
    if (score >= 3) return 'energy-neutral';
    if (score >= 2) return 'energy-medium-low';
    return 'energy-low';
  };

  const filteredEntries = useMemo(() => {
    if (!data?.entries) {
      return [];
    }

    const windowSize = TIME_PERIOD_WINDOWS[timePeriod];

    return data.entries.filter(entry => {
      const timestamp = parseDate(entry.date).getTime();
      if (Number.isNaN(timestamp)) {
        return false;
      }

      return nowWithinWindow(timestamp, windowSize);
    });
  }, [data?.entries, timePeriod]);

  const stats = useMemo(() => {
    if (filteredEntries.length === 0) {
      return { good: 0, neutral: 0, bad: 0, average: 0, total: 0 };
    }

    const totals = filteredEntries.reduce(
      (acc, entry) => {
        if (entry.score >= 4) acc.good += 1;
        else if (entry.score === 3) acc.neutral += 1;
        else acc.bad += 1;

        acc.scoreSum += entry.score;
        return acc;
      },
      { good: 0, neutral: 0, bad: 0, scoreSum: 0 }
    );

    const total = filteredEntries.length;
    const average = total > 0 ? totals.scoreSum / total : 0;

    return { good: totals.good, neutral: totals.neutral, bad: totals.bad, average, total };
  }, [filteredEntries]);

  // Отдельная статистика для месячной цели
  const monthlyStats = useMemo(() => {
    if (!data?.entries) {
      return { average: 0, total: 0 };
    }

    const windowSize = TIME_PERIOD_WINDOWS.month;
    const relevantEntries = data.entries.filter(entry => {
      const timestamp = parseDate(entry.date).getTime();
      return !Number.isNaN(timestamp) && nowWithinWindow(timestamp, windowSize);
    });

    const total = relevantEntries.length;
    const scoreSum = relevantEntries.reduce((sum, entry) => sum + entry.score, 0);
    const average = total > 0 ? scoreSum / total : 0;

    return { average, total };
  }, [data?.entries]);
  const recentEntries = data?.entries?.slice(-3).reverse() || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="mb-8 animate-fade-in">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                  <Icon name="Zap" size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">KatFlow</h1>
                  <p className="text-sm text-muted-foreground">Выгорание? Не сегодня</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => refetch()}
                  size="icon"
                  variant="outline"
                  className="sm:hidden"
                >
                  <Icon name="RefreshCw" size={20} />
                </Button>
                <Button 
                  onClick={() => refetch()}
                  size="lg"
                  variant="outline"
                  className="hidden sm:flex"
                >
                  <Icon name="RefreshCw" size={20} className="mr-2" />
                  Обновить
                </Button>
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  size="lg"
                  className="hidden sm:flex bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                >
                  <Icon name="Plus" size={20} className="mr-2" />
                  Добавить запись
                </Button>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddDialog(true)}
              size="lg"
              className="sm:hidden w-full bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              Как ты сегодня?
            </Button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-card shadow-md p-1 h-auto sm:h-14">
            <TabsTrigger 
              value="home" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 text-xs sm:text-sm"
            >
              <Icon name="Home" size={18} className="sm:mr-0" />
              <span className="hidden sm:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger 
              value="stats"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 text-xs sm:text-sm"
            >
              <Icon name="BarChart3" size={18} className="sm:mr-0" />
              <span className="hidden sm:inline">Статистика</span>
            </TabsTrigger>
            <TabsTrigger 
              value="trends"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 text-xs sm:text-sm"
            >
              <Icon name="Activity" size={18} className="sm:mr-0" />
              <span className="hidden sm:inline">Тренды</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="animate-fade-in">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={32} className="animate-spin text-primary" />
              </div>
            )}

            {error && (
              <Card className="shadow-lg border-l-4 border-l-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Icon name="AlertCircle" size={24} className="text-destructive" />
                    <div>
                      <p className="font-medium">Не удалось загрузить данные</p>
                      <p className="text-sm text-muted-foreground mt-1">Проверь, что Google таблица доступна по ссылке</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && (
              <>
                <div className="mb-6 flex flex-wrap gap-2 justify-center">
                  <Button
                    variant={timePeriod === '3days' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimePeriod('3days')}
                    className={timePeriod === '3days' ? 'bg-primary' : ''}
                  >3 дня</Button>
                  <Button
                    variant={timePeriod === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimePeriod('week')}
                    className={timePeriod === 'week' ? 'bg-primary' : ''}
                  >Неделя</Button>
                  <Button
                    variant={timePeriod === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimePeriod('month')}
                    className={timePeriod === 'month' ? 'bg-primary' : ''}
                  >Месяц</Button>
                  <Button
                    variant={timePeriod === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimePeriod('year')}
                    className={timePeriod === 'year' ? 'bg-primary' : ''}
                  >Год</Button>
                </div>
                
                {/* Goal Progress */}
                {monthlyStats.total > 0 && (
                  <Card className="shadow-[0_2px_8px_rgba(0,0,0,0.25)] mb-8 md:mb-10 border-l-4 border-l-primary bg-gradient-to-br from-card to-card/95">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon name="Target" size={20} className="text-primary" />
                            <span className="font-medium">Цель на месяц</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-heading font-bold text-primary">
                              {monthlyStats.average.toFixed(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">из 4.0</div>
                          </div>
                        </div>
                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full rounded-full transition-all bg-gradient-to-r from-energy-good via-energy-excellent to-energy-good"
                            style={{ width: `${Math.min((monthlyStats.average / 4) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          {monthlyStats.average >= 4 
                            ? '🎉 Цель достигнута!' 
                            : `Еще ${(4 - monthlyStats.average).toFixed(1)} до цели`
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                  <Card className="shadow-[0_2px_6px_rgba(0,0,0,0.2)] hover:shadow-xl transition-all border-l-4 border-l-energy-good bg-gradient-to-br from-card to-card/95 hover:border-l-energy-excellent">
                    <CardHeader className="pb-3 md:pb-3 pt-4 md:pt-6 px-3 md:px-6">
                      <CardTitle className="text-sm md:text-lg flex flex-col md:flex-row items-center gap-1 md:gap-2">
                        <span className="text-xl md:text-2xl">😊</span>
                        <span className="hidden md:inline">Хорошие дни</span>
                        <span className="md:hidden text-xs">Хорошие</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center md:text-left pb-4 md:pb-6 px-3 md:px-6">
                      <div className="text-3xl md:text-4xl font-heading font-bold text-energy-excellent">{stats.good}</div>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden md:block">Всего записей</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-[0_2px_6px_rgba(0,0,0,0.2)] hover:shadow-xl transition-all border-l-4 border-l-energy-neutral bg-gradient-to-br from-card to-card/95 hover:border-l-yellow-400">
                    <CardHeader className="pb-3 md:pb-3 pt-4 md:pt-6 px-3 md:px-6">
                      <CardTitle className="text-sm md:text-lg flex flex-col md:flex-row items-center gap-1 md:gap-2">
                        <span className="text-xl md:text-2xl">😐</span>
                        <span className="hidden md:inline">Нейтральные</span>
                        <span className="md:hidden text-xs">Средние</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center md:text-left pb-4 md:pb-6 px-3 md:px-6">
                      <div className="text-3xl md:text-4xl font-heading font-bold text-energy-neutral">{stats.neutral}</div>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden md:block">Всего записей</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-[0_2px_6px_rgba(0,0,0,0.2)] hover:shadow-xl transition-all border-l-4 border-l-energy-low bg-gradient-to-br from-card to-card/95 hover:border-l-red-400">
                    <CardHeader className="pb-3 md:pb-3 pt-4 md:pt-6 px-3 md:px-6">
                      <CardTitle className="text-sm md:text-lg flex flex-col md:flex-row items-center gap-1 md:gap-2">
                        <span className="text-xl md:text-2xl">😔</span>
                        <span className="hidden md:inline">Плохие дни</span>
                        <span className="md:hidden text-xs">Плохие</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center md:text-left pb-4 md:pb-6 px-3 md:px-6">
                      <div className="text-3xl md:text-4xl font-heading font-bold text-energy-low">{stats.bad}</div>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden md:block">Всего записей</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {!isLoading && !error && (
              <Card className="shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Calendar" size={20} />
                    Последние записи
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentEntries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Пока нет записей</p>
                  ) : (
                    <div className="space-y-3">
                      {recentEntries.map((entry, idx) => {
                        const colorClass = getColorClass(entry.score);
                        const isExpanded = expandedEntry === idx;
                        return (
                          <div 
                            key={idx}
                            onClick={() => setExpandedEntry(isExpanded ? null : idx)}
                            className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-${colorClass}/10 to-transparent border-l-4 border-l-${colorClass} hover:shadow-md transition-all cursor-pointer`}
                          >
                            <div className={`min-w-[3rem] w-12 h-12 rounded-xl bg-${colorClass} flex items-center justify-center text-white font-heading font-bold text-xl shadow-md`}>
                              {entry.score}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{entry.date}</p>
                              <p className={`text-sm text-muted-foreground ${isExpanded ? '' : 'line-clamp-1'}`}>{entry.thoughts}</p>
                            </div>
                            <Icon 
                              name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                              size={20} 
                              className="text-muted-foreground flex-shrink-0"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && (
              <EnergyCalendar data={data} isLoading={isLoading} />
            )}
          </TabsContent>

          <TabsContent value="stats" className="animate-fade-in">
            <EnergyStats data={data} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="trends" className="animate-fade-in">
            <EnergyTrends data={data} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>

      <AddEntryDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
};

export default Index;