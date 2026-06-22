export type GraphContext = {
  /** e.g. MR ids under requesting RM */
  teamMemberIds?: string[];
  /** Doctor ids on user's routes */
  doctorIds?: string[];
  hints: string[];
};

export interface KnowledgeGraphPort {
  enrichContext(params: {
    compCode: string;
    userId: string;
    roleCode: string;
    intent: { metricId: string; filters: Record<string, unknown> };
  }): Promise<GraphContext>;
}

export const KNOWLEDGE_GRAPH_PORT = Symbol('KNOWLEDGE_GRAPH_PORT');
