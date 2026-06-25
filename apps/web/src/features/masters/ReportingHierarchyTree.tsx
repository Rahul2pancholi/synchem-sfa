import { useMemo, useState, type CSSProperties } from 'react';
import {
  CrownOutlined,
  DownOutlined,
  RightOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Empty, Input, Space, Tag, Typography } from 'antd';
import type { HierarchyTreeNode } from '@synchem-sfa/shared-types';
import { useI18n } from '../../i18n/I18nProvider';

interface ReportingHierarchyTreeProps {
  tree: HierarchyTreeNode[];
}

interface NodeTheme {
  accent: string;
  surface: string;
}

function hierarchyTheme(type: string): NodeTheme {
  const code = type.toUpperCase();
  if (code === 'MGT' || code === 'AD') return { accent: '#7c3aed', surface: '#f5f3ff' };
  if (['MAN', 'RM', 'ZM', 'ZSM', 'RSM'].includes(code)) return { accent: '#0891b2', surface: '#ecfeff' };
  if (code === 'ASM') return { accent: '#ea580c', surface: '#fff7ed' };
  return { accent: '#059669', surface: '#ecfdf5' };
}

function nodeInitials(code: string): string {
  const parts = code.split(/[-_\s]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  return code.slice(0, 2).toUpperCase();
}

function countNodes(nodes: HierarchyTreeNode[]): number {
  return nodes.reduce((sum, node) => sum + 1 + countNodes(node.children ?? []), 0);
}

function collectCollapsibleIds(nodes: HierarchyTreeNode[]): string[] {
  return nodes.flatMap((node) => {
    const childIds = node.children?.length ? collectCollapsibleIds(node.children) : [];
    return node.children?.length ? [node.id, ...childIds] : childIds;
  });
}

function filterTree(nodes: HierarchyTreeNode[], query: string): HierarchyTreeNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  return nodes
    .map((node) => {
      const filteredChildren = filterTree(node.children ?? [], q);
      const selfMatch =
        node.hierarchyCode.toLowerCase().includes(q) || node.hierarchyType.toLowerCase().includes(q);
      if (selfMatch || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    })
    .filter((node): node is HierarchyTreeNode => node !== null);
}

function interpolate(template: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function HierarchyNodeCard({
  node,
  isRoot,
  collapsed,
  onToggle,
  highlighted,
}: {
  node: HierarchyTreeNode;
  isRoot: boolean;
  collapsed: boolean;
  onToggle: () => void;
  highlighted: boolean;
}) {
  const { t } = useI18n();
  const theme = hierarchyTheme(node.hierarchyType);
  const childCount = node.children?.length ?? 0;
  const hasChildren = childCount > 0;

  return (
    <div
      className={`org-node${highlighted ? ' org-node--highlight' : ''}`}
      style={{ '--org-accent': theme.accent, '--org-surface': theme.surface } as CSSProperties}
    >
      {hasChildren ? (
        <button type="button" className="org-node__toggle" onClick={onToggle} aria-label={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <RightOutlined /> : <DownOutlined />}
        </button>
      ) : null}
      <div className="org-node__body">
        <div className="org-node__avatar-wrap">
          <Avatar size={40} className="org-node__avatar" style={{ backgroundColor: theme.accent }}>
            {nodeInitials(node.hierarchyCode)}
          </Avatar>
          {isRoot ? <CrownOutlined className="org-node__crown" /> : null}
        </div>
        <div className="org-node__info">
          <Typography.Text strong className="org-node__title">
            {node.hierarchyCode}
          </Typography.Text>
          <Tag bordered={false} className="org-node__tag">
            {node.hierarchyType}
          </Tag>
        </div>
      </div>
      <div className="org-node__footer">
        <TeamOutlined />
        <span>{interpolate(t('masters.hierarchy.directReports'), { count: childCount })}</span>
      </div>
    </div>
  );
}

function OrgTreeBranch({
  node,
  isRoot,
  collapsedIds,
  onToggle,
  search,
}: {
  node: HierarchyTreeNode;
  isRoot: boolean;
  collapsedIds: Set<string>;
  onToggle: (id: string) => void;
  search: string;
}) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const collapsed = collapsedIds.has(node.id);
  const highlighted =
    !!search.trim() &&
    (node.hierarchyCode.toLowerCase().includes(search.trim().toLowerCase()) ||
      node.hierarchyType.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <li className="org-tree__item">
      <HierarchyNodeCard
        node={node}
        isRoot={isRoot}
        collapsed={collapsed}
        onToggle={() => onToggle(node.id)}
        highlighted={highlighted}
      />
      {hasChildren && !collapsed ? (
        <ul className="org-tree__children">
          {node.children.map((child) => (
            <OrgTreeBranch
              key={child.id}
              node={child}
              isRoot={false}
              collapsedIds={collapsedIds}
              onToggle={onToggle}
              search={search}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function ReportingHierarchyTree({ tree }: ReportingHierarchyTreeProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());

  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);
  const totalNodes = useMemo(() => countNodes(tree), [tree]);

  function toggleNode(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setCollapsedIds(new Set());
  }

  function collapseAll() {
    setCollapsedIds(new Set(collectCollapsibleIds(tree)));
  }

  if (!tree.length) {
    return <Empty description={t('masters.hierarchy.emptyTree')} />;
  }

  return (
    <div className="org-chart">
      <div className="org-chart__toolbar">
        <Space wrap size="middle" className="org-chart__toolbar-left">
          <Tag bordered={false} className="org-chart__stat">
            {interpolate(t('masters.hierarchy.totalNodes'), { count: totalNodes })}
          </Tag>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={t('masters.hierarchy.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="org-chart__search"
          />
        </Space>
        <Space wrap size="small">
          <Button size="small" onClick={expandAll}>
            {t('masters.hierarchy.expandAll')}
          </Button>
          <Button size="small" onClick={collapseAll}>
            {t('masters.hierarchy.collapseAll')}
          </Button>
        </Space>
      </div>

      <Typography.Paragraph type="secondary" className="org-chart__subtitle">
        {t('masters.hierarchy.reportingSubtitle')}
      </Typography.Paragraph>

      <div className="org-chart__canvas">
        {filteredTree.length === 0 ? (
          <Empty description={t('masters.hierarchy.emptyTree')} />
        ) : (
          <ul className="org-tree">
            {filteredTree.map((node) => (
              <OrgTreeBranch
                key={node.id}
                node={node}
                isRoot
                collapsedIds={search.trim() ? new Set() : collapsedIds}
                onToggle={toggleNode}
                search={search}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
