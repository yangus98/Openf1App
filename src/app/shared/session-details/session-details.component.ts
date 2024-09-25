import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DriverService } from '../services/api-driver.service';
import { WeatherService } from '../services/api-weather.service';
import { PositionService } from '../services/api-position.service';
import { Driver } from '../interfaces/driver';
import { Weather } from '../interfaces/weather';
import { Position } from '../interfaces/position';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonImg, IonItem, IonList, IonButtons, IonBackButton, IonSegment, IonSegmentButton, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonImg, IonItem, IonList, IonButtons, IonBackButton, IonSegment, IonSegmentButton,
    CommonModule, FormsModule, ChartModule, IonSelect, IonSelectOption
  ]
})
export class SessionDetailsComponent implements OnInit {
  drivers: Driver[] = [];
  weather: Weather | null = null;
  positions: Position[] = [];
  uniquePositions: Position[] = [];
  segmentValue: 'charts' | 'drivers' | 'weather' | 'positions' = 'drivers';
  selectedDrivers: Driver[] = [];
  selectedLaps: number[] = [];
  data: any;
  options: any;
  laps: number[] = Array.from({ length: 20 }, (_, i) => i + 1);

  private _apiD = inject(DriverService);
  private _apiW = inject(WeatherService);
  private _apiP = inject(PositionService);
  private _activatedRoute = inject(ActivatedRoute);

  sessionKey: any;
  meetingKey: any;

  ngOnInit() {
    this.sessionKey = +this._activatedRoute.snapshot.params['session_key'];
    this.meetingKey = +this._activatedRoute.snapshot.params['meeting_key'];

    this.loadDrivers();
    this.loadWeather();
    this.loadPositions();
  }

  loadDrivers() {
    this._apiD.getDrivers({ session_key: this.sessionKey }).subscribe(data => {
      this.drivers = data;
    });
  }

  loadWeather() {
    this._apiW.getWeather(this.sessionKey, this.meetingKey).subscribe(data => {
      if (data && data.length > 0) {
        this.weather = data.sort((a, b) => new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime())[0];
      }
    });
  }

  loadPositions() {
    this._apiP.getPositions({ session_key: this.sessionKey, meeting_key: this.meetingKey }).subscribe(data => {

      const sortedPositions = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      this.uniquePositions = sortedPositions.filter((position, index, self) =>
        index === self.findIndex((p) => p.driver_number === position.driver_number)
      );

      this.uniquePositions = this.uniquePositions.sort((a, b) => a.position - b.position);

      this.positions = sortedPositions;
    });
  }

  getDriverFullName(driverNumber: number): string {
    const driver = this.drivers.find(d => d.driver_number === driverNumber);
    return driver ? driver.full_name : 'Unknown Driver';
  }

  onSegmentChange(event: any) {
    if (this.segmentValue === 'charts') {
      this.updateChartData();
    }
  }

  onDriverSelectionChange(selectedDriverNumbers: number[]) {
    this.selectedDrivers = this.drivers.filter(driver => selectedDriverNumbers.includes(driver.driver_number));
    this.updateChartData();
  }

  onLapsSelectionChange(selectedLaps: number[]) {
    this.selectedLaps = selectedLaps;
    this.updateChartData();
  }

  updateChartData() {
    if (this.selectedDrivers.length === 0) return;

    const driverNumbers = this.selectedDrivers.map(d => d.driver_number);

    const sortedPositions = this.positions
      .filter(p => driverNumbers.includes(p.driver_number))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const initialPositions = sortedPositions.reduce((acc, pos) => {
      if (!acc[pos.driver_number]) {
        acc[pos.driver_number] = pos.position;
      }
      return acc;
    }, {} as { [driverNumber: number]: number });

    const driverPositions = sortedPositions.map(p => ({
      ...p,
      adjustedPosition: p.position
    }));

    const maxLaps = Math.max(...this.selectedDrivers.map(driver => {
      return driverPositions.filter(p => p.driver_number === driver.driver_number).length;
    }));

    const datasets = driverNumbers.map(driverNumber => {
      const driverData = driverPositions
        .filter(p => p.driver_number === driverNumber)
        .map(p => p.adjustedPosition);

      while (driverData.length < maxLaps) {
        driverData.push(driverData[driverData.length - 1]);
      }

      return {
        label: this.getDriverFullName(driverNumber),
        data: driverData,
        fill: false,
        borderColor: this.getRandomColor(),
        tension: 0
      };
    });

    this.data = {
      labels: Array.from({ length: maxLaps }, (_, i) => i + 1),
      datasets: datasets
    };

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Giri',
            color: textColor
          },
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Posizione',
            color: textColor
          },
          ticks: {
            color: textColorSecondary,
            stepSize: 1,
            beginAtZero: true,
            max: 20
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
