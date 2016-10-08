import { Class } from '@angular/core'

import { Logger } from './logger.service'
import { Hero } from './hero'

const HEROES = [
  new Hero('Windstorm', 'Weather mastery'),
  new Hero('Mr. Nice', 'Killing them with kindness'),
  new Hero('Magneta', 'Manipulates metalic objects')
]

export const BackendService = Class({
  constructor: [
    Logger,
    function BackendService (logger) {
      this.logger = logger
    }
  ],

  getAll (type) {
    if (type === Hero) {
      // TODO get from the database
      return Promise.resolve(HEROES)
    }
    let err = new Error('Cannot get object of this type')
    this.logger.error(err)
    throw err
  }
})
