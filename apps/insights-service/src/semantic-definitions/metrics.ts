export type MetricDefinition = {
  id: string;
  description: string;
  dimensions: string[];
  sqlTemplate: string;
};

/** Pre-approved read-only SQL templates — every query MUST filter by :compCode */
export const SEMANTIC_METRICS: MetricDefinition[] = [
  {
    id: 'pob_value',
    description: 'Approved POB amount in period',
    dimensions: ['empId', 'month', 'year'],
    sqlTemplate: `
      SELECT COALESCE(SUM(p.total_amount), 0) AS value
      FROM personal_orders p
      WHERE p.comp_code = :compCode
        AND p.approve_status = 'APPROVED'
        AND (:empId IS NULL OR p.emp_id = :empId)
        AND (:month IS NULL OR EXTRACT(MONTH FROM p.order_date) = :month)
        AND (:year IS NULL OR EXTRACT(YEAR FROM p.order_date) = :year)
    `,
  },
  {
    id: 'pob_achievement_pct',
    description: 'POB achievement vs monthly target',
    dimensions: ['empId', 'month', 'year'],
    sqlTemplate: `
      SELECT CASE WHEN t.amount_target > 0
        THEN ROUND(100.0 * COALESCE(p.pob_total, 0) / t.amount_target, 1)
        ELSE 0 END AS value
      FROM employee_monthly_targets t
      LEFT JOIN (
        SELECT emp_id, SUM(total_amount) AS pob_total
        FROM personal_orders
        WHERE comp_code = :compCode AND approve_status = 'APPROVED'
        GROUP BY emp_id
      ) p ON p.emp_id = t.emp_id
      WHERE t.comp_code = :compCode
        AND t.target_month = :month AND t.target_year = :year
        AND (:empId IS NULL OR t.emp_id = :empId)
    `,
  },
  {
    id: 'dcr_count',
    description: 'Submitted DCR count in period',
    dimensions: ['empId', 'month', 'year'],
    sqlTemplate: `
      SELECT COUNT(*) AS value
      FROM daily_call_reports d
      WHERE d.comp_code = :compCode
        AND d.approve_status IN ('SUBMITTED', 'APPROVED')
        AND (:empId IS NULL OR d.emp_id = :empId)
        AND (:month IS NULL OR EXTRACT(MONTH FROM d.work_date) = :month)
        AND (:year IS NULL OR EXTRACT(YEAR FROM d.work_date) = :year)
    `,
  },
  {
    id: 'doctor_coverage_pct',
    description: 'Doctors visited vs planned',
    dimensions: ['empId', 'month', 'year'],
    sqlTemplate: `
      SELECT CASE WHEN planned > 0 THEN ROUND(100.0 * visited / planned, 1) ELSE 0 END AS value
      FROM (
        SELECT
          COUNT(DISTINCT dv.doctor_id) AS visited,
          GREATEST(COUNT(DISTINCT dv.doctor_id), 1) AS planned
        FROM dcr_doctor_visits dv
        JOIN daily_call_reports d ON d.id = dv.dcr_id AND d.comp_code = :compCode
        WHERE (:empId IS NULL OR d.emp_id = :empId)
          AND (:month IS NULL OR EXTRACT(MONTH FROM d.work_date) = :month)
          AND (:year IS NULL OR EXTRACT(YEAR FROM d.work_date) = :year)
      ) s
    `,
  },
  {
    id: 'missed_calls_count',
    description: 'Missed doctor calls in month',
    dimensions: ['empId', 'month', 'year'],
    sqlTemplate: `
      SELECT COUNT(*) AS value
      FROM missed_call_records m
      WHERE m.comp_code = :compCode
        AND (:empId IS NULL OR m.emp_id = :empId)
        AND m.call_month = :month AND m.call_year = :year
    `,
  },
  {
    id: 'rtp_adherence_pct',
    description: 'RTP days with field work vs planned',
    dimensions: ['empId', 'month', 'year'],
    sqlTemplate: `
      SELECT CASE WHEN total_days > 0
        THEN ROUND(100.0 * field_days / total_days, 1) ELSE 0 END AS value
      FROM (
        SELECT
          COUNT(*) FILTER (WHERE work_type = 'FIELD') AS field_days,
          COUNT(*) AS total_days
        FROM tour_programme_days tpd
        JOIN tour_programmes tp ON tp.id = tpd.tour_programme_id AND tp.comp_code = :compCode
        WHERE tp.plan_month = :month AND tp.plan_year = :year
          AND (:empId IS NULL OR tp.emp_id = :empId)
      ) s
    `,
  },
  {
    id: 'expense_total',
    description: 'Approved expense claim total',
    dimensions: ['empId', 'month', 'year'],
    sqlTemplate: `
      SELECT COALESCE(SUM(e.total_amount), 0) AS value
      FROM expense_statements e
      WHERE e.comp_code = :compCode
        AND e.approve_status = 'APPROVED'
        AND e.claim_month = :month AND e.claim_year = :year
        AND (:empId IS NULL OR e.emp_id = :empId)
    `,
  },
  {
    id: 'active_doctors_count',
    description: 'Active approved doctors',
    dimensions: ['routeId'],
    sqlTemplate: `
      SELECT COUNT(*) AS value
      FROM doctors d
      WHERE d.comp_code = :compCode
        AND d.active = true AND d.approve_status = 'APPROVED'
        AND d.deleted_at IS NULL
        AND (:routeId IS NULL OR d.route_id = :routeId)
    `,
  },
];

export const METRIC_BY_ID = new Map(SEMANTIC_METRICS.map((m) => [m.id, m]));
