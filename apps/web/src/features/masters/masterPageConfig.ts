import type { MessageKey } from '@synchem-sfa/shared-i18n';

export type FieldType = 'text' | 'number' | 'select' | 'date';

export interface FormField {
  name: string;
  labelKey: MessageKey;
  type?: FieldType;
  required?: boolean;
  optionsFrom?: string;
  optionLabelKey?: string;
  optionValueKey?: string;
}

export interface TableColumn {
  key: string;
  labelKey: MessageKey;
}

export interface MasterPageConfig {
  titleKey: MessageKey;
  createTitleKey: MessageKey;
  apiPath: string;
  columns: TableColumn[];
  formFields: FormField[];
  nameField?: string;
  loadFailedKey: MessageKey;
  createFailedKey: MessageKey;
  deleteFailedKey?: MessageKey;
  canDelete?: boolean;
}

export interface LovPageConfig {
  titleKey: MessageKey;
  apiPath: string;
  nameField: string;
  loadFailedKey: MessageKey;
  createFailedKey: MessageKey;
}

export interface BulkUploadConfig {
  titleKey: MessageKey;
  apiPath: string;
  columnsHint: string;
  loadFailedKey: MessageKey;
}

export const LOV_PAGES: Record<string, LovPageConfig> = {
  designation: {
    titleKey: 'masters.lov.designation',
    apiPath: '/api/v1/designations',
    nameField: 'designationName',
    loadFailedKey: 'masters.lov.loadFailed',
    createFailedKey: 'masters.lov.createFailed',
  },
  dosage: {
    titleKey: 'masters.lov.dosage',
    apiPath: '/api/v1/dosages',
    nameField: 'dosageName',
    loadFailedKey: 'masters.lov.loadFailed',
    createFailedKey: 'masters.lov.createFailed',
  },
  division: {
    titleKey: 'masters.lov.division',
    apiPath: '/api/v1/divisions',
    nameField: 'divisionName',
    loadFailedKey: 'masters.lov.loadFailed',
    createFailedKey: 'masters.lov.createFailed',
  },
  specialist: {
    titleKey: 'masters.lov.specialist',
    apiPath: '/api/v1/specialists',
    nameField: 'specialistName',
    loadFailedKey: 'masters.lov.loadFailed',
    createFailedKey: 'masters.lov.createFailed',
  },
  qualification: {
    titleKey: 'masters.lov.qualification',
    apiPath: '/api/v1/qualifications',
    nameField: 'qualificationName',
    loadFailedKey: 'masters.lov.loadFailed',
    createFailedKey: 'masters.lov.createFailed',
  },
  expenseHead: {
    titleKey: 'masters.lov.expenseHead',
    apiPath: '/api/v1/expense-heads',
    nameField: 'headName',
    loadFailedKey: 'masters.lov.loadFailed',
    createFailedKey: 'masters.lov.createFailed',
  },
  expenseTemplate: {
    titleKey: 'masters.lov.expenseTemplate',
    apiPath: '/api/v1/expense-templates',
    nameField: 'templateName',
    loadFailedKey: 'masters.lov.loadFailed',
    createFailedKey: 'masters.lov.createFailed',
  },
};

export const BULK_PAGES: Record<string, BulkUploadConfig> = {
  bulkCityUpload: {
    titleKey: 'masters.bulk.city',
    apiPath: '/api/v1/bulk-import/cities',
    columnsHint: 'stateName,cityName',
    loadFailedKey: 'masters.bulk.failed',
  },
  bulkHQUpload: {
    titleKey: 'masters.bulk.hq',
    apiPath: '/api/v1/bulk-import/head-quarters',
    columnsHint: 'hqName,stateName',
    loadFailedKey: 'masters.bulk.failed',
  },
  bulkRouteUpload: {
    titleKey: 'masters.bulk.route',
    apiPath: '/api/v1/bulk-import/routes',
    columnsHint: 'hqName,routeName',
    loadFailedKey: 'masters.bulk.failed',
  },
  bulkDoctorUpload: {
    titleKey: 'masters.bulk.doctor',
    apiPath: '/api/v1/bulk-import/doctors',
    columnsHint: 'doctorName,routeName,mobileNo',
    loadFailedKey: 'masters.bulk.failed',
  },
  bulkRetailerUpload: {
    titleKey: 'masters.bulk.retailer',
    apiPath: '/api/v1/bulk-import/retailers',
    columnsHint: 'retailerName,routeName',
    loadFailedKey: 'masters.bulk.failed',
  },
  bulkStockistUpload: {
    titleKey: 'masters.bulk.stockist',
    apiPath: '/api/v1/bulk-import/stockists',
    columnsHint: 'stockistName,routeName',
    loadFailedKey: 'masters.bulk.failed',
  },
  bulkProductUpload: {
    titleKey: 'masters.bulk.product',
    apiPath: '/api/v1/bulk-import/products',
    columnsHint: 'productName,productCode,brandName',
    loadFailedKey: 'masters.bulk.failed',
  },
};

export function getMasterPageConfig(routeKey: string): MasterPageConfig | null {
  const configs: Record<string, MasterPageConfig> = {
    city: {
      titleKey: 'masters.city.title',
      createTitleKey: 'masters.city.createTitle',
      apiPath: '/api/v1/cities',
      loadFailedKey: 'masters.city.loadFailed',
      createFailedKey: 'masters.city.createFailed',
      deleteFailedKey: 'masters.city.deleteFailed',
      canDelete: true,
      columns: [
        { key: 'cityName', labelKey: 'masters.city.name' },
        { key: 'stateName', labelKey: 'masters.city.state' },
      ],
      formFields: [
        { name: 'stateId', labelKey: 'masters.city.state', type: 'select', required: true, optionsFrom: '/api/v1/states', optionLabelKey: 'stateName', optionValueKey: 'id' },
        { name: 'cityName', labelKey: 'masters.city.name', required: true },
      ],
    },
    headQuarter: {
      titleKey: 'masters.hq.title',
      createTitleKey: 'masters.hq.createTitle',
      apiPath: '/api/v1/head-quarters',
      loadFailedKey: 'masters.hq.loadFailed',
      createFailedKey: 'masters.hq.createFailed',
      deleteFailedKey: 'masters.hq.deleteFailed',
      canDelete: true,
      columns: [
        { key: 'hqName', labelKey: 'masters.hq.name' },
        { key: 'stateName', labelKey: 'masters.city.state' },
      ],
      formFields: [
        { name: 'hqName', labelKey: 'masters.hq.name', required: true },
        { name: 'stateId', labelKey: 'masters.city.state', type: 'select', optionsFrom: '/api/v1/states', optionLabelKey: 'stateName', optionValueKey: 'id' },
      ],
    },
    route: {
      titleKey: 'masters.route.title',
      createTitleKey: 'masters.route.createTitle',
      apiPath: '/api/v1/routes',
      loadFailedKey: 'masters.route.loadFailed',
      createFailedKey: 'masters.route.createFailed',
      deleteFailedKey: 'masters.route.deleteFailed',
      canDelete: true,
      columns: [
        { key: 'routeName', labelKey: 'masters.route.name' },
        { key: 'headQuarterName', labelKey: 'masters.hq.name' },
      ],
      formFields: [
        { name: 'headQuarterId', labelKey: 'masters.hq.name', type: 'select', required: true, optionsFrom: '/api/v1/head-quarters', optionLabelKey: 'hqName', optionValueKey: 'id' },
        { name: 'routeName', labelKey: 'masters.route.name', required: true },
      ],
    },
    brand: {
      titleKey: 'masters.brand.title',
      createTitleKey: 'masters.brand.createTitle',
      apiPath: '/api/v1/brands',
      loadFailedKey: 'masters.brand.loadFailed',
      createFailedKey: 'masters.brand.createFailed',
      deleteFailedKey: 'masters.brand.deleteFailed',
      canDelete: true,
      nameField: 'brandName',
      columns: [{ key: 'brandName', labelKey: 'masters.brand.name' }],
      formFields: [{ name: 'brandName', labelKey: 'masters.brand.name', required: true }],
    },
    product: {
      titleKey: 'masters.product.title',
      createTitleKey: 'masters.product.createTitle',
      apiPath: '/api/v1/products',
      loadFailedKey: 'masters.product.loadFailed',
      createFailedKey: 'masters.product.createFailed',
      deleteFailedKey: 'masters.product.deleteFailed',
      canDelete: true,
      columns: [
        { key: 'productName', labelKey: 'masters.product.name' },
        { key: 'productCode', labelKey: 'masters.product.code' },
        { key: 'brandName', labelKey: 'masters.brand.name' },
      ],
      formFields: [
        { name: 'productName', labelKey: 'masters.product.name', required: true },
        { name: 'productCode', labelKey: 'masters.product.code' },
        { name: 'brandId', labelKey: 'masters.brand.name', type: 'select', optionsFrom: '/api/v1/brands', optionLabelKey: 'brandName', optionValueKey: 'id' },
        { name: 'divisionId', labelKey: 'masters.lov.division', type: 'select', optionsFrom: '/api/v1/divisions', optionLabelKey: 'divisionName', optionValueKey: 'id' },
      ],
    },
    doctor: {
      titleKey: 'masters.doctor.title',
      createTitleKey: 'masters.doctor.createTitle',
      apiPath: '/api/v1/doctors',
      loadFailedKey: 'masters.doctor.loadFailed',
      createFailedKey: 'masters.doctor.createFailed',
      deleteFailedKey: 'masters.doctor.deleteFailed',
      canDelete: true,
      columns: [
        { key: 'doctorName', labelKey: 'masters.doctor.name' },
        { key: 'routeName', labelKey: 'masters.route.name' },
        { key: 'mobileNo', labelKey: 'masters.employee.mobile' },
      ],
      formFields: [
        { name: 'doctorName', labelKey: 'masters.doctor.name', required: true },
        { name: 'routeId', labelKey: 'masters.route.name', type: 'select', optionsFrom: '/api/v1/routes', optionLabelKey: 'routeName', optionValueKey: 'id' },
        { name: 'mobileNo', labelKey: 'masters.employee.mobile' },
      ],
    },
    retailer: {
      titleKey: 'masters.retailer.title',
      createTitleKey: 'masters.retailer.createTitle',
      apiPath: '/api/v1/retailers',
      loadFailedKey: 'masters.retailer.loadFailed',
      createFailedKey: 'masters.retailer.createFailed',
      deleteFailedKey: 'masters.retailer.deleteFailed',
      canDelete: true,
      columns: [
        { key: 'retailerName', labelKey: 'masters.retailer.name' },
        { key: 'routeName', labelKey: 'masters.route.name' },
      ],
      formFields: [
        { name: 'retailerName', labelKey: 'masters.retailer.name', required: true },
        { name: 'routeId', labelKey: 'masters.route.name', type: 'select', optionsFrom: '/api/v1/routes', optionLabelKey: 'routeName', optionValueKey: 'id' },
      ],
    },
    stockist: {
      titleKey: 'masters.stockist.title',
      createTitleKey: 'masters.stockist.createTitle',
      apiPath: '/api/v1/stockists',
      loadFailedKey: 'masters.stockist.loadFailed',
      createFailedKey: 'masters.stockist.createFailed',
      deleteFailedKey: 'masters.stockist.deleteFailed',
      canDelete: true,
      columns: [
        { key: 'stockistName', labelKey: 'masters.stockist.name' },
        { key: 'routeName', labelKey: 'masters.route.name' },
      ],
      formFields: [
        { name: 'stockistName', labelKey: 'masters.stockist.name', required: true },
        { name: 'routeId', labelKey: 'masters.route.name', type: 'select', optionsFrom: '/api/v1/routes', optionLabelKey: 'routeName', optionValueKey: 'id' },
      ],
    },
    holiday: {
      titleKey: 'masters.holiday.title',
      createTitleKey: 'masters.holiday.createTitle',
      apiPath: '/api/v1/holidays',
      loadFailedKey: 'masters.holiday.loadFailed',
      createFailedKey: 'masters.holiday.createFailed',
      deleteFailedKey: 'masters.holiday.deleteFailed',
      canDelete: true,
      columns: [
        { key: 'holidayName', labelKey: 'masters.holiday.name' },
        { key: 'holidayDate', labelKey: 'masters.holiday.date' },
      ],
      formFields: [
        { name: 'holidayName', labelKey: 'masters.holiday.name', required: true },
        { name: 'holidayDate', labelKey: 'masters.holiday.date', type: 'date', required: true },
      ],
    },
  };

  return configs[routeKey] ?? null;
}
