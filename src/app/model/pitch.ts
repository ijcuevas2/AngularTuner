export class Pitch {
  private _path: string | undefined;
  public get Path(): string | undefined {
    return this._path;
  }

  public set Path(value: string | undefined) {
    this._path = value;
  }

  private _isVisible: boolean | undefined;
  public get IsVisible(): boolean | undefined {
    return this._isVisible;
  }

  public set IsVisible(value: boolean | undefined) {
    this._isVisible = value;
  }

  private _id: string | undefined;
  public get Id(): string | undefined {
    return this._id;
  }

  public set Id(value: string | undefined) {
    this._id = value;
  }
}
