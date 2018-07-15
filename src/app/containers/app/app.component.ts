import { Component } from '@angular/core';
import { LoadableComponentIds } from '../../app-loadable.manifests';
import { Observable, of as ObservableOf } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <div class="app--container">
      <!-- content container -->
      <div class="app--container--inner">

        <!-- action buttons -->
        <div class="app--buttons">
          <button (click)="onClick()">Load</button>
        </div>

        <!-- emoji cards -->
        <div class="app--emojis">
          <loadable-component [componentId]="STAR_STRUCK_FACE_COMPONENT_ID" [loadComponent]="loadStarStruckFaceComponent"  class="app--emoji--component">
            <app-placeholder-emoji [isLoading]="loadStarStruckFaceComponent"></app-placeholder-emoji>
          </loadable-component>
          <loadable-component [componentId]="THINKING_FACE_COMPONENT_ID" [loadComponent]="loadThinkingFaceComponent"  class="app--emoji--component">
            <app-placeholder-emoji [isLoading]="loadThinkingFaceComponent"></app-placeholder-emoji>
          </loadable-component>
          <loadable-component [componentId]="UPSIDE_DOWN_FACE_COMPONENT_ID" [loadComponent]="loadUpsideDownFaceComponent"  class="app--emoji--component">
            <app-placeholder-emoji [isLoading]="loadUpsideDownFaceComponent"></app-placeholder-emoji>
          </loadable-component>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* layout containers */
    .app--container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .app--container--inner {
      display: flex;
      flex-direction: column;
    }
    .app--buttons {

    }
    .app--emojis {
      display: flex;
      margin-top: 1rem;
    }
    .app--emoji--component {
      display: flex;
    }

  `]
})
export class AppComponent {

  // loadable component ids
  STAR_STRUCK_FACE_COMPONENT_ID = LoadableComponentIds.STAR_STRUCK_FACE;
  THINKING_FACE_COMPONENT_ID = LoadableComponentIds.THINKING_FACE;
  UPSIDE_DOWN_FACE_COMPONENT_ID = LoadableComponentIds.UPSIDE_DOWN_FACE;

  // flags to load components
  loadStarStruckFaceComponent: boolean = false;
  loadThinkingFaceComponent: boolean = false;
  loadUpsideDownFaceComponent: boolean = false;

  ngOnInit(): void {
  }

  onClick(): void {
    if (!this.loadStarStruckFaceComponent) this.loadStarStruckFaceComponent = true;
    else if (!this.loadThinkingFaceComponent) this.loadThinkingFaceComponent = true;
    else if (!this.loadUpsideDownFaceComponent) this.loadUpsideDownFaceComponent = true;
  }

}