import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PitchDetectorComponent } from './pitch-detector/pitch-detector.component';
import { PitchDetectorService } from './services/pitch-detector.service';
import { MidiConverterService } from './services/midi-converter.service';

@NgModule({
  declarations: [
    AppComponent,
    PitchDetectorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [PitchDetectorService, MidiConverterService],
  bootstrap: [AppComponent]
})
export class AppModule { }
