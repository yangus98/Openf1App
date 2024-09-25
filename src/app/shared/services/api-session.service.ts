import { inject, Injectable } from "@angular/core";
import { ApiService } from "./api-service-base.service";
import { Session } from "../interfaces/session";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SessionService {

    _api = inject(ApiService);

    getSessions(attributes?: Partial<Session>) : Observable<Session[]> {
        return this._api.apiGet<Session>('sessions', attributes);
    }

    getLatestSession(): Observable<Session> {
        return this._api.apiGet<Session>('sessions?session_key=latest').pipe(
            map(sessions => sessions[0])
        );
    }
}
