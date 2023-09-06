import { Component, OnInit } from '@angular/core';
import { PitchDetectorService } from '../services/pitch-detector.service';

@Component({
  selector: 'app-pitch-detector',
  templateUrl: './pitch-detector.component.html',
  styles: []
})
export class PitchDetectorComponent implements OnInit {
  public pitch: number = 0;
  public angle: number = -45;
  public isListening: boolean = false;
  private animationFrameId: number | null = null;

  constructor(private pitchDetectorService: PitchDetectorService) {}

  public ngOnInit(): void {}

  public async requestPermissions(): Promise<void> {
    await this.pitchDetectorService.requestMicrophonePermissions();
    await this.pitchDetectorService.setupUserMedia();
  }

  public toggleListening(): void {
    this.isListening = !this.isListening;
    if (this.isListening) {
      this.requestPermissions().then(() => {
        this.startListening();
      });
    } else {
      this.stopListening();
    }
  }

  public startListening(): void {
    const updatePitch = () => {
      const detectedPitch = this.pitchDetectorService.detectPitch();
      if (detectedPitch !== null) {
        this.pitch = detectedPitch;
        // Update the angle of the needle based on the detected pitch value
        this.angle = this.getAngleForPitch(detectedPitch);
      }
      this.animationFrameId = requestAnimationFrame(updatePitch);
    };
    updatePitch();
  }

  public stopListening(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private getAngleForPitch(pitch: number): number {
    // Calculate the angle of the needle based on the pitch value
    // This is just an example, you can adjust the calculation to fit your needs
    const minAngle = -45;
    const maxAngle = 45;
    const minPitch = 220; // A3
    const maxPitch = 440; // A4
    const clampedPitch = Math.max(minPitch, Math.min(maxPitch, pitch));
    const normalizedPitch = (clampedPitch - minPitch) / (maxPitch - minPitch);
    return minAngle + normalizedPitch * (maxAngle - minAngle);
  }
}
