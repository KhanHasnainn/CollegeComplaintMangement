import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { authorizeRoles } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    const authCheck = authorizeRoles(session, ['ADMIN', 'STAFF']);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    // Aggregate statistics
    const [
      total,
      pending,
      underReview,
      assigned,
      inProgress,
      waitingForStudent,
      resolved,
      reopened,
      rejected,
      highPriority,
      byDepartmentRaw,
      byCategoryRaw,
      avgFeedback,
    ] = await Promise.all([
      db.complaint.count(),
      db.complaint.count({ where: { status: 'PENDING' } }),
      db.complaint.count({ where: { status: 'UNDER_REVIEW' } }),
      db.complaint.count({ where: { status: 'ASSIGNED' } }),
      db.complaint.count({ where: { status: 'IN_PROGRESS' } }),
      db.complaint.count({ where: { status: 'WAITING_FOR_STUDENT' } }),
      db.complaint.count({ where: { status: 'RESOLVED' } }),
      db.complaint.count({ where: { status: 'REOPENED' } }),
      db.complaint.count({ where: { status: 'REJECTED' } }),
      db.complaint.count({ where: { priority: { in: ['HIGH', 'CRITICAL'] } } }),
      db.complaint.groupBy({
        by: ['departmentId'],
        _count: { id: true },
      }),
      db.complaint.groupBy({
        by: ['categoryId'],
        _count: { id: true },
      }),
      db.feedback.aggregate({
        _avg: { rating: true },
        _count: { id: true },
      }),
    ]);

    // Map department names
    const departments = await db.department.findMany({ select: { id: true, name: true, code: true } });
    const departmentMap = new Map(departments.map((d) => [d.id, d.name]));
    const byDepartment = byDepartmentRaw.map((item) => ({
      department: departmentMap.get(item.departmentId) || 'Unknown',
      count: item._count.id,
    }));

    // Map category names
    const categories = await db.category.findMany({ select: { id: true, name: true } });
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const byCategory = byCategoryRaw.map((item) => ({
      category: categoryMap.get(item.categoryId) || 'Unknown',
      count: item._count.id,
    }));

    // CSV Download export option
    if (format === 'csv') {
      const allComplaints = await db.complaint.findMany({
        include: {
          student: { select: { name: true, email: true, studentRollNumber: true } },
          department: { select: { name: true } },
          category: { select: { name: true } },
          assignedStaff: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const csvHeader = 'Complaint ID,Date Created,Student Name,Roll Number,Department,Category,Priority,Status,Title,Assigned Staff\n';
      const csvRows = allComplaints.map((c) => {
        const safeTitle = `"${(c.title || '').replace(/"/g, '""')}"`;
        return `${c.complaintNumber},${c.createdAt.toISOString().split('T')[0]},"${c.student?.name || ''}",${c.student?.studentRollNumber || ''},"${c.department?.name || ''}","${c.category?.name || ''}",${c.priority},${c.status},${safeTitle},"${c.assignedStaff?.name || 'Unassigned'}"`;
      });

      const csvContent = csvHeader + csvRows.join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="complaints_report_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      summary: {
        total,
        pending,
        underReview,
        assigned,
        inProgress,
        waitingForStudent,
        resolved,
        reopened,
        rejected,
        highPriority,
        averageRating: avgFeedback._avg.rating ? parseFloat(avgFeedback._avg.rating.toFixed(1)) : 0,
        feedbackCount: avgFeedback._count.id,
      },
      byDepartment,
      byCategory,
    });
  } catch (err: any) {
    console.error('GET /api/admin/reports error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
