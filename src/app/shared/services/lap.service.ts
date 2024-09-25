import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Position } from '../interfaces/position';
import { Driver } from '../interfaces/driver';

@Injectable({
  providedIn: 'root'
})
export class LapService {
  constructor(private http: HttpClient) { }

  getPositions(meetingKey: number, param: number, sessionKey: number): Observable<Position[]> {
    return this.http.get<Position[]>(`/api/positions?meetingKey=${meetingKey}&param=${param}&sessionKey=${sessionKey}`);
  }

  updateChartData(selectedDrivers: Driver[], positions: Position[], selectedLaps: number[], getDriverFullName: (driverNumber: number) => string, getRandomColor: () => string) {
    if (selectedDrivers.length === 0) return { data: null, options: null, laps: [] };

    const driverNumbers = selectedDrivers.map(d => d.driver_number);

    const sortedPositions = positions
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

    const datasets = driverNumbers.map(driverNumber => {
      return {
        label: getDriverFullName(driverNumber),
        data: driverPositions
          .filter(p => p.driver_number === driverNumber && selectedLaps.includes(driverPositions.indexOf(p) + 1))
          .map(p => p.adjustedPosition),
        fill: false,
        borderColor: getRandomColor(),
        tension: 1
      };
    });

    const data = {
      labels: driverPositions
        .filter(p => selectedLaps.includes(driverPositions.indexOf(p) + 1))
        .map(p => new Date(p.date).toLocaleTimeString()),
      datasets: datasets
    };

    const laps = driverPositions.map((p, index) => index + 1);

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const options = {
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
            text: 'Tempo',
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

    return { data, options, laps };
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
