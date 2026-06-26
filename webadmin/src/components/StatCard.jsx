import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import './StatCard.css';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = '#fbbf24',
}) {
  const isPositive = typeof trend === 'number' && trend >= 0;
  const trendColor = isPositive ? '#22c55e' : '#ef4444';
  const hasTrend = typeof trend === 'number';

  return (
    <div className="sc-card" style={{ '--sc-color': color }}>
      <div className="sc-accent-bar" />
      <div className="sc-content">
        <div className="sc-top">
          <div className="sc-info">
            <span className="sc-title">{title}</span>
            <span className="sc-value">{value}</span>
          </div>
          <div className="sc-icon-wrapper">
            {Icon && <Icon />}
          </div>
        </div>
        {hasTrend && (
          <div className="sc-trend" style={{ color: trendColor }}>
            {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
            <span className="sc-trend-value">
              {isPositive ? '+' : ''}{trend}%
            </span>
            {trendLabel && (
              <span className="sc-trend-label">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
