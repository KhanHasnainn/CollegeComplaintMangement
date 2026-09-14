import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { authorizeRoles } from '@/lib/rbac';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const categories = await db.category.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: { department: { select: { id: true, name: true, code: true } } },
      orderBy: [
        { department: { name: 'asc' } },
        { name: 'asc' },
      ],
    });
    return NextResponse.json({ categories });
  } catch (err: any) {
    console.error('GET /api/admin/categories error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    const authCheck = authorizeRoles(session, ['ADMIN']);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, departmentId } = body;

    const trimmedName = name?.trim();
    if (!trimmedName || !departmentId) {
      return NextResponse.json({ error: 'Name and department are required' }, { status: 400 });
    }

    // Check for duplicate category under the same department
    const existing = await db.category.findFirst({
      where: {
        departmentId,
        name: trimmedName,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A category named "${trimmedName}" already exists for this department.` },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: { name: trimmedName, description, departmentId },
      include: { department: true },
    });

    await createAuditLog({
      actorId: session!.userId,
      action: 'CREATE_CATEGORY',
      resourceType: 'CATEGORY',
      resourceId: category.id,
    });

    return NextResponse.json({ message: 'Category created', category });
  } catch (err: any) {
    console.error('POST /api/admin/categories error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    const authCheck = authorizeRoles(session, ['ADMIN']);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason }, { status: 403 });
    }

    const body = await req.json();
    const { categoryId, name, description, isActive, departmentId } = body;

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const trimmedName = name ? name.trim() : undefined;
    if (trimmedName) {
      const currentCat = await db.category.findUnique({ where: { id: categoryId } });
      const targetDeptId = departmentId || currentCat?.departmentId;
      if (targetDeptId) {
        const duplicate = await db.category.findFirst({
          where: {
            id: { not: categoryId },
            departmentId: targetDeptId,
            name: trimmedName,
          },
        });
        if (duplicate) {
          return NextResponse.json(
            { error: `A category named "${trimmedName}" already exists for this department.` },
            { status: 409 }
          );
        }
      }
    }

    const updated = await db.category.update({
      where: { id: categoryId },
      data: {
        ...(trimmedName && { name: trimmedName }),
        ...(description !== undefined && { description }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(departmentId && { departmentId }),
      },
      include: { department: true },
    });

    return NextResponse.json({ message: 'Category updated', category: updated });
  } catch (err: any) {
    console.error('PATCH /api/admin/categories error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
