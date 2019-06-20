import {Injectable, OnDestroy} from '@angular/core';
import {merge, NEVER, Observable, Subject, timer} from 'rxjs';
import {map, mapTo, switchMap, takeUntil, tap, withLatestFrom} from 'rxjs/operators';
import {CounterState} from '../counter-state.interface';
import {INITIAL_COUNTER_STATE} from '../initial-counter-state';
import {inputToValue} from '../operators/inputToValue';
import {Command} from './command.interface';

@Injectable({
  providedIn: 'root'
})
export class CounterFacadeService implements OnDestroy {

  // = CONSTANTS ============================================================
  initialCounterState: CounterState = INITIAL_COUNTER_STATE;
  ngOnDestroySubject = new Subject();

  counterState = {count: 0};

  // = BASE OBSERVABLES  ====================================================
  // == SOURCE OBSERVABLES ==================================================
  // === INTERACTION OBSERVABLES ============================================
  btnStart: Subject<Event> = new Subject<Event>();
  btnPause: Subject<Event> = new Subject<Event>();
  btnSetTo: Subject<Event> = new Subject<Event>();
  inputSetTo: Subject<any> = new Subject<any>();
  lastSetToFromButtonClick = this.btnSetTo
    .pipe(
      withLatestFrom(
        this.inputSetTo.pipe(inputToValue()),
        (btnSetTo, inputSetTo: number) => {
          return inputSetTo;
        }));

  // === STATE OBSERVABLES ==================================================
  counterCommands$: Observable<Command> = merge(
    this.btnStart.pipe(mapTo({ isTicking: true })),
    this.btnPause.pipe(mapTo({ isTicking: false })),
    this.lastSetToFromButtonClick.pipe(map(n => ({ count: n })))
  );
  // == INTERMEDIATE OBSERVABLES ============================================

  // = SIDE EFFECTS =========================================================
  updateCounterFromTick = merge(
    this.btnStart.pipe(mapTo(true)),
    this.btnPause.pipe(mapTo(false))
  )
    .pipe(
      switchMap((isTicking) => {
        return isTicking ? timer(0, this.initialCounterState.tickSpeed) : NEVER;
      }),
      tap((_) => {
        this.counterState = {...this.counterState, count: this.counterState.count + this.initialCounterState.countDiff};
      })
    );

  setCountFromSetToClick = this.lastSetToFromButtonClick.pipe(
    tap((next) => {
      this.counterState = {...this.counterState, count: next};
    })
  );

  constructor() {
    this.counterCommands$
      .subscribe(console.log);

    // = SUBSCRIPTION =========================================================
    merge(
      this.updateCounterFromTick,
      this.setCountFromSetToClick
    )
      .pipe(
        takeUntil(
          this.ngOnDestroySubject.asObservable()
        )
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.ngOnDestroySubject.next(true);
  }

}
