import { PermissionItem } from "./PermissionGroup.entity";

export interface RoleTemplateProps {
  id?: number;
  name: string;
  description?: string | null;
  groupIds?: number[];
  extraPermissions?: PermissionItem[];
}

export class RoleTemplate {
  private _id?: number;
  private _name: string;
  private _description?: string | null;
  private _groupIds: number[];
  private _extraPermissions: PermissionItem[];

  constructor(props: RoleTemplateProps) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._groupIds = props.groupIds || [];
    this._extraPermissions = props.extraPermissions || [];
  }

  get id() { return this._id; }
  get name() { return this._name; }
  get description() { return this._description; }
  get groupIds() { return this._groupIds; }
  get extraPermissions() { return this._extraPermissions; }

  updateInfo(name: string, description?: string | null) {
    this._name = name;
    this._description = description;
  }

  setGroups(groupIds: number[]) {
    this._groupIds = groupIds;
  }

  setExtraPermissions(perms: PermissionItem[]) {
    this._extraPermissions = perms;
  }
}
