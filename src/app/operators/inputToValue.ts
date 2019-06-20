import {map} from 'rxjs/operators';

export function inputToValue(defaultValue?: number = null) {
  return (observable) => {
    return observable.pipe(
      map((event): number => {
        const parsed = event ? parseInt(event['target'].value, 10) : defaultValue;
        return (parsed === 0 || parsed) ? parsed : defaultValue;
      })
    );
  };
}
