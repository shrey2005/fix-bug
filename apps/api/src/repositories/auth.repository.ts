import { db } from '../config/database';
import { AuthEvent } from '../types';
import { PaginationMeta } from '../dto/pagination.dto';

export class AuthRepository {
  async getStats(from?: string, to?: string): Promise<any> {
    let successQuery = db('auth_events').where('event_type', 'login_success');
    if (from && to) {
      successQuery = successQuery.whereBetween('created_at', [from, to]);
    }
    const successResult = await successQuery.count('*').first() as any;

    let failureQuery = db('auth_events').where('event_type', ['login_failure', 'failed_login']);
    if (from && to) {
      failureQuery = failureQuery.whereBetween('created_at', [from, to]);
    }
    const failureResult = await failureQuery.count('*').first() as any;

    let invalidQuery = db('auth_events').where('event_type', 'token_invalid');
    if (from && to) {
      invalidQuery = invalidQuery.whereBetween('created_at', [from, to]);
    }
    const invalidResult = await invalidQuery.count('*').first() as any;

    let expiredQuery = db('auth_events').where('event_type', 'token_expired');
    if (from && to) {
      expiredQuery = expiredQuery.whereBetween('created_at', [from, to]);
    }
    const expiredResult = await expiredQuery.count('*').first() as any;

    return {
      successful_logins: parseInt(successResult?.count || '0', 10),
      failed_logins: parseInt(failureResult?.count || '0', 10),
      token_invalid: parseInt(invalidResult?.count || '0', 10),
      token_expired: parseInt(expiredResult?.count || '0', 10),
    };
  }

  async getEvents(page: number, limit: number): Promise<{
    events: AuthEvent[];
    meta: PaginationMeta;
  }> {
    const offset = (page - 1) * limit;
    const total = await db('auth_events').count('*').first() as any;

    const events = await db('auth_events')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      events: events as AuthEvent[],
      meta: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit),
      },
    };
  }
}
