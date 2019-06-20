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

  counterStateOld = {count: 0};

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
  programmaticCommandSubject: Subject<Command> = new Subject();
  counterCommands: Observable<Command> = merge(
    this.btnStart.pipe(mapTo({isTicking: true})),
    this.btnPause.pipe(mapTo({isTicking: false})),
    this.lastSetToFromButtonClick.pipe(map(n => ({count: n}))),
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
  isTicking$ = this.counterState.pipe(selectDistinctState<CounterState, boolean>(CounterStateKeys.isTicking));

  intervalTick$ =  this.isTicking$
    .pipe(
      switchMap((isTicking) => {
        return isTicking ? timer(0, this.initialCounterState.tickSpeed) : NEVER;
      })
    );

  // = SIDE EFFECTS =========================================================
  // == BACKGROUND PROCESSES
  updateCounterFromTick = this.intervalTick$
    .pipe(
      withLatestFrom(this.counterState, (_, s) => s),
      tap((state) => {
        this.programmaticCommandSubject.next({ count: state.count + state.countDiff });
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
