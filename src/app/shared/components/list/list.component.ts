import { Component, Input, OnInit } from '@angular/core';
import {IonItem, IonLabel, IonList, IonImg } from '@ionic/angular/standalone';
import { Driver } from '../../interfaces/driver';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: true,
  imports:[IonImg,IonItem, IonLabel, IonList],
})
export class ListComponent   implements OnInit{

  @Input() driversInput:Driver[] = [];

  constructor() { }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}
