import csv
import json
import urllib.request
from zipfile import ZipFile
from io import StringIO, BytesIO

# Constants
ZIP_URL = "https://github.com/gambolputty/german-nouns/archive/refs/heads/master.zip"
CSV_PATH_IN_ZIP = "german-nouns-master/nouns.csv"
OUTPUT_FILE = "dictionary.json"

def extract_existing_csv():
    with open("nouns.csv") as csv_file:
        return csv_file.read()

def download_and_extract_csv():
    print("Downloading noun dataset...")
    response = urllib.request.urlopen(ZIP_URL)
    zip_data = response.read()
    with ZipFile(BytesIO(zip_data)) as zip_file:
        # List files in the ZIP
        namelist = zip_file.namelist()
        # Find the first file ending with 'nouns.csv'
        csv_file_name = next((name for name in namelist if name.endswith("nouns.csv")), None)
        if not csv_file_name:
            raise FileNotFoundError("Could not find 'nouns.csv' in the ZIP archive.")
        print(f"Found CSV file: {csv_file_name}")
        with zip_file.open(csv_file_name) as csv_file:
            return csv_file.read().decode("utf-8")


def build_compressed_dictionary(csv_content):
    reader = csv.DictReader(StringIO(csv_content))
    dictionary = {}

    for row in reader:
        lemma = row["lemma"]
        gender = row["genus"]
        gender1 = row["genus 1"]
        gender2 = row["genus 2"]
        gender3 = row["genus 3"]
        plurals = []
        plurals.append(row["nominativ plural"])
        plurals.append(row["nominativ plural*"])
        plurals.append(row["nominativ plural 1"])
        plurals.append(row["nominativ plural 2"])
        plurals.append(row["nominativ plural 3"])
        plurals.append(row["nominativ plural 4"])
        plurals.append(row["nominativ plural stark"])
        plurals.append(row["nominativ plural schwach"])
        plurals.append(row["nominativ plural gemischt"])

        plural = next((x for x in plurals if x != ""), "-")

        gender_map = {"m": "der", "f": "die", "n": "das"}

        if gender:
            article = gender_map.get(gender, "")
        else:
            parts = []
            if gender1:
                a1 = gender_map.get(gender1)
                if a1:
                    parts.append(a1)
            if gender2:
                a2 = gender_map.get(gender2)
                if a2 and a2 not in parts:
                    parts.append(a2)
            if gender3:
                a3 = gender_map.get(gender3)
                if a3 and a3 not in parts:
                    parts.append(a3)
            article = "/".join(parts) if parts else ""

        if lemma and article and plural:
            dictionary[lemma] = f"{article}|{plural}|s"
            dictionary[plural] = f"{article}|{lemma}|p"

    return dictionary

def main():
    csv_content = extract_existing_csv()
    compressed_dict = build_compressed_dictionary(csv_content)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(compressed_dict, f, ensure_ascii=False)

    print(f"Saved {len(compressed_dict):,} entries to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
