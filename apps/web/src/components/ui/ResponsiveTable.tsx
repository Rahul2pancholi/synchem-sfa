import { Grid, Table } from 'antd';
import type { TableProps } from 'antd';

/** Table wrapper: horizontal scroll on small screens, compact rows on mobile. */
export function ResponsiveTable<RecordType extends object>(props: TableProps<RecordType>) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div className="responsive-table-wrap">
      <Table
        {...props}
        size={isMobile ? 'small' : props.size}
        scroll={{ x: 'max-content', ...props.scroll }}
        pagination={
          props.pagination === false
            ? false
            : {
                pageSize: 20,
                showSizeChanger: !isMobile,
                ...(typeof props.pagination === 'object' ? props.pagination : {}),
              }
        }
      />
    </div>
  );
}
