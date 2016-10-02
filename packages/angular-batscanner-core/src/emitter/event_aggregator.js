//

import {
  __core_private__ as ngCorePrivateParts // eslint-disable-line camelcase
} from '@angular/core'

import {Observable} from 'rxjs/Observable'
import {Subject} from 'rxjs/Subject'

//

const { LifecycleHooks } = ngCorePrivateParts

//

export function BatscannerEventAggregator () {
  this.aggregateUntill = aggregateUntill
}

//

function aggregateUntill (source, componentToken) {
  // HACK(@douglasduteil): source filter triggered before the buffer problem
  //
  // Basic implementation would suggest to directly listen to the source
  // without wrapping it in another Observable. But it's causing problem of
  // notification ordnance. Indeed, if we subscribe to the source here, the
  // first puller will be the closingNotifier$ and not the buffer$ that will
  // start pulling after the client subscribe to the source. Thus the
  // closingNotifier$ end the buffer$ before it has the chance to get the last
  // event...
  //
  // We get :
  //
  // ```
  //           source : ---A---B---C---X------------>
  // closingNotifier$ : ---------------X------------>
  //          buffer$ : ---------------[A, B, C]---->
  // ```
  //
  // Instead of:
  //
  // ```
  //           source : ---A---B---C---X------------>
  //          buffer$ : ---------------[A, B, C, X]->
  // closingNotifier$ : ---------------X------------>
  // ```

  const hasCheckedTheRootComponent =
    rootComponentAfterViewChecked.bind(null, componentToken)
  let latestComponentState = {}

  return Observable.create(aggregationObservable)

  //

  function aggregationObservable (observer) {
    // Manually on next the buffer at the end of each RootComponent check
    const everyRootComponentAfterViewChecked = new Subject()

    // Must be the first to subscribe to source to buffer any incoming events
    const buffer$ = source
      .map(function (event) {
        const latestState = latestComponentState[event.id] || latestComponentState[event.id + 1]
        if (latestState) {
          latestState.endTime = event.timestamp
          latestState.duration = latestState.startTime - event.timestamp
        }
        event.startTime = event.timestamp

        latestComponentState[event.id] = event

        return event
      })
      .buffer(everyRootComponentAfterViewChecked)
      .do(() => { latestComponentState = {} })
      .subscribe((e) => observer.next(e))

    // Listen to the source for AfterViewChecked AFTER buffering stuff
    const closingNotifier$ = source
      .filter((e) => hasCheckedTheRootComponent(e))
      .subscribe(() => everyRootComponentAfterViewChecked.next())

    return function () {
      observer.complete()
      buffer$.dispose()
      closingNotifier$.dispose()
    }
  }
}

function rootComponentAfterViewChecked (root, event) {
  const {type, target} = event
  const isTheRootComponent = target === root
  const isDoCheckEventType = LifecycleHooks[type] === LifecycleHooks.AfterViewChecked
  return isTheRootComponent && isDoCheckEventType
}
