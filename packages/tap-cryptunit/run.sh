#!/bin/bash

python3 -m venv csv
source csv/bin/activate
pip install target-csv
deactivate

{ node ./bin/tap-cryptunit --config config.json --catalog catalog.json | ./csv/bin/target-csv; }