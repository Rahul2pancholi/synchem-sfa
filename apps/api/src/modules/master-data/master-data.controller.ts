import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import type { JwtPayload } from '@synchem-sfa/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireActor } from '../../common/decorators/require-actor.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { MasterDataService } from './master-data.service';

@Controller('api/v1')
@RequireActor('tenant')
export class MasterDataController {
  constructor(private readonly masterData: MasterDataService) {}

  @Get('states')
  @RequirePermission('MAS20102', 'view')
  listStates(@CurrentUser() user: JwtPayload) {
    return this.masterData.listStates(user.compCode!);
  }

  @Post('states')
  @RequirePermission('MAS20102', 'add')
  createState(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createState(user.compCode!, body);
  }

  @Get('cities')
  @RequirePermission('MAS20102', 'view')
  listCities(@CurrentUser() user: JwtPayload) {
    return this.masterData.listCities(user.compCode!);
  }

  @Post('cities')
  @RequirePermission('MAS20102', 'add')
  createCity(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createCity(user.compCode!, body);
  }

  @Delete('cities/:id')
  @RequirePermission('MAS20102', 'delete')
  deactivateCity(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateCity(user.compCode!, id);
  }

  @Get('head-quarters')
  @RequirePermission('MAS20103', 'view')
  listHeadQuarters(@CurrentUser() user: JwtPayload) {
    return this.masterData.listHeadQuarters(user.compCode!);
  }

  @Post('head-quarters')
  @RequirePermission('MAS20103', 'add')
  createHeadQuarter(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createHeadQuarter(user.compCode!, body);
  }

  @Delete('head-quarters/:id')
  @RequirePermission('MAS20103', 'delete')
  deactivateHeadQuarter(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateHeadQuarter(user.compCode!, id);
  }

  @Get('routes')
  @RequirePermission('MAS20104', 'view')
  listRoutes(@CurrentUser() user: JwtPayload) {
    return this.masterData.listRoutes(user.compCode!);
  }

  @Post('routes')
  @RequirePermission('MAS20104', 'add')
  createRoute(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createRoute(user.compCode!, body);
  }

  @Delete('routes/:id')
  @RequirePermission('MAS20104', 'delete')
  deactivateRoute(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateRoute(user.compCode!, id);
  }

  @Get('brands')
  @RequirePermission('MAS19', 'view')
  listBrands(@CurrentUser() user: JwtPayload) {
    return this.masterData.listBrands(user.compCode!);
  }

  @Post('brands')
  @RequirePermission('MAS19', 'add')
  createBrand(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createBrand(user.compCode!, body);
  }

  @Delete('brands/:id')
  @RequirePermission('MAS19', 'delete')
  deactivateBrand(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateBrand(user.compCode!, id);
  }

  @Get('products')
  @RequirePermission('MAS05', 'view')
  listProducts(@CurrentUser() user: JwtPayload) {
    return this.masterData.listProducts(user.compCode!);
  }

  @Post('products')
  @RequirePermission('MAS05', 'add')
  createProduct(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createProduct(user.compCode!, body);
  }

  @Delete('products/:id')
  @RequirePermission('MAS05', 'delete')
  deactivateProduct(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateProduct(user.compCode!, id);
  }

  @Get('doctors')
  @RequirePermission('MAS09', 'view')
  listDoctors(@CurrentUser() user: JwtPayload) {
    return this.masterData.listDoctors(user.compCode!);
  }

  @Post('doctors')
  @RequirePermission('MAS09', 'add')
  createDoctor(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createDoctor(user.compCode!, body);
  }

  @Delete('doctors/:id')
  @RequirePermission('MAS09', 'delete')
  deactivateDoctor(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateDoctor(user.compCode!, id);
  }

  @Get('doctor-requests')
  @RequirePermission('MAS10', 'view')
  listDoctorRequests(@CurrentUser() user: JwtPayload) {
    return this.masterData.listDoctorRequests(user.compCode!, user.empId!);
  }

  @Post('doctor-requests')
  @RequirePermission('MAS10', 'add')
  createDoctorRequest(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createDoctorRequest(user.compCode!, user.empId!, body);
  }

  @Post('doctor-requests/:id/submit')
  @RequirePermission('MAS10', 'edit')
  submitDoctorRequest(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.submitDoctorRequest(user.compCode!, user.empId!, id);
  }

  @Get('retailers')
  @RequirePermission('MAS03', 'view')
  listRetailers(@CurrentUser() user: JwtPayload) {
    return this.masterData.listRetailers(user.compCode!);
  }

  @Post('retailers')
  @RequirePermission('MAS03', 'add')
  createRetailer(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createRetailer(user.compCode!, body);
  }

  @Delete('retailers/:id')
  @RequirePermission('MAS03', 'delete')
  deactivateRetailer(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateRetailer(user.compCode!, id);
  }

  @Get('stockists')
  @RequirePermission('MAS04', 'view')
  listStockists(@CurrentUser() user: JwtPayload) {
    return this.masterData.listStockists(user.compCode!);
  }

  @Post('stockists')
  @RequirePermission('MAS04', 'add')
  createStockist(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createStockist(user.compCode!, body);
  }

  @Delete('stockists/:id')
  @RequirePermission('MAS04', 'delete')
  deactivateStockist(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateStockist(user.compCode!, id);
  }

  @Get('holidays')
  @RequirePermission('MAS20204', 'view')
  listHolidays(@CurrentUser() user: JwtPayload) {
    return this.masterData.listHolidays(user.compCode!);
  }

  @Post('holidays')
  @RequirePermission('MAS20204', 'add')
  createHoliday(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createHoliday(user.compCode!, body);
  }

  @Delete('holidays/:id')
  @RequirePermission('MAS20204', 'delete')
  deactivateHoliday(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateHoliday(user.compCode!, id);
  }

  @Get('designations')
  @RequirePermission('MAS20201', 'view')
  listDesignations(@CurrentUser() user: JwtPayload) {
    return this.masterData.listLov(user.compCode!, 'designations');
  }

  @Post('designations')
  @RequirePermission('MAS20201', 'add')
  createDesignation(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createLov(user.compCode!, 'designations', body);
  }

  @Delete('designations/:id')
  @RequirePermission('MAS20201', 'delete')
  deactivateDesignation(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateLov(user.compCode!, 'designations', id);
  }

  @Get('dosages')
  @RequirePermission('MAS20202', 'view')
  listDosages(@CurrentUser() user: JwtPayload) {
    return this.masterData.listLov(user.compCode!, 'dosages');
  }

  @Post('dosages')
  @RequirePermission('MAS20202', 'add')
  createDosage(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createLov(user.compCode!, 'dosages', body);
  }

  @Delete('dosages/:id')
  @RequirePermission('MAS20202', 'delete')
  deactivateDosage(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateLov(user.compCode!, 'dosages', id);
  }

  @Get('divisions')
  @RequirePermission('MAS20206', 'view')
  listDivisions(@CurrentUser() user: JwtPayload) {
    return this.masterData.listLov(user.compCode!, 'divisions');
  }

  @Post('divisions')
  @RequirePermission('MAS20206', 'add')
  createDivision(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createLov(user.compCode!, 'divisions', body);
  }

  @Delete('divisions/:id')
  @RequirePermission('MAS20206', 'delete')
  deactivateDivision(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateLov(user.compCode!, 'divisions', id);
  }

  @Get('specialists')
  @RequirePermission('MAS20209', 'view')
  listSpecialists(@CurrentUser() user: JwtPayload) {
    return this.masterData.listLov(user.compCode!, 'specialists');
  }

  @Post('specialists')
  @RequirePermission('MAS20209', 'add')
  createSpecialist(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createLov(user.compCode!, 'specialists', body);
  }

  @Delete('specialists/:id')
  @RequirePermission('MAS20209', 'delete')
  deactivateSpecialist(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateLov(user.compCode!, 'specialists', id);
  }

  @Get('qualifications')
  @RequirePermission('MAS20208', 'view')
  listQualifications(@CurrentUser() user: JwtPayload) {
    return this.masterData.listLov(user.compCode!, 'qualifications');
  }

  @Post('qualifications')
  @RequirePermission('MAS20208', 'add')
  createQualification(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createLov(user.compCode!, 'qualifications', body);
  }

  @Delete('qualifications/:id')
  @RequirePermission('MAS20208', 'delete')
  deactivateQualification(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateLov(user.compCode!, 'qualifications', id);
  }

  @Get('expense-heads')
  @RequirePermission('MAS20203', 'view')
  listExpenseHeads(@CurrentUser() user: JwtPayload) {
    return this.masterData.listLov(user.compCode!, 'expense-heads');
  }

  @Post('expense-heads')
  @RequirePermission('MAS20203', 'add')
  createExpenseHead(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createLov(user.compCode!, 'expense-heads', body);
  }

  @Delete('expense-heads/:id')
  @RequirePermission('MAS20203', 'delete')
  deactivateExpenseHead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateLov(user.compCode!, 'expense-heads', id);
  }

  @Get('expense-templates')
  @RequirePermission('MAS08', 'view')
  listExpenseTemplates(@CurrentUser() user: JwtPayload) {
    return this.masterData.listLov(user.compCode!, 'expense-templates');
  }

  @Post('expense-templates')
  @RequirePermission('MAS08', 'add')
  createExpenseTemplate(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.createLov(user.compCode!, 'expense-templates', body);
  }

  @Delete('expense-templates/:id')
  @RequirePermission('MAS08', 'delete')
  deactivateExpenseTemplate(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.masterData.deactivateLov(user.compCode!, 'expense-templates', id);
  }

  @Post('bulk-import/cities')
  @RequirePermission('MAS20102', 'add')
  bulkImportCities(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.bulkImport(user.compCode!, 'cities', body);
  }

  @Post('bulk-import/head-quarters')
  @RequirePermission('MAS20103', 'add')
  bulkImportHq(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.bulkImport(user.compCode!, 'head-quarters', body);
  }

  @Post('bulk-import/routes')
  @RequirePermission('MAS20104', 'add')
  bulkImportRoutes(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.bulkImport(user.compCode!, 'routes', body);
  }

  @Post('bulk-import/doctors')
  @RequirePermission('MAS09', 'add')
  bulkImportDoctors(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.bulkImport(user.compCode!, 'doctors', body);
  }

  @Post('bulk-import/retailers')
  @RequirePermission('MAS03', 'add')
  bulkImportRetailers(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.bulkImport(user.compCode!, 'retailers', body);
  }

  @Post('bulk-import/stockists')
  @RequirePermission('MAS04', 'add')
  bulkImportStockists(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.bulkImport(user.compCode!, 'stockists', body);
  }

  @Post('bulk-import/products')
  @RequirePermission('MAS05', 'add')
  bulkImportProducts(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.masterData.bulkImport(user.compCode!, 'products', body);
  }
}
