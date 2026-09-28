import { Router } from 'express';
import { roleGuard } from '../middleware/roleGuard';
import { MetricsController } from '../controllers/metrics.controller';

const router = Router();
const controller = new MetricsController();

router.get('/summary', (req, res, next) => controller.getSummary(req, res, next));
router.get('/requests-over-time', (req, res, next) => controller.getRequestsOverTime(req, res, next));
router.get('/error-trends', (req, res, next) => controller.getErrorTrends(req, res, next));
router.get('/service-distribution', (req, res, next) => controller.getServiceDistribution(req, res, next));
router.get('/admin/detailed', roleGuard('admin'), (req, res, next) => controller.getDetailedMetrics(req, res, next));

export default router;
