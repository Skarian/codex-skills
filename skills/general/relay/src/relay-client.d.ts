export type RelayRequestOptions = {
  method?: string;
  body?: unknown;
  searchParams?: Record<string, unknown>;
};

export type CreateRelayClientOptions = {
  baseUrl?: string | null;
  root?: string;
  throwOnMissing?: boolean;
};

export type RelayEventItem = {
  seq: number;
  status: "message" | "closed";
  inReplyTo?: number | null;
  reason?: string;
  payload: unknown;
  createdAt: string;
};

export type RelayReceiveResult = {
  appName: string;
  items: RelayEventItem[];
};

export const DEFAULT_RELAY_PORT: number;
export function relayRoot(): string;
export function relayDbPath(root?: string): string;
export function relayUrl(port?: string | number): string;
export function readRelayHealth(url: string, options?: { root?: string | null; timeoutMs?: number }): Promise<Record<string, unknown>>;
export function discoverRelayUrl(options?: CreateRelayClientOptions & { explicitUrl?: string | null }): Promise<string | null>;

export class RelayClient {
  baseUrl: string;
  constructor(options: { baseUrl: string });
  request(pathname: string, options?: RelayRequestOptions): Promise<any>;
  listRelays(options?: { appName?: string | null; status?: string | null }): Promise<any>;
  health(): Promise<any>;
  openRelay(options: { appName: string; payload?: unknown }): Promise<any>;
  send(payload?: unknown): Promise<any>;
  receive(): Promise<RelayReceiveResult>;
  received(): Promise<any>;
  closeRelay(options?: { reason?: string; payload?: unknown }): Promise<any>;
}

export function createRelayClient(options?: CreateRelayClientOptions): Promise<RelayClient | null>;
