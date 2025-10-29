import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const EnergyCharts = () => {
  const weekData = [
    { day: 'Пн', score: 4, color: 'bg-energy-good' },
    { day: 'Вт', score: 5, color: 'bg-energy-excellent' },
    { day: 'Ср', score: 4, color: 'bg-energy-good' },
    { day: 'Чт', score: 2, color: 'bg-energy-low' },
    { day: 'Пт', score: 4, color: 'bg-energy-good' },
    { day: 'Сб', score: 5, color: 'bg-energy-excellent' },
    { day: 'Вс', score: 5, color: 'bg-energy-excellent' },
  ];

  const maxScore = 5;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart" size={24} />
            График энергии за неделю
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-end justify-around gap-4">
            {weekData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3">
                <div className="relative w-full" style={{ height: '100%' }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-t-xl ${item.color} shadow-lg transition-all hover:opacity-80 flex items-end justify-center pb-2`}
                    style={{ height: `${(item.score / maxScore) * 100}%` }}
                  >
                    <span className="text-white font-heading font-bold text-lg">{item.score}</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">{item.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" size={24} />
            Динамика среднего балла
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              { period: 'Неделя 06.10', avg: 4.4, trend: 'up' },
              { period: 'Неделя 13.10', avg: 4.1, trend: 'down' },
              { period: 'Неделя 20.10', avg: 3.7, trend: 'down' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">{item.period}</div>
                <div className="flex-1 h-12 bg-secondary rounded-xl overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent flex items-center justify-end pr-4 transition-all"
                    style={{ width: `${(item.avg / 5) * 100}%` }}
                  >
                    <span className="text-white font-bold">{item.avg}</span>
                  </div>
                </div>
                <Icon 
                  name={item.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
                  size={20} 
                  className={item.trend === 'up' ? 'text-energy-excellent' : 'text-energy-low'}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyCharts;
