import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SvgService {
  constructor(private http: HttpClient) { }

  public getSvg(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'text' });
  }
}
