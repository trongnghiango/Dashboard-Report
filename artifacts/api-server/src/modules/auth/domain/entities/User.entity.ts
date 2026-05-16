export interface UserProps {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string | null;
  isActive: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private _id: string;
  private _username: string;
  private _passwordHash: string;
  private _fullName: string | null;
  private _isActive: number;

  constructor(props: UserProps) {
    this._id = props.id;
    this._username = props.username;
    this._passwordHash = props.passwordHash;
    this._fullName = props.fullName;
    this._isActive = props.isActive;
  }

  get id() { return this._id; }
  get username() { return this._username; }
  get passwordHash() { return this._passwordHash; }
  get fullName() { return this._fullName; }
  get isActive() { return this._isActive; }
}
