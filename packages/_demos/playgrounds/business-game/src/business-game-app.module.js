//

import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import {
  Component,
  NgModule
} from '@angular/core'

import {Observable} from 'rxjs/Observable'
import {Subject} from 'rxjs/Subject'

function Player () {
  this.money$ = (new Subject())
    .throttleTime(250)
    .scan((memo, val) => memo + val)
}

const PlayerBigMoneyComponent =
Component({
  selector: 'player-big-money',
  template: `$ {{player.money$ | async}}`
})
.Class({
  constructor: [Player, function PlayerBigMoneyComponent (player) {
    this.player = player
  }]
})

const MainHeaderComponent =
Component({
  selector: 'main-header',
  template: `
  <player-big-money></player-big-money>
  `
})
.Class({
  constructor: [function MainHeaderComponent () {}]
})

const BusinessGameAppComponent =
Component({
  selector: 'business-game-app',
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
    }
  `],
  template: `
  <main-header></main-header>

  <button (click)="onUpgrade()">Upgrade</button>
  `
})
.Class({
  constructor: [Player, function BusinessGameAppComponent (player) {
    document.querySelector('body > bizg-loader').style.opacity = 0

    this.upgrade$ = new Subject()
    this.price = 1
    this.loop$ = Observable.interval(300)
      .map(() => this.price)
      .subscribe((val) => { player.money$.next(val) })
  }],

  onUpgrade () {
    this.upgrade$.next()
    this.price += 10
  },

  ngOnDestroy () {
    this.loop$.dispose()
  }
})

export const BusinessGameAppModule = NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
  declarations: [
    BusinessGameAppComponent,
    MainHeaderComponent,
    PlayerBigMoneyComponent
    // HeroListComponent,
    // SalesTaxComponent
  ],
  providers: [
    Player
    // HeroService,
    // Logger
  ],
  bootstrap: [ BusinessGameAppComponent ]
})
.Class({ constructor: [function BusinessGameAppModule () { }] })
