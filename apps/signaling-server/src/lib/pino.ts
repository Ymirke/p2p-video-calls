import pino from "pino";
import pretty from "pino-pretty";

// Create a stream where the logs will be written
const prettyStream = pretty({
  colorize: true, // Enables log colorization
  ignore: "pid,hostname", // Ignores specific fields from the log output
  // removes timestamp:
  customPrettifiers: {
    time: (x) => "",
  },
});

// Pass the stream to pino
const logger = pino(prettyStream);

export { logger };
