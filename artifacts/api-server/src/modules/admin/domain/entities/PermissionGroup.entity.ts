export interface PermissionItem {
  resourceId: number;
  resourceCode?: string;
  action: string;
}

export interface PermissionGroupProps {
  id?: number;
  name: string;
  description?: string | null;
  items?: PermissionItem[];
}

export class PermissionGroup {
  private _id?: number;
  private _name: string;
  private _description?: string | null;
  private _items: PermissionItem[];

  constructor(props: PermissionGroupProps) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._items = props.items || [];
  }

  get id() { return this._id; }
  get name() { return this._name; }
  get description() { return this._description; }
  get items() { return this._items; }

  updateInfo(name: string, description?: string | null) {
    this._name = name;
    this._description = description;
  }

  setItems(items: PermissionItem[]) {
    this._items = items;
  }
}
