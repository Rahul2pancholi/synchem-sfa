import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class Doctor extends Model {
  static table = 'doctors';

  @field('server_id') serverId!: string;
  @field('doctor_name') doctorName!: string;
  @field('route_id') routeId?: string;
  @field('mobile_no') mobileNo?: string;
}

export class Retailer extends Model {
  static table = 'retailers';

  @field('server_id') serverId!: string;
  @field('retailer_name') retailerName!: string;
  @field('route_id') routeId?: string;
}

export class Route extends Model {
  static table = 'routes';

  @field('server_id') serverId!: string;
  @field('route_name') routeName!: string;
  @field('head_quarter_id') headQuarterId!: string;
}

export class DailyCallReport extends Model {
  static table = 'daily_call_reports';

  @field('client_id') clientId!: string;
  @field('server_id') serverId?: string;
  @field('work_date') workDate!: string;
  @field('head_quarter_id') headQuarterId?: string;
  @field('route_id') routeId?: string;
  @field('approve_status') approveStatus!: string;
  @field('local_sync_state') localSyncState!: string;
  @field('version') version!: number;
}

export class DcrDoctorVisit extends Model {
  static table = 'dcr_doctor_visits';

  @field('client_id') clientId!: string;
  @field('dcr_client_id') dcrClientId!: string;
  @field('doctor_server_id') doctorServerId!: string;
  @field('visit_order') visitOrder!: number;
  @field('local_sync_state') localSyncState!: string;
}

export class GpsCheckIn extends Model {
  static table = 'gps_check_ins';

  @field('client_id') clientId!: string;
  @field('latitude') latitude!: number;
  @field('longitude') longitude!: number;
  @field('event_type') eventType!: string;
  @field('recorded_at') recordedAt!: string;
  @field('local_sync_state') localSyncState!: string;
}

export class SyncMeta extends Model {
  static table = 'sync_meta';

  @field('key') key!: string;
  @field('value') value!: string;
}
