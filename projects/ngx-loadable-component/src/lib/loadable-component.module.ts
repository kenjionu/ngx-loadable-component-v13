
import {
  ANALYZE_FOR_ENTRY_COMPONENTS,
  ModuleWithProviders,
  NgModule,
  NgModuleFactoryLoader,
  SystemJsNgModuleLoader,
  Type
} from '@angular/core';
import { ROUTES } from '@angular/router';
import { CommonModule } from '@angular/common';

// components
import { LoadableComponent } from './components/loadable.component';

// services
import { LoadableService } from './services/loadable.service';

// models
import { LOADABLE_COMPONENT, LOADABLE_MANIFESTS, LoadableManifest } from './models/loadable-manifest.model';

@NgModule({
  imports: [CommonModule],
  declarations: [LoadableComponent],
  exports: [LoadableComponent]
})
export class LoadableComponentModule {

  /**
   * module root instantiation
   * (used to setup injectable providers used in dynamic component load/render)
   */
  static forRoot(manifests: Array<LoadableManifest>): ModuleWithProviders {
    return {
      ngModule: LoadableComponentModule,
      providers: [
        LoadableService,
        { provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader },
        // provider for Angular CLI to analyze
        { provide: ROUTES, useValue: manifests, multi: true },
        // provider for DynamicComponentLoader to analyze
        { provide: LOADABLE_MANIFESTS, useValue: manifests }
      ]
    };
  }

  /**
   * module child instantiation
   * (used by a loadable component module to register themselves as loadable)
   */
  static forChild(component: Type<any>): ModuleWithProviders {
    return {
      ngModule: LoadableComponentModule,
      providers: [
        { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: component, multi: true },
        // provider for @angular/router to parse
        { provide: ROUTES, useValue: [], multi: true },
        // provider for DynamicComponentLoader to analyze
        { provide: LOADABLE_COMPONENT, useValue: component }
      ]
    };
  }

}
