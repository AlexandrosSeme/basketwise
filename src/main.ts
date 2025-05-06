import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  ...appConfig,

  providers: [
    ...(appConfig.providers ?? []),

    importProvidersFrom(FontAwesomeModule),


    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [FaIconLibrary],
      useFactory: (library: FaIconLibrary) => {
        return () => {

          library.addIconPacks(fas);


        };
      }
    }
  ]
})
  .catch(err => console.error(err));
