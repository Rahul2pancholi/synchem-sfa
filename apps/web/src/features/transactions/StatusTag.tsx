import { Tag } from 'antd';

export function StatusTag({ status }: { status: string }) {
  const color =
    status === 'APPROVED'
      ? 'success'
      : status === 'REJECTED'
        ? 'error'
        : status === 'SUBMITTED' || status === 'PENDING'
          ? 'processing'
          : 'default';
  return <Tag color={color}>{status}</Tag>;
}
