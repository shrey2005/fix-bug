import { db } from '../config/database';
import { RateLimitViolation } from '../types';

export class RateLimitsRepository {
  async getSummary(from?: string, to?: string): Promise<any> {
    let query = db('rate_limit_violations');
    if (from && to) {
      query = query.whereBetween('created_at', [from, to]);
    }

    const totalViolations = await query.clone().count('*').first() as any;
    const violationCount = parseInt(totalViolations?.count || '0', 10);

    let requestsQuery = db('rate_limit_violations');
    if (from && to) {
      requestsQuery = requestsQuery.whereBetween('window_start', [from, to]);
    }
    const requestsResult = await requestsQuery.sum('request_count').first() as any;
    const totalRequests = parseFloat(requestsResult?.sum || '0');

    const windowSeconds = from && to
      ? (new Date(to).getTime() - new Date(from).getTime()) / 1000
      : 3600;
    const totalMinutes = Math.floor(windowSeconds / 60);
    const windowMinutes = windowSeconds / 60;
    const rpm = totalMinutes > 0 ? Math.round(totalRequests / windowMinutes) : 0;

    return {
      total_violations: violationCount,
      requests_per_minute: rpm,
      peak_rpm: 0,
    };
  }

  async getViolations(from?: string, to?: string): Promise<RateLimitViolation[]> {
    let query = db('rate_limit_violations');
    if (from && to) {
      query = query.whereBetween('created_at', [from, to]);
    }
    return await query.orderBy('created_at', 'desc');
  }

  async getTopOffenders(): Promise<any[]> {
    return await db('rate_limit_violations')
      .select('user_id', 'service_id')
      .count('* as violation_count')
      .sum('request_count')
      .groupBy('user_id', 'service_id')
      .orderBy('violation_count', 'desc')
      .limit(10);
  }
}
