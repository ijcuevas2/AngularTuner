import { Injectable } from '@angular/core';

@Injectable()
export class PitchDetectorService {
  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private dataArray!: Uint8Array;
  private volumeThreshold: number = 0.03;

  constructor() {
    // this.audioContext = new AudioContext();
    // this.analyser = this.audioContext.createAnalyser();
    // this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  public initialize(): void {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  public async getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  public async requestMicrophonePermissions(): Promise<void> {
    try {
      await this.getUserMedia({ audio: true, video: false });
    } catch (err) {
      console.error('Error requesting microphone permissions:', err);
    }
  }

  public async setupUserMedia(): Promise<void> {
    try {
      this.initialize();
      const stream: MediaStream = await this.getUserMedia({ audio: true, video: false });
      const source: MediaStreamAudioSourceNode = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
    } catch (err) {
      console.error('Error setting up user media:', err);
    }
  }

  public detectPitch(): number {
    this.analyser.getByteTimeDomainData(this.dataArray);

    // Convert the data array to a float array
    const floatArray = new Float32Array(this.dataArray.length);
    for (let i = 0; i < this.dataArray.length; i++) {
      floatArray[i] = (this.dataArray[i] - 128) / 128;
    }

    // Calculate the root mean square (RMS) amplitude of the signal
    let sumOfSquares = 0;
    for (let i = 0; i < floatArray.length; i++) {
      sumOfSquares += floatArray[i] * floatArray[i];
    }
    const rmsAmplitude = Math.sqrt(sumOfSquares / floatArray.length);

    // Check if the RMS amplitude is below the volume threshold
    if (rmsAmplitude < this.volumeThreshold) {
      return 0;
    }

    // Calculate the autocorrelation of the data array
    const nsdf = new Float32Array(floatArray.length);
    for (let tau = 0; tau < floatArray.length; tau++) {
      let acf = 0;
      let divisorM = 0;
      for (let i = 0; i < floatArray.length - tau; i++) {
        acf += floatArray[i] * floatArray[i + tau];
        divisorM += floatArray[i] * floatArray[i] + floatArray[i + tau] * floatArray[i + tau];
      }
      nsdf[tau] = 2 * acf / divisorM;
    }

    // Find the key maximums of the nsdf array
    const keyMaximums: number[] = [];
    let positive = false;
    let maximumPosition = -1;
    for (let i = 1; i < nsdf.length; i++) {
      if (positive) {
        if (nsdf[i] > nsdf[i - 1]) {
          maximumPosition = i;
        } else if (nsdf[i] < nsdf[maximumPosition]) {
          keyMaximums.push(maximumPosition);
          positive = false;
        }
      } else if (nsdf[i] > nsdf[i - 1]) {
        maximumPosition = i;
        positive = true;
      }
    }

    // Find the highest key maximum
    let highestKeyMaximumIndex = -1;
    let highestKeyMaximumValue = Number.NEGATIVE_INFINITY;
    for (const keyMaximum of keyMaximums) {
      if (nsdf[keyMaximum] > highestKeyMaximumValue) {
        highestKeyMaximumIndex = keyMaximum;
        highestKeyMaximumValue = nsdf[keyMaximum];
      }
    }

    // Calculate the pitch based on the highest key maximum
    let pitch: number;
    if (highestKeyMaximumIndex !== -1) {
      const x0 = highestKeyMaximumIndex > 0 ? highestKeyMaximumIndex -1 : highestKeyMaximumIndex;
      const x2 =
        highestKeyMaximumIndex < nsdf.length -1 ? highestKeyMaximumIndex +1 : highestKeyMaximumIndex;
      const x1 = highestKeyMaximumIndex;

      const y0 = nsdf[x0];
      const y1 = nsdf[x1];
      const y2 = nsdf[x2];

      const interpolatedTau =
        x1 + (y2 - y0) / (2 * y1 - y2 - y0) /2;

      pitch = this.roundNumber(this.audioContext.sampleRate / interpolatedTau);

      return pitch;
    }

    return 0;
  }

  public roundNumber(num: number): number {
    try {
      return Math.round(num);
    } catch (error) {
      return 0;
    }
  }
}
