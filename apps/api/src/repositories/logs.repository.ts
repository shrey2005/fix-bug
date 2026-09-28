import { db } from '../config/database';
import { ApiLog } from '../types';
import { LogsQueryParams } from '../dto/logs.dto';
import { PaginationMeta } from '../dto/pagination.dto';

export class LogsRepository {
  async findAll(params: LogsQueryParams & { page: number; limit: number }) {
    const { page, limit, service, statusCode, from, to, search } = params;

    let query = db('api_logs').leftJoin('services', 'services.id', 'api_logs.service_id').select('api_logs.*', 'services.name as service_name');

    if (service) {
      const serviceRecord = await db('services').where('slug', service).first();
      if (serviceRecord) {
        query = query.where('api_logs.service_id', serviceRecord.id);
      }
    }

    if (statusCode) {
      const codeStr = String(statusCode);
      if (codeStr == "2") {
        query = query.whereBetween('api_logs.status_code', [200, 299]);
      }
      else if (codeStr == "4") {
        query = query.whereBetween('api_logs.status_code', [400, 499]);
      }
      else if (codeStr == "5") {
        query = query.whereBetween('api_logs.status_code', [500, 599]);
      }
      else {
        query = query.where('api_logs.status_code', parseInt(codeStr, 10));
      }
    }

    if (from && to) {
      let fromDate = from;
      let toDate = to;

      if (/^\d{4}-\d{2}-\d{2}$/.test(from)) {
        fromDate = `${from} 00:00:00`;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
        toDate = `${to} 23:59:59.999`;
      } else if (from === to || to.endsWith('T00:00:00.000Z')) {
        const d = new Date(to);
        d.setUTCHours(23, 59, 59, 999);
        toDate = d.toISOString();
      }
      query = query.whereBetween('api_logs.created_at', [fromDate, toDate]);
    }

    if (search) {
      query = query.where('api_logs.endpoint', 'like', `%${search}%`);
    }

    const total = await query.clone().clearSelect().count('api_logs.id as count').first() as any;
    const totalCount = parseInt(total?.count || '0', 10);
    const offset = Math.max(0, (page - 1) * limit);

    const logs = await query
      .orderBy('api_logs.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // for (const log of logs) {
    //   const service = await db('services').where('id', log.service_id).first();
    //   (log as any).service_name = service?.name;
    // }

    return {
      logs: logs as ApiLog[],
      meta: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      } as PaginationMeta,
    };
  }

  async findById(id: string): Promise<ApiLog | null> {
    return await db('api_logs').where('id', id).first();
  }
}
