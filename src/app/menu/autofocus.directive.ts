import { Directive, ElementRef } from "@angular/core";

@Directive({
  selector: "[appAutofocus]"
})
export class AutofocusDirective {

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    setTimeout(() => this.elementRef.nativeElement.focus());
  }
}