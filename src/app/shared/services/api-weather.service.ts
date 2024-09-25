import { inject, Injectable } from "@angular/core";
import { ApiService } from "./api-service-base.service";
import { Weather } from "../interfaces/weather";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class WeatherService {
    _api = inject(ApiService);

    getWeather(sessionKey: number, meetingKey: number, attributes?: Partial<Weather>): Observable<Weather[]> {
        return this._api.apiGet<Weather>('weather', attributes);
    }
}

