import { Injectable } from '@angular/core';

@Injectable()
export class MidiConverterService {
  public frequencyToMidi(frequency: number): number {
    const midiNote = Math.round(69 + 12 * Math.log2(frequency / 440));
    const noteInFourthOctave = (midiNote % 12) + 60;
    return noteInFourthOctave;
  }
}
