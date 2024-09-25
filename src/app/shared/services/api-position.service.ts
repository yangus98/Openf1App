import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Position } from '../interfaces/position';
import { ApiService } from './api-service-base.service';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  _api = inject(ApiService);

  getPositions(attributes?: Partial<Position>): Observable<Position[]> {
    return this._api.apiGet<Position>('position', attributes);
  }
}
