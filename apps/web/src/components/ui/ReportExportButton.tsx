import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useI18n } from '../../i18n/I18nProvider';
import { downloadReportCsv, type CsvColumn } from '../../lib/export-csv';

export function ReportExportButton<T>({
  filename,
  columns,
  rows,
  loading,
}: {
  filename: string;
  columns: CsvColumn<T>[];
  rows: T[];
  loading?: boolean;
}) {
  const { t } = useI18n();

  return (
    <Button
      icon={<DownloadOutlined />}
      disabled={rows.length === 0}
      loading={loading}
      onClick={() => downloadReportCsv(filename, columns, rows)}
    >
      {t('report.exportCsv')}
    </Button>
  );
}
