import { Component } from '@angular/core'

import { HeroService } from './hero.service.js'

export const HeroListComponent =
Component({
  moduleId: 'playgrounds/hero-list/src/hero-list.component.js',
  selector: 'hero-list',
  templateUrl: 'hero-list.component.html',
  providers: [ HeroService ]
})
.Class({
  constructor: [HeroService, function HeroListComponent (heroService) {
    this.service = heroService
  }],

  ngOnInit () {
    this.heroes = this.service.getHeroes()
  },

  selectHero (hero) {
    this.selectedHero = (this.selectedHero === hero) ? null : hero
  }
})
