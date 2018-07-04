import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactory, ComponentRef, Input, KeyValueChangeRecord, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Renderer2, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { take, takeUntil } from 'rxjs/operators';

// library imports
import { LoadableService } from '../services/loadable.service';
import { LoadableComponentInputs } from '../models/loadable-component-inputs.model';
import { LoadableComponentOutputs } from '../models/loadable-component-outputs.model';
import { Subject, merge, Observable } from 'rxjs';

@Component({
  selector: 'loadable-component',
  template: `
    <!-- allow transcluded content to show when loading -->
    <ng-container *ngIf="isLoading">
      <ng-content></ng-content>
    </ng-container>
    <!-- element where we insert our dynamic loadable component -->
    <div #loadableComponentOutlet></div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadableComponent implements OnDestroy {

  /**
   *  view ref where we insert our dynamic loadable component
   */
  @ViewChild('loadableComponentOutlet', { read: ViewContainerRef }) loadableComponentOutlet: ViewContainerRef;

  /**
   * id of component in loadable manifest to load & render
   */
  @Input() componentId: string = 'DashboardGaugeComponent';

  /**
   * event to load component (allows external control over when to actually load & render component)
   */
  @Input()
  set loadComponent(loadComponent: boolean) {
    if (loadComponent && !this._hasLoadedComponentChunk) this.loadComponentChunk();
  }

  /**
   * set component inputs
   */
  @Input()
  set componentInputs(componentInputs: LoadableComponentInputs) {
    // set inputs
    this._componentInputs = componentInputs;
    // check inputs for changes
    this.checkForInputChanges();
  }
  get componentInputs(): LoadableComponentInputs {
    return this._componentInputs;
  }

  /**
   *  capture component outputs
   */
  @Input() componentOutputs: LoadableComponentOutputs = {};

  /** 
   * is currently loading dynamic component
   */
  isLoading: boolean = false;

  /**
   * component unsubscribe
   */
  private _unsubscribed$: Subject<boolean> = new Subject();
  /**
   * dynamic component changed
   */
  private _changedComponent$: Subject<boolean> = new Subject();
  /**
   * unsubscribe from outputs
   */
  private _outputUnsubscribed$: Observable<boolean>;

  /** 
   * dynamic component inputs
   */
  private _componentInputs: LoadableComponentInputs = {};
  /** 
   * current dynamic component ref
   */
  private _componentRef: ComponentRef<any>;
  /** 
   * flag for whether we already have the component chunk loaded
   */
  private _hasLoadedComponentChunk: boolean = false;
  /** 
   * differ for component inputs
   */
  private _componentInputsDiffer: KeyValueDiffer<any, any>;

  constructor(
    private _loadableService: LoadableService,
    private _keyValueDiffers: KeyValueDiffers,
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2
  ) {

    // setup our differ function
    this._componentInputsDiffer = this._keyValueDiffers.find(this.componentInputs)
      .create();

  }

  ngOnInit(): void {
    // create actions for when we change dynamic component
    this._changedComponent$
      .pipe(takeUntil(this._unsubscribed$))
      .subscribe(() => {
        // do a change detection cycle
        this._changeDetectorRef.detectChanges();
        this._componentRef.changeDetectorRef.detectChanges();
      })
    // unsubscribe from dynamic outputs when we change or destroy component
    this._outputUnsubscribed$ = merge(this._unsubscribed$, this._changedComponent$);
  }

  ngOnDestroy(): void {
    // unsubscribe on component teardown
    this._unsubscribed$.next(false);
    this._unsubscribed$.complete();
  }

  /**
   * load the loadable component chunk & then render
   */
  private loadComponentChunk(): void {
    // set component loading
    this.isLoading = true;
    // dynamically load a component as a module chunk
    this._loadableService
      .getComponentFactory<any>(this.componentId)
      .pipe(take(1))
      .subscribe((componentFactory: ComponentFactory<any>) => {
        // create new dynamic component
        this.createComponent(componentFactory);

        // set loading flags
        this._hasLoadedComponentChunk = true;
        this.isLoading = false;

        // emit component change
        this._changedComponent$.next(true);
      });
  }

  /**
   * create & render a dynamic component
   */
  private createComponent(componentFactory: ComponentFactory<any>) {
    // create component & set the current component ref
    this._componentRef = this.loadableComponentOutlet.createComponent(componentFactory);

    // add fadein to component style
    this._renderer.addClass(this._componentRef.location.nativeElement, 'wrc-animation--content--fadein');

    // set component inputs
    this.setInputs();

    // set component outputs
    this.setOutputs();
  }

  /**
   * set inputs for loadable component using passed in input values
   */
  private setInputs(): void {
    const inputKeys: Array<string> = Object.keys(this.componentInputs);
    inputKeys.map((key: string) => this._componentRef.instance[key] = this.componentInputs[key]);
  }

  /**
   * set outputs for loadable component using passed in output functions
   */
  private setOutputs(): void {
    const outputKeys: Array<string> = Object.keys(this.componentOutputs);
    outputKeys.map((key: string) => this._componentRef.instance[key]
      .pipe(takeUntil(this._outputUnsubscribed$))
      .subscribe((value: any) => this.componentOutputs[key](value)));
  }

  /**
   * do a diff over inputs to check for any changes (allows us to propagate inputs to dyanmic component)
   */
  private checkForInputChanges(): void {
    // check inbound component inputs for changes
    const changes: KeyValueChanges<any, any> = this._componentInputsDiffer.diff(this.componentInputs);

    // pass any changes down to component
    if (changes && this._hasLoadedComponentChunk) {
      // added an input
      changes.forEachAddedItem((record: KeyValueChangeRecord<any, any>) => {
        if (record.currentValue && this._componentRef.instance[record.key]) this._componentRef.instance[record.key] = record.currentValue;
      });
      // changed an input value
      changes.forEachChangedItem((record: KeyValueChangeRecord<any, any>) => {
        if (record.currentValue && this._componentRef.instance[record.key]) this._componentRef.instance[record.key] = record.currentValue;
      });
      // removed an input value (this shouldnt happen... but will handle it)
      changes.forEachRemovedItem((record: KeyValueChangeRecord<any, any>) => {
        if (this._componentRef.instance[record.key]) this._componentRef.instance[record.key] = null;
      });
      // run change detection
      this._componentRef.changeDetectorRef.detectChanges();
    }
  }

}
