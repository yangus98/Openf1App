import { inject, Injectable } from "@angular/core";
import { ApiService } from "./api-service-base.service";
import { Driver } from "../interfaces/driver";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DriverService {

    _api = inject(ApiService);

    getDrivers(attributes? : Partial<Driver>) : Observable<Driver[]> {
        return this._api.apiGet<Driver>('drivers', attributes);
    }
}
