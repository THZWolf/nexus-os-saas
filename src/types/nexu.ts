export interface NexuFile {
  id: string;
  name: string;
  path: string;
  overlayPath: string;
  category: 'runtime' | 'build' | 'cgroups' | 'logs' | 'status' | 'sanity' | 'qa';
  categoryLabel: string;
  permissions: string;
  language: 'bash' | 'ini' | 'json' | 'yaml' | 'python';
  description: string;
  content: string;
  highlights: string[];
}

export interface SystemServiceStatus {
  name: string;
  unit: string;
  state: 'active' | 'activating' | 'failed' | 'inactive';
  subState: string;
  cgroupWeight?: number;
  memoryLimit?: string;
  description: string;
}

export interface SanityCheckItem {
  id: string;
  title: string;
  target: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  details: string;
  timeMs?: number;
}
