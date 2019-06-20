import {Injectable, OnDestroy} from '@angular/core';
import {combineLatest, merge, NEVER, Observable, Subject, timer} from 'rxjs';
import {map, mapTo, scan, shareReplay, startWith, switchMap, takeUntil, tap, withLatestFrom} from 'rxjs/operators';
import {CounterStateKeys} from '../counter-state-keys.enum';
import {CounterState} from '../counter-state.interface';
import {INITIAL_COUNTER_STATE} from '../initial-counter-state';
import {inputToValue} from '../operators/inputToValue';
import {selectDistinctState} from '../operators/selectDistinctState';
import {Command} from './command.interface';

@Injectable({
  providedIn: 'root'
})
export class CounterFacadeService implements OnDestroy {

  // = CONSTANTS ============================================================
  initialCounterState: CounterState = INITIAL_COUNTER_STATE;
  ngOnDestroySubject = new Subject();

  // = BASE OBSERVABLES  ====================================================
  // == SOURCE OBSERVABLES ==================================================
  // === INTERACTION OBSERVABLES ============================================
  btnStart: Subject<Event> = new Subject<Event>();
  btnPause: Subject<Event> = new Subject<Event>();
  btnUp: Subject<Event> = new Subject<Event>();
  btnDown: Subject<Event> = new Subject<Event>();
  btnSetTo: Subject<Event> = new Subject<Event>();
  inputSetTo: Subject<any> = new Subject<any>();
  inputTickSpeed: Subject<Event> = new Subject<Event>();
  inputCountDiff: Subject<Event> = new Subject<Event>();

  lastSetToFromButtonClick = this.btnSetTo
    .pipe(
      withLatestFrom(
        this.inputSetTo.pipe(inputToValue()),
        (btnSetTo, inputSetTo: number) => {
          return inputSetTo;
        }));

  // === STATE OBSERVABLES ==================================================
  programmaticCommandSubject: Subject<Command> = new Subject();
  counterCommands: Observable<Command> = merge(
    this.btnStart.pipe(mapTo({isTicking: true})),
    this.btnPause.pipe(mapTo({isTicking: false})),
    this.lastSetToFromButtonClick.pipe(map(n => ({count: n}))),
    this.btnUp.pipe(mapTo({ countUp: true })),
    this.btnDown.pipe(mapTo({ countUp: false })),
    this.inputTickSpeed.pipe(inputToValue(), map(n => ({ tickSpeed: n }))),
    this.inputCountDiff.pipe(inputToValue(), map(n => ({countDiff: n}))),
    this.programmaticCommandSubject.asObservable()
  );
  counterState: Observable<CounterState> = this.counterCommands
    .pipe(
      startWith(this.initialCounterState),
      scan((counterState: CounterState, command): CounterState => ({...counterState, ...command})),
      shareReplay(1)
    );

  // == INTERMEDIATE OBSERVABLES ============================================

  // = SIDE EFFECTS =========================================================
  isTicking = this.counterState.pipe(selectDistinctState<CounterState, boolean>(CounterStateKeys.isTicking));
  tickSpeed = this.counterState.pipe(selectDistinctState<CounterState, boolean>(CounterStateKeys.tickSpeed));

  intervalTick$ =  combineLatest(this.isTicking, this.tickSpeed)
    .pipe(
      switchMap(([isTicking, tickSpeed]) => {
        return isTicking ? timer(0, tickSpeed) : NEVER;
      })
    );

  // = SIDE EFFECTS =========================================================
  // == BACKGROUND PROCESSES
  updateCounterFromTick = this.intervalTick$
    .pipe(
      withLatestFrom(this.counterState, (_, s) => s),
      tap(({count, countDiff, countUp}) => {
        const diff = countDiff * (countUp ? 1 : -1);
        this.programmaticCommandSubject.next({ count: count + diff });
      })
    );

  constructor() {

    // = SUBSCRIPTION =========================================================
    merge(
      this.updateCounterFromTick,
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
