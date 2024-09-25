import { inject, Injectable } from "@angular/core";
import { ApiService } from "./api-service-base.service";
import { Meeting } from "../interfaces/meeting";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class MeetingService {

    _api = inject(ApiService);

    getMeetings(attributes?: Partial<Meeting>) : Observable<Meeting[]> {
        return this._api.apiGet<Meeting>('meetings', attributes);
    }
    
}
