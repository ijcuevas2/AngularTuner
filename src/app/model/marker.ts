export class Marker {
  private _Id: string | undefined;
  public get Id(): string | undefined {
    return this._Id;
  }

  public set Id(value: string | undefined) {
    this._Id = value;
  }
}
