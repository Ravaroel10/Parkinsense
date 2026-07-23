import json
import time
from pathlib import Path

import serial
import serial.tools.list_ports
from serial_reader import reader
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pandas.errors import EmptyDataError
from pydantic import BaseModel


def find_esp32():
    ports = serial.tools.list_ports.comports()

    for port in ports:
        print(port.device, port.description)

        desc = port.description.lower()

        if (
            "cp210" in desc or
            "ch340" in desc or
            "usb serial" in desc or
            "silicon labs" in desc or
            "esp32" in desc
        ):
            return port.device

    return None

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
CSV_PATH = DATA_DIR / "data.csv"

DATA_DIR.mkdir(exist_ok=True)

DEFAULT_COLUMNS = [
    "id",
    "timestamp",
    "participantId",
    "sampleId",
    "diagnosis",
    "duration",
    "samplesCount",
    "fileSize",
    "operator",
    "filename",
    "seriesData",
]


def ensure_csv_exists() -> None:
    if not CSV_PATH.exists() or CSV_PATH.stat().st_size == 0:
        pd.DataFrame(columns=DEFAULT_COLUMNS).to_csv(CSV_PATH, index=False)


class DatasetPayload(BaseModel):
    id: str | None = None
    filename: str
    timestamp: str
    participantId: str
    sampleId: str
    diagnosis: str
    duration: int
    samplesCount: int
    fileSize: str
    operator: str
    seriesData: list[dict] | None = None


app = FastAPI(title="ParkinSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ensure_csv_exists()
def find_esp32():
    ports = serial.tools.list_ports.comports()

    for port in ports:
        desc = port.description.lower()

        print(port.device, port.description)

        if (
            "cp210" in desc or
            "ch340" in desc or
            "usb serial" in desc or
            "silicon labs" in desc or
            "esp32" in desc
        ):
            return port.device

    return None


ser = None

def get_serial():
    global ser

    if ser and ser.is_open:
        return ser

    port = find_esp32()

    if port:
        print(f"ESP32 ditemukan di {port}")
        ser = serial.Serial(port, 115200, timeout=1)

    return ser


latest_sensor = {}


def _serialize_dataset(record: dict) -> dict:
    serialized = dict(record)
    if "seriesData" in serialized:
        serialized["seriesData"] = json.dumps(serialized.get("seriesData") or [])
    return serialized


def _deserialize_dataset(record: dict) -> dict:
    deserialized = dict(record)
    series_data = deserialized.get("seriesData")
    if isinstance(series_data, str):
        try:
            deserialized["seriesData"] = json.loads(series_data)
        except json.JSONDecodeError:
            deserialized["seriesData"] = []
    else:
        deserialized["seriesData"] = series_data or []
    return deserialized


def read_datasets() -> list[dict]:
    ensure_csv_exists()
    try:
        df = pd.read_csv(CSV_PATH)
    except EmptyDataError:
        return []

    if df.empty:
        return []

    return [_deserialize_dataset(record) for record in df.fillna("").to_dict(orient="records")]


def write_datasets(records: list[dict]) -> None:
    serialized_records = [_serialize_dataset(record) for record in records]
    df = pd.DataFrame(serialized_records, columns=DEFAULT_COLUMNS)
    df.to_csv(CSV_PATH, index=False)


@app.get("/")
def root():
    return {"message": "ParkinSense Backend Running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/datasets")
def get_datasets():
    return read_datasets()


@app.post("/datasets", status_code=201)
def create_dataset(payload: DatasetPayload):
    records = read_datasets()
    new_record = payload.model_dump()
    new_record["id"] = payload.id or f"REC-{int(time.time() * 1000)}"
    new_record["seriesData"] = payload.seriesData or []
    records.insert(0, new_record)
    write_datasets(records)
    return new_record


@app.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: str):
    records = read_datasets()
    remaining = [record for record in records if str(record.get("id")) != dataset_id]

    if len(remaining) == len(records):
        raise HTTPException(status_code=404, detail="Dataset not found")

    write_datasets(remaining)
    return {"message": "Dataset deleted", "id": dataset_id}

@app.get("/live-data")
def live_data():
    global latest_sensor

    serial_conn = get_serial()

    if serial_conn is None:
        return {
            "status": "ESP32 not connected"
        }

    if serial_conn.in_waiting:
        try:
            line = serial_conn.readline().decode().strip()

            if line:
                latest_sensor = json.loads(line)

        except Exception as e:
            print(e)

    return latest_sensor

@app.get("/live-data")
def live_data():
    data = reader.read()

    if data is None:
        return {
            "status": "waiting"
        }

    return data