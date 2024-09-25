import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonImg, IonItem, IonList, IonButtons, IonBackButton, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { DriverService } from '../services/api-driver.service';
import { Driver } from '../interfaces/driver';
import { Session } from '../interfaces/session';
import { ActivatedRoute} from '@angular/router';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SessionService } from '../services/api-session.service';
import { WeatherService } from '../services/api-weather.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [
    RouterModule,
    IonBackButton, IonButtons, IonImg, IonItem, IonLabel, IonSegmentButton, IonSegment, IonList, IonContent, IonHeader, IonTitle, IonToolbar,
    CommonModule, FormsModule
  ],
  providers: [DatePipe]
})
export class DetailsPage implements OnInit {
  segmentValue: 'sessions' | 'drivers' | 'weather' = 'sessions';
  sessions: Session[] = [];
  drivers: Driver[] = [];
  weathers: { [key: string]: any } = {};
  weatherKeys: string[] = [];
  weatherAliasMap: { [key: string]: string } = {
    'air_temperature': 'Air Temperature',
    'wind_speed': 'Wind Speed',
    'humidity': 'Humidity',
    'pressure': 'Pressure',
    'rainfall': 'Rainfall',
    'track_temperature': 'Track Temperature',
    'wind_direction': 'Wind Direction',
  };
  meetingKey: any;
  selectedSession: Session | null = null;

  private _apiD = inject(DriverService);
  private _apiS = inject(SessionService);
  private _apiW = inject(WeatherService);
  private _activatedRoute = inject(ActivatedRoute);


  ngOnInit() {
    this.meetingKey = +this._activatedRoute.snapshot.params['idMeeting'];

    this.loadInitialData();
  }

  loadInitialData() {

    this._apiS.getSessions({ meeting_key: this.meetingKey }).subscribe(data => {
      console.log('Sessions data:', data);
      this.sessions = data;
      if (this.sessions.length > 0) {
        this.selectedSession = this.sessions[0];
        this.loadWeatherData();
      }
    });


    this._apiD.getDrivers({ meeting_key: this.meetingKey }).subscribe(data => {
      console.log('Drivers data:', data);
      this.drivers = data;
    });
  }

  loadWeatherData() {
    const sessionKey = this.selectedSession?.session_key;
    if (sessionKey) {

      this._apiW.getWeather(sessionKey, this.meetingKey).subscribe(data => {
        if (data && data.length > 0) {
          this.weathers = data[0];
          this.weatherKeys = Object.keys(this.weathers).filter(key => !['meeting_key', 'session_key'].includes(key));
        }
      });
    }
  }

  formatWeatherKey(key: string): string {
    return this.weatherAliasMap[key] || key;
  }

  onSegmentChange(event: any) {
    if (this.segmentValue === 'weather') {
      this.loadWeatherData();
    }
  }
}
