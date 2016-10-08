import { Class as InjectableClass } from '@angular/core'

import { Hero } from './hero'
import { BackendService } from './backend.service'
import { Logger } from './logger.service'

export const HeroService = InjectableClass({

  constructor: [BackendService, Logger, function HeroService (backend, logger) {
    this.heroes = []
    this.backend = backend
    this.logger = logger
  }],

  getHeroes () {
    this.backend.getAll(Hero).then((heroes) => {
      this.logger.log(`Fetched ${heroes.length} heroes.`)
      this.heroes.push(...heroes) // fill cache
    })
    return this.heroes
  }
})
