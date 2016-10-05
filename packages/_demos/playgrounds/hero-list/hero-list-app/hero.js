let nextId = 1;

export class Hero {
  id: number;
  constructor(
    public name: string,
    public power?: string) {
      this.id = nextId++;
    }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/