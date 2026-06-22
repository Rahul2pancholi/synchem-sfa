import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  apiSuccess,
  BulkImportRequestSchema,
  CreateBrandRequestSchema,
  CreateCityRequestSchema,
  CreateDoctorRequestSchema,
  CreateHeadQuarterRequestSchema,
  CreateHolidayRequestSchema,
  CreateLovRequestSchema,
  CreateProductRequestSchema,
  CreateRetailerRequestSchema,
  CreateRouteRequestSchema,
  CreateStateRequestSchema,
  CreateStockistRequestSchema,
} from '@synchem-sfa/shared-types';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import { ApprovalService } from '../approvals/approval.service';

type LovType =
  | 'designations'
  | 'dosages'
  | 'divisions'
  | 'specialists'
  | 'qualifications'
  | 'expense-heads'
  | 'expense-templates';

@Injectable()
export class MasterDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvals: ApprovalService,
  ) {}

  // --- Geography ---
  async listStates(compCode: string) {
    const items = await this.prisma.state.findMany({
      where: { compCode, active: true },
      orderBy: { stateName: 'asc' },
    });
    return apiSuccess({ items });
  }

  async createState(compCode: string, body: Record<string, unknown>) {
    const parsed = CreateStateRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    try {
      const item = await this.prisma.state.create({
        data: { compCode, stateName: parsed.data.stateName },
      });
      return apiSuccess(item, 201);
    } catch {
      throw new ConflictException('State already exists');
    }
  }

  async listCities(compCode: string) {
    const items = await this.prisma.city.findMany({
      where: { compCode },
      include: { state: { select: { stateName: true } } },
      orderBy: { cityName: 'asc' },
    });
    return apiSuccess({
      items: items.map((row) => ({
        id: row.id,
        cityName: row.cityName,
        stateId: row.stateId,
        stateName: row.state.stateName,
        active: row.active,
      })),
    });
  }

  async createCity(compCode: string, body: Record<string, unknown>) {
    const parsed = CreateCityRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    await this.assertState(compCode, parsed.data.stateId);
    try {
      const item = await this.prisma.city.create({ data: { compCode, ...parsed.data } });
      return apiSuccess(item, 201);
    } catch {
      throw new ConflictException('City already exists for this state');
    }
  }

  async deactivateCity(compCode: string, id: string) {
    const row = await this.findCity(compCode, id);
    const updated = await this.prisma.city.update({
      where: { id: row.id },
      data: { active: false },
    });
    return apiSuccess(updated);
  }

  async listHeadQuarters(compCode: string) {
    const items = await this.prisma.headQuarter.findMany({
      where: { compCode, deletedAt: null },
      include: { state: { select: { stateName: true } } },
      orderBy: { hqName: 'asc' },
    });
    return apiSuccess({
      items: items.map((row) => ({
        id: row.id,
        hqName: row.hqName,
        stateId: row.stateId,
        stateName: row.state?.stateName ?? null,
        active: row.active,
      })),
    });
  }

  async createHeadQuarter(compCode: string, body: Record<string, unknown>) {
    const parsed = CreateHeadQuarterRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    if (parsed.data.stateId) await this.assertState(compCode, parsed.data.stateId);
    try {
      const item = await this.prisma.headQuarter.create({ data: { compCode, ...parsed.data } });
      return apiSuccess(item, 201);
    } catch {
      throw new ConflictException('HeadQuarter already exists');
    }
  }

  async deactivateHeadQuarter(compCode: string, id: string) {
    const row = await this.findHeadQuarter(compCode, id);
    const updated = await this.prisma.headQuarter.update({
      where: { id: row.id },
      data: { active: false, deletedAt: new Date() },
    });
    return apiSuccess(updated);
  }

  async listRoutes(compCode: string) {
    const items = await this.prisma.route.findMany({
      where: { compCode, deletedAt: null },
      include: { headQuarter: { select: { hqName: true } } },
      orderBy: { routeName: 'asc' },
    });
    return apiSuccess({
      items: items.map((row) => ({
        id: row.id,
        routeName: row.routeName,
        headQuarterId: row.headQuarterId,
        headQuarterName: row.headQuarter.hqName,
        active: row.active,
      })),
    });
  }

  async createRoute(compCode: string, body: Record<string, unknown>) {
    const parsed = CreateRouteRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    await this.findHeadQuarter(compCode, parsed.data.headQuarterId);
    try {
      const item = await this.prisma.route.create({ data: { compCode, ...parsed.data } });
      return apiSuccess(item, 201);
    } catch {
      throw new ConflictException('Route already exists for this HQ');
    }
  }

  async deactivateRoute(compCode: string, id: string) {
    const row = await this.findRoute(compCode, id);
    const updated = await this.prisma.route.update({
      where: { id: row.id },
      data: { active: false, deletedAt: new Date() },
    });
    return apiSuccess(updated);
  }

  // --- Products ---
  async listBrands(compCode: string) {
    const items = await this.prisma.brand.findMany({
      where: { compCode },
      orderBy: { brandName: 'asc' },
    });
    return apiSuccess({ items });
  }

  async createBrand(compCode: string, body: Record<string, unknown>) {
    const parsed = CreateBrandRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    try {
      const item = await this.prisma.brand.create({
        data: { compCode, brandName: parsed.data.brandName, active: parsed.data.active },
      });
      return apiSuccess(item, 201);
    } catch {
      throw new ConflictException('Brand already exists');
    }
  }

  async deactivateBrand(compCode: string, id: string) {
    const row = await this.findBrand(compCode, id);
    const updated = await this.prisma.brand.update({
      where: { id: row.id },
      data: { active: false },
    });
    return apiSuccess(updated);
  }

  async listProducts(compCode: string) {
    const items = await this.prisma.product.findMany({
      where: { compCode, deletedAt: null },
      include: {
        brand: { select: { brandName: true } },
        division: { select: { divisionName: true } },
      },
      orderBy: { productName: 'asc' },
    });
    return apiSuccess({
      items: items.map((row) => ({
        id: row.id,
        productName: row.productName,
        productCode: row.productCode,
        brandId: row.brandId,
        brandName: row.brand?.brandName ?? null,
        divisionId: row.divisionId,
        divisionName: row.division?.divisionName ?? null,
        active: row.active,
      })),
    });
  }

  async createProduct(compCode: string, body: Record<string, unknown>) {
    const parsed = CreateProductRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    if (parsed.data.brandId) await this.findBrand(compCode, parsed.data.brandId);
    if (parsed.data.divisionId) await this.findDivision(compCode, parsed.data.divisionId);
    try {
      const item = await this.prisma.product.create({ data: { compCode, ...parsed.data } });
      return apiSuccess(item, 201);
    } catch {
      throw new ConflictException('Product code already exists');
    }
  }

  async deactivateProduct(compCode: string, id: string) {
    const row = await this.findProduct(compCode, id);
    const updated = await this.prisma.product.update({
      where: { id: row.id },
      data: { active: false, deletedAt: new Date() },
    });
    return apiSuccess(updated);
  }

  // --- Customers ---
  async listDoctors(compCode: string) {
    const items = await this.prisma.doctor.findMany({
      where: { compCode, deletedAt: null },
      include: {
        route: { select: { routeName: true } },
        specialist: { select: { specialistName: true } },
        qualification: { select: { qualificationName: true } },
      },
      orderBy: { doctorName: 'asc' },
    });
    return apiSuccess({
      items: items.map((row) => ({
        id: row.id,
        doctorName: row.doctorName,
        routeId: row.routeId,
        routeName: row.route?.routeName ?? null,
        specialistName: row.specialist?.specialistName ?? null,
        qualificationName: row.qualification?.qualificationName ?? null,
        mobileNo: row.mobileNo,
        active: row.active,
      })),
    });
  }

  async createDoctor(compCode: string, body: Record<string, unknown>) {
    const parsed = CreateDoctorRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    if (parsed.data.routeId) await this.findRoute(compCode, parsed.data.routeId);
    const item = await this.prisma.doctor.create({ data: { compCode, ...parsed.data } });
    return apiSuccess(item, 201);
  }

  async listDoctorRequests(compCode: string, empId: string) {
    const items = await this.prisma.doctor.findMany({
      where: { compCode, submittedBy: empId, deletedAt: null },
      include: {
        route: { select: { routeName: true } },
        specialist: { select: { specialistName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return apiSuccess({
      items: items.map((row) => ({
        id: row.id,
        doctorName: row.doctorName,
        routeName: row.route?.routeName ?? null,
        specialistName: row.specialist?.specialistName ?? null,
        mobileNo: row.mobileNo,
        approveStatus: row.approveStatus,
        active: row.active,
      })),
    });
  }

  async createDoctorRequest(compCode: string, empId: string, body: Record<string, unknown>) {
    const parsed = CreateDoctorRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    if (parsed.data.routeId) await this.findRoute(compCode, parsed.data.routeId);

    const item = await this.prisma.doctor.create({
      data: {
        compCode,
        ...parsed.data,
        approveStatus: 'DRAFT',
        active: false,
        submittedBy: empId,
      },
    });
    return apiSuccess(
      {
        id: item.id,
        doctorName: item.doctorName,
        approveStatus: item.approveStatus,
      },
      201,
    );
  }

  async submitDoctorRequest(compCode: string, empId: string, id: string) {
    const row = await this.prisma.doctor.findFirst({
      where: { compCode, id, submittedBy: empId, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Doctor request not found');
    await this.approvals.submitForApproval(compCode, 'DOCTOR', id, empId);
    return apiSuccess({ id, approveStatus: 'SUBMITTED' });
  }

  async deactivateDoctor(compCode: string, id: string) {
    const row = await this.findDoctor(compCode, id);
    const updated = await this.prisma.doctor.update({
      where: { id: row.id },
      data: { active: false, deletedAt: new Date() },
    });
    return apiSuccess(updated);
  }

  async listRetailers(compCode: string) {
    const items = await this.prisma.retailer.findMany({
      where: { compCode, deletedAt: null },
      include: { route: { select: { routeName: true } } },
      orderBy: { retailerName: 'asc' },
    });
    return apiSuccess({
      items: items.map((row) => ({
        id: row.id,
        retailerName: row.retailerName,
        routeId: row.routeId,
        routeName: row.route?.routeName ?? null,
        active: row.active,
      })),
    });
  }

  async createRetailer(compCode: string, body: Record<string, unknown>) {
    const parsed = CreateRetailerRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    if (parsed.data.routeId) await this.findRoute(compCode, parsed.data.routeId);
    const item = await this.prisma.retailer.create({ data: { compCode, ...parsed.data } });
    return apiSuccess(item, 201);
  }

  async deactivateRetailer(compCode: string, id: string) {
    const row = await this.findRetailer(compCode, id);
    const updated = await this.prisma.retailer.update({
      where: { id: row.id },
      data: { active: false, deletedAt: new Date() },
    });
    return apiSuccess(updated);
  }

  async listStockists(compCode: string) {
    const items = await this.prisma.stockist.findMany({
      where: { compCode, deletedAt: null },
      include: { route: { select: { routeName: true } } },
      orderBy: { stockistName: 'asc' },
    });
    return apiSuccess({
      items: items.map((row) => ({
        id: row.id,
        stockistName: row.stockistName,
        routeId: row.routeId,
        routeName: row.route?.routeName ?? null,
        active: row.active,
      })),
    });
  }

  async createStockist(compCode: string, body: Record<string, unknown>) {
    const parsed = CreateStockistRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    if (parsed.data.routeId) await this.findRoute(compCode, parsed.data.routeId);
    const item = await this.prisma.stockist.create({ data: { compCode, ...parsed.data } });
    return apiSuccess(item, 201);
  }

  async deactivateStockist(compCode: string, id: string) {
    const row = await this.findStockist(compCode, id);
    const updated = await this.prisma.stockist.update({
      where: { id: row.id },
      data: { active: false, deletedAt: new Date() },
    });
    return apiSuccess(updated);
  }

  // --- LOVs ---
  async listLov(compCode: string, type: LovType) {
    const items = await this.fetchLovRows(compCode, type);
    return apiSuccess({ items });
  }

  async createLov(compCode: string, type: LovType, body: Record<string, unknown>) {
    const parsed = CreateLovRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    try {
      const item = await this.createLovRow(compCode, type, parsed.data.name, parsed.data.active);
      return apiSuccess(item, 201);
    } catch {
      throw new ConflictException('Record already exists');
    }
  }

  async deactivateLov(compCode: string, type: LovType, id: string) {
    await this.findLovRow(compCode, type, id);
    const item = await this.deactivateLovRow(type, id);
    return apiSuccess(item);
  }

  async listHolidays(compCode: string) {
    const items = await this.prisma.holiday.findMany({
      where: { compCode },
      orderBy: { holidayDate: 'asc' },
    });
    return apiSuccess({ items });
  }

  async createHoliday(compCode: string, body: Record<string, unknown>) {
    const parsed = CreateHolidayRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    try {
      const item = await this.prisma.holiday.create({
        data: {
          compCode,
          holidayName: parsed.data.holidayName,
          holidayDate: new Date(parsed.data.holidayDate),
          active: parsed.data.active,
        },
      });
      return apiSuccess(item, 201);
    } catch {
      throw new ConflictException('Holiday already exists');
    }
  }

  async deactivateHoliday(compCode: string, id: string) {
    const row = await this.prisma.holiday.findFirst({ where: { id, compCode } });
    if (!row) throw new NotFoundException('Holiday not found');
    const updated = await this.prisma.holiday.update({
      where: { id },
      data: { active: false },
    });
    return apiSuccess(updated);
  }

  // --- Bulk import ---
  async bulkImport(compCode: string, type: string, body: Record<string, unknown>) {
    const parsed = BulkImportRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const result = await this.prisma.$transaction(async (tx) => {
      let created = 0;
      let skipped = 0;

      for (const row of parsed.data.rows) {
        const ok = await this.importRow(tx, compCode, type, row);
        if (ok) created += 1;
        else skipped += 1;
      }

      return { created, skipped, total: parsed.data.rows.length };
    });

    return apiSuccess(result, 201);
  }

  private async importRow(
    tx: Prisma.TransactionClient,
    compCode: string,
    type: string,
    row: Record<string, string>,
  ): Promise<boolean> {
    switch (type) {
      case 'cities': {
        const state = await tx.state.findFirst({
          where: { compCode, stateName: row.stateName?.trim() },
        });
        if (!state || !row.cityName?.trim()) return false;
        await tx.city.upsert({
          where: {
            compCode_stateId_cityName: {
              compCode,
              stateId: state.id,
              cityName: row.cityName.trim(),
            },
          },
          update: { active: true },
          create: { compCode, stateId: state.id, cityName: row.cityName.trim() },
        });
        return true;
      }
      case 'head-quarters': {
        if (!row.hqName?.trim()) return false;
        const state = row.stateName
          ? await tx.state.findFirst({ where: { compCode, stateName: row.stateName.trim() } })
          : null;
        await tx.headQuarter.upsert({
          where: { compCode_hqName: { compCode, hqName: row.hqName.trim() } },
          update: { active: true, deletedAt: null, stateId: state?.id ?? null },
          create: {
            compCode,
            hqName: row.hqName.trim(),
            stateId: state?.id ?? null,
          },
        });
        return true;
      }
      case 'routes': {
        const hq = await tx.headQuarter.findFirst({
          where: { compCode, hqName: row.hqName?.trim(), deletedAt: null },
        });
        if (!hq || !row.routeName?.trim()) return false;
        await tx.route.upsert({
          where: {
            compCode_headQuarterId_routeName: {
              compCode,
              headQuarterId: hq.id,
              routeName: row.routeName.trim(),
            },
          },
          update: { active: true, deletedAt: null },
          create: { compCode, headQuarterId: hq.id, routeName: row.routeName.trim() },
        });
        return true;
      }
      case 'doctors': {
        const route = row.routeName
          ? await tx.route.findFirst({
              where: { compCode, routeName: row.routeName.trim(), deletedAt: null },
            })
          : null;
        if (!row.doctorName?.trim()) return false;
        await tx.doctor.create({
          data: {
            compCode,
            doctorName: row.doctorName.trim(),
            routeId: route?.id ?? null,
            mobileNo: row.mobileNo?.trim() || null,
          },
        });
        return true;
      }
      case 'retailers': {
        const route = row.routeName
          ? await tx.route.findFirst({
              where: { compCode, routeName: row.routeName.trim(), deletedAt: null },
            })
          : null;
        if (!row.retailerName?.trim()) return false;
        await tx.retailer.create({
          data: {
            compCode,
            retailerName: row.retailerName.trim(),
            routeId: route?.id ?? null,
          },
        });
        return true;
      }
      case 'stockists': {
        const route = row.routeName
          ? await tx.route.findFirst({
              where: { compCode, routeName: row.routeName.trim(), deletedAt: null },
            })
          : null;
        if (!row.stockistName?.trim()) return false;
        await tx.stockist.create({
          data: {
            compCode,
            stockistName: row.stockistName.trim(),
            routeId: route?.id ?? null,
          },
        });
        return true;
      }
      case 'products': {
        if (!row.productName?.trim()) return false;
        const brand = row.brandName
          ? await tx.brand.findFirst({ where: { compCode, brandName: row.brandName.trim() } })
          : null;
        await tx.product.create({
          data: {
            compCode,
            productName: row.productName.trim(),
            productCode: row.productCode?.trim() || null,
            brandId: brand?.id ?? null,
          },
        });
        return true;
      }
      default:
        throw new BadRequestException(`Unsupported bulk import type: ${type}`);
    }
  }

  private async fetchLovRows(compCode: string, type: LovType) {
    switch (type) {
      case 'designations':
        return this.prisma.designation.findMany({ where: { compCode }, orderBy: { designationName: 'asc' } });
      case 'dosages':
        return this.prisma.dosage.findMany({ where: { compCode }, orderBy: { dosageName: 'asc' } });
      case 'divisions':
        return this.prisma.productDivision.findMany({ where: { compCode }, orderBy: { divisionName: 'asc' } });
      case 'specialists':
        return this.prisma.specialist.findMany({ where: { compCode }, orderBy: { specialistName: 'asc' } });
      case 'qualifications':
        return this.prisma.qualification.findMany({ where: { compCode }, orderBy: { qualificationName: 'asc' } });
      case 'expense-heads':
        return this.prisma.expenseHead.findMany({ where: { compCode }, orderBy: { headName: 'asc' } });
      case 'expense-templates':
        return this.prisma.expenseTemplate.findMany({ where: { compCode }, orderBy: { templateName: 'asc' } });
    }
  }

  private async createLovRow(compCode: string, type: LovType, name: string, active: boolean) {
    switch (type) {
      case 'designations':
        return this.prisma.designation.create({ data: { compCode, designationName: name, active } });
      case 'dosages':
        return this.prisma.dosage.create({ data: { compCode, dosageName: name, active } });
      case 'divisions':
        return this.prisma.productDivision.create({ data: { compCode, divisionName: name, active } });
      case 'specialists':
        return this.prisma.specialist.create({ data: { compCode, specialistName: name, active } });
      case 'qualifications':
        return this.prisma.qualification.create({ data: { compCode, qualificationName: name, active } });
      case 'expense-heads':
        return this.prisma.expenseHead.create({ data: { compCode, headName: name, active } });
      case 'expense-templates':
        return this.prisma.expenseTemplate.create({ data: { compCode, templateName: name, active } });
    }
  }

  private async findLovRow(compCode: string, type: LovType, id: string) {
    const rows = await this.fetchLovRows(compCode, type);
    if (!rows.find((row) => row.id === id)) {
      throw new NotFoundException('Record not found');
    }
  }

  private async deactivateLovRow(type: LovType, id: string) {
    switch (type) {
      case 'designations':
        return this.prisma.designation.update({ where: { id }, data: { active: false } });
      case 'dosages':
        return this.prisma.dosage.update({ where: { id }, data: { active: false } });
      case 'divisions':
        return this.prisma.productDivision.update({ where: { id }, data: { active: false } });
      case 'specialists':
        return this.prisma.specialist.update({ where: { id }, data: { active: false } });
      case 'qualifications':
        return this.prisma.qualification.update({ where: { id }, data: { active: false } });
      case 'expense-heads':
        return this.prisma.expenseHead.update({ where: { id }, data: { active: false } });
      case 'expense-templates':
        return this.prisma.expenseTemplate.update({ where: { id }, data: { active: false } });
    }
  }

  private async assertState(compCode: string, stateId: string) {
    const state = await this.prisma.state.findFirst({ where: { id: stateId, compCode } });
    if (!state) throw new BadRequestException('Invalid state');
  }

  private async findCity(compCode: string, id: string) {
    const row = await this.prisma.city.findFirst({ where: { id, compCode } });
    if (!row) throw new NotFoundException('City not found');
    return row;
  }

  private async findHeadQuarter(compCode: string, id: string) {
    const row = await this.prisma.headQuarter.findFirst({
      where: { id, compCode, deletedAt: null },
    });
    if (!row) throw new NotFoundException('HeadQuarter not found');
    return row;
  }

  private async findRoute(compCode: string, id: string) {
    const row = await this.prisma.route.findFirst({
      where: { id, compCode, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Route not found');
    return row;
  }

  private async findBrand(compCode: string, id: string) {
    const row = await this.prisma.brand.findFirst({ where: { id, compCode } });
    if (!row) throw new NotFoundException('Brand not found');
    return row;
  }

  private async findDivision(compCode: string, id: string) {
    const row = await this.prisma.productDivision.findFirst({ where: { id, compCode } });
    if (!row) throw new NotFoundException('Division not found');
    return row;
  }

  private async findProduct(compCode: string, id: string) {
    const row = await this.prisma.product.findFirst({ where: { id, compCode, deletedAt: null } });
    if (!row) throw new NotFoundException('Product not found');
    return row;
  }

  private async findDoctor(compCode: string, id: string) {
    const row = await this.prisma.doctor.findFirst({ where: { id, compCode, deletedAt: null } });
    if (!row) throw new NotFoundException('Doctor not found');
    return row;
  }

  private async findRetailer(compCode: string, id: string) {
    const row = await this.prisma.retailer.findFirst({ where: { id, compCode, deletedAt: null } });
    if (!row) throw new NotFoundException('Retailer not found');
    return row;
  }

  private async findStockist(compCode: string, id: string) {
    const row = await this.prisma.stockist.findFirst({ where: { id, compCode, deletedAt: null } });
    if (!row) throw new NotFoundException('Stockist not found');
    return row;
  }
}
