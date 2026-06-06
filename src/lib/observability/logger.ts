type LogLevel = "info" | "warn" | "error";

type LogDetails = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof Response !== "undefined" && error instanceof Response) {
    return {
      name: "Response",
      message: `${error.status} ${error.statusText}`,
      status: error.status,
      statusText: error.statusText,
      url: error.url,
    };
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    return {
      name:
        typeof (error as Record<string, unknown>).name === "string"
          ? (error as Record<string, string>).name
          : "Error",
      message: (error as Record<string, string>).message,
      stack:
        typeof (error as Record<string, unknown>).stack === "string"
          ? (error as Record<string, string>).stack
          : undefined,
      details: Object.fromEntries(
        Object.entries(error as Record<string, unknown>).filter(
          ([key]) => key !== "message" && key !== "name" && key !== "stack",
        ),
      ),
    };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  try {
    return { value: JSON.parse(JSON.stringify(error)) };
  } catch {
    return { value: String(error) };
  }
}

function writeLog(
  level: LogLevel,
  scope: string,
  message: string,
  details?: LogDetails,
  error?: unknown,
) {
  const payload = {
    timestamp: new Date().toISOString(),
    scope,
    ...(details ? { details } : {}),
    ...(error !== undefined ? { error: serializeError(error) } : {}),
  };
  const prefix = `[presentation-ai][${scope}] ${message}`;

  if (level === "error") {
    console.error(prefix, payload);
    return;
  }

  if (level === "warn") {
    console.warn(prefix, payload);
    return;
  }

  console.info(prefix, payload);
}

export function createLogger(scope: string) {
  return {
    child(childScope: string) {
      return createLogger(`${scope}:${childScope}`);
    },
    info(message: string, details?: LogDetails) {
      writeLog("info", scope, message, details);
    },
    warn(message: string, details?: LogDetails) {
      writeLog("warn", scope, message, details);
    },
    error(message: string, error?: unknown, details?: LogDetails) {
      writeLog("error", scope, message, details, error);
    },
  };
}

export const appLogger = createLogger("app");
