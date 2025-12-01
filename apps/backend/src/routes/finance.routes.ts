import { Router } from 'express';
import {
    createExpense,
    getExpenses,
    getExpenseStats,
    createPayroll,
    getPayrolls,
    markPayrollPaid
} from '../controllers/finance.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Expense Routes
router.post('/expenses', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), createExpense);
router.get('/expenses', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), getExpenses);
router.get('/expenses/stats', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), getExpenseStats);

// Payroll Routes
router.post('/payroll', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), createPayroll);
router.get('/payroll', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), getPayrolls);
router.put('/payroll/:id/pay', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), markPayrollPaid);

export default router;
