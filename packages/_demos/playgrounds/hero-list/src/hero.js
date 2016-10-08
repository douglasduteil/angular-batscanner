let nextId = 1

export class Hero {
  constructor (name, power) {
    this.name = name
    this.power = power
    this.id = nextId++
  }
}
