import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'

import { AppComponent } from './app.component.js'
import { HeroDetailComponent } from './hero-detail.component.js'
import { HeroListComponent } from './hero-list.component.js'
import { SalesTaxComponent } from './sales-tax.component.js'
import { HeroService } from './hero.service.js'
import { BackendService } from './backend.service.js'
import { Logger } from './logger.service.js'

export const HeroListAppModule = NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    HeroDetailComponent,
    HeroListComponent,
    SalesTaxComponent
  ],
  providers: [
    BackendService,
    HeroService,
    Logger
  ],
  bootstrap: [ AppComponent ]
})
.Class({ constructor: [function HeroListAppModule () { }] })
