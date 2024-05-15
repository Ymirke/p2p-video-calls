class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.sampleBlockLength = 320; // 640 bytes / 2 bytes per sample
    this.sampleBuffer = new Int16Array(this.sampleBlockLength);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const numberOfChannels = Math.min(input.length, output.length);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      if (input[channel] && output[channel]) {
        output[channel].set(input[channel]);
      }
    }

    if (input[0]) {
      for (let i = 0; i < input[0].length; i++) {
        // Convert float32 to int16
        const int16Sample = Math.max(-1, Math.min(1, input[0][i])) * 32767;
        this.sampleBuffer[this.bufferIndex++] = int16Sample;

        // Check if buffer is full
        if (this.bufferIndex === this.sampleBlockLength) {
          // Send the buffer and reset the index
          this.port.postMessage(this.sampleBuffer);
          this.bufferIndex = 0;
        }
      }
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
