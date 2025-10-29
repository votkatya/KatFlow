import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const EnergyStats = () => {
  const weeklyStats = [
    { week: '20.10.2025', bad: 1, neutral: 0, good: 2, avg: 3.7 },
    { week: '13.10.2025', bad: 0, neutral: 2, good: 5, avg: 4.1 },
    { week: '06.10.2025', bad: 0, neutral: 2, good: 5, avg: 4.4 },
  ];

  const monthlyStats = [
    { month: '01.10.2025', bad: 1, neutral: 4, good: 12, avg: 4.2 },
    { month: '01.09.2025', bad: 0, neutral: 4, good: 8, avg: 3.8 },
    { month: '01.08.2025', bad: 2, neutral: 4, good: 12, avg: 3.8 },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="CalendarDays" size={24} />
            Статистика по неделям
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyStats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-secondary/50 to-transparent border-l-4 border-l-primary">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Неделя {stat.week}</span>
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary font-bold">
                    ø {stat.avg}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-heading font-bold text-energy-excellent">{stat.good}</div>
                      <div className="text-xs text-muted-foreground">Хорошие</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-heading font-bold text-energy-neutral">{stat.neutral}</div>
                      <div className="text-xs text-muted-foreground">Нейтральные</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-heading font-bold text-energy-low">{stat.bad}</div>
                      <div className="text-xs text-muted-foreground">Плохие</div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="CalendarRange" size={24} />
            Статистика по месяцам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyStats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-transparent border-l-4 border-l-accent">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Месяц {stat.month}</span>
                  <span className="px-3 py-1 rounded-full bg-accent/20 text-accent font-bold">
                    ø {stat.avg}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-heading font-bold text-energy-excellent">{stat.good}</div>
                      <div className="text-xs text-muted-foreground">Хорошие</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-heading font-bold text-energy-neutral">{stat.neutral}</div>
                      <div className="text-xs text-muted-foreground">Нейтральные</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-heading font-bold text-energy-low">{stat.bad}</div>
                      <div className="text-xs text-muted-foreground">Плохие</div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyStats;