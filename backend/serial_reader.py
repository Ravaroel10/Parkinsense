import json
import serial
import serial.tools.list_ports


class SerialReader:
    def __init__(self):
        self.ser = None
        self.connect()

    def find_esp32(self):
        ports = serial.tools.list_ports.comports()

        for port in ports:
            desc = port.description.lower()

            print(f"{port.device} - {port.description}")

            if (
                "cp210" in desc
                or "ch340" in desc
                or "usb serial" in desc
                or "silicon labs" in desc
                or "esp32" in desc
            ):
                return port.device

        return None

    def connect(self):
        try:
            port = self.find_esp32()

            if port:
                print(f"ESP32 ditemukan di {port}")
                self.ser = serial.Serial(port, 115200, timeout=1)
            else:
                print("ESP32 tidak ditemukan.")
        except Exception as e:
            print(e)
            self.ser = None

    def read(self):
        if self.ser is None:
            self.connect()
            return None

        try:
            if self.ser.in_waiting:
                line = self.ser.readline().decode().strip()

                if line:
                    return json.loads(line)

        except Exception as e:
            print(e)

        return None


reader = SerialReader()