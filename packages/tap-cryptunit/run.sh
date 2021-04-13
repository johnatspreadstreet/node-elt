#!/bin/bash

python -m venv csv
# For non-windows, use: source csv/bin/activate 
# For windows, use ./csv/Scripts/activate
./csv/Scripts/activate.bat
pip install target-csv
# deactivate
./csv/Scripts/deactivate.bat

{ node ./bin/tap-cryptunit --config config.json --catalog catalog.json | node ./src/transport.js | ./csv/bin/target-csv; }