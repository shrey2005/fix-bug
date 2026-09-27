import redis from '../config/redis';
import { MetricsRepository } from '../repositories/metrics.repository';
import { MetricsSummary, TimeSeriesDataPoint, ServiceDistribution, DetailedMetrics } from '../dto/metrics.dto';

const metricsRepo = new MetricsRepository();

export class MetricsService {
  async getSummary(from?: string, to?: string): Promise<MetricsSummary> {
    const cacheKey = `metrics:summary:${from || 'all'}:${to || 'all'}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const summary = await metricsRepo.getSummary(from, to);
    // await redis.setEx(cacheKey, 3600, JSON.stringify(summary));

    return summary;
  }

  async getRequestsOverTime(
    interval: 'hour' | 'day' = 'hour',
    from?: string,
    to?: string,
  ): Promise<TimeSeriesDataPoint[]> {
    return await metricsRepo.getRequestsOverTime(interval, from, to);
  }

  async getErrorTrends(from?: string, to?: string): Promise<TimeSeriesDataPoint[]> {
    return await metricsRepo.getErrorTrends(from, to);
  }

  async getServiceDistribution(from?: string, to?: string): Promise<ServiceDistribution[]> {
    return await metricsRepo.getServiceDistribution(from, to);
  }

  async getDetailedMetrics(): Promise<DetailedMetrics> {
    return await metricsRepo.getDetailedMetrics();
  }
}
