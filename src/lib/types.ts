export interface CharacterData {
  id: string;
  key: { item_id: string; tenant: string };
  tribe_id: number;
  character_address: string;
  metadata: {
    assembly_id: string;
    name: string;
    description: string;
    url: string;
  };
  owner_cap_id: string;
}

export interface CharacterObject {
  address: string;
  version: number;
  digest: string;
  json: CharacterData;
  dynamicFields: DynamicField[];
}

export interface DynamicField {
  name: { json: Record<string, unknown>; type: { repr: string } };
  contents: { json: Record<string, unknown> };
}

export interface OwnedObject {
  address: string;
  version: number;
  type: string;
  typeName: string;
  json: Record<string, unknown>;
}

export interface TransactionEntry {
  digest: string;
  status: string;
  timestamp: string;
}

export interface WorldEvent {
  eventType: string;
  eventTypeName: string;
  json: Record<string, unknown>;
  timestamp: string;
}

export interface FieldDiff {
  path: string;
  before: unknown;
  after: unknown;
}

export interface ChangeEntry {
  timestamp: number;
  version: number;
  diffs: FieldDiff[];
}
