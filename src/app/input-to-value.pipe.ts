import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inputToValue'
})
export class InputToValuePipe implements PipeTransform {

  getInputValue = (event): number => {
    return parseInt(event['target'].value, 10);
  }

  transform(value: any): number {
    return value !== null ? this.getInputValue(value) : null;
  }

}
