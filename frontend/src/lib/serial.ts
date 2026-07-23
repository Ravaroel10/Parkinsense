let port: SerialPort | null = null;
let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
let latestData: Record<string, unknown> | null = null;
const listeners = new Set<(payload: Record<string, unknown>) => void>();

export function subscribeToSerialData(listener: (payload: Record<string, unknown>) => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getLatestSerialData() {
  return latestData;
}

export async function connectSerial() {
  if (!("serial" in navigator)) {
    alert("Browser tidak mendukung Web Serial API.");
    return null;
  }

  if (port) {
    return port;
  }

  try {
    port = await navigator.serial.requestPort();

    await port.open({
      baudRate: 115200,
    });

    console.log("✅ ESP32 Connected");
    startReading();

    return port;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function startReading() {
  if (!port?.readable || reader) {
    return;
  }

  reader = port.readable.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          continue;
        }

        try {
          const parsed = JSON.parse(trimmed) as Record<string, unknown>;
          latestData = parsed;
          listeners.forEach((listener) => listener(parsed));
        } catch (err) {
          console.log("JSON Error:", trimmed);
        }
      }
    }
  } finally {
    reader.releaseLock();
    reader = null;
  }
}

export async function disconnectSerial() {
  if (port) {
    if (port.readable) {
      try {
        await port.close();
      } catch (err) {
        console.error(err);
      }
    }

    port = null;
    console.log("ESP32 Disconnected");
  }
}