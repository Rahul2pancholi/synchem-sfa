import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'doctors',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'doctor_name', type: 'string' },
        { name: 'route_id', type: 'string', isOptional: true },
        { name: 'mobile_no', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'retailers',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'retailer_name', type: 'string' },
        { name: 'route_id', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'routes',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'route_name', type: 'string' },
        { name: 'head_quarter_id', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'daily_call_reports',
      columns: [
        { name: 'client_id', type: 'string', isIndexed: true },
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'work_date', type: 'string' },
        { name: 'head_quarter_id', type: 'string', isOptional: true },
        { name: 'route_id', type: 'string', isOptional: true },
        { name: 'approve_status', type: 'string' },
        { name: 'local_sync_state', type: 'string' },
        { name: 'version', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'dcr_doctor_visits',
      columns: [
        { name: 'client_id', type: 'string', isIndexed: true },
        { name: 'dcr_client_id', type: 'string', isIndexed: true },
        { name: 'doctor_server_id', type: 'string' },
        { name: 'visit_order', type: 'number' },
        { name: 'local_sync_state', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'gps_check_ins',
      columns: [
        { name: 'client_id', type: 'string', isIndexed: true },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'event_type', type: 'string' },
        { name: 'recorded_at', type: 'string' },
        { name: 'local_sync_state', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'sync_meta',
      columns: [
        { name: 'key', type: 'string', isIndexed: true },
        { name: 'value', type: 'string' },
      ],
    }),
  ],
});
