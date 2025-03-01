from collections import defaultdict
import requests
import pymysql
import json
from datetime import datetime, timedelta
from decimal import Decimal
import pyodbc


def make_api_call(type):
    """Function to make an API call and handle the response."""
    url = "https://myhome.erptech.in/api/method/"
    headers = {"Content-Type": "application/json"}

    try:

        # Make the GET request
        consumption_settings = requests.get(
            url + "erptech_rcm.api.consumption.consumption_settings",
            headers=headers,
        )
        consumption_settings.raise_for_status()  # Raise an HTTPError for bad responses (4xx and 5xx)

        # Process the response
        consumption = consumption_settings.json()  # Assuming the API returns JSON
        settings = consumption["message"]
        if settings:

            # Make connection
            do_connection = None
            do_columns = None
            if settings["sql_server"] == 1:
                do_connection = pyodbc.connect(
                    f"Driver={{{settings['db_driver']}}};Server={settings['db_host']};Database={settings['database']};UID={settings['db_user']};PWD={settings['db_password']};MARS_Connection=Yes;"
                )
            else:
                do_connection = pymysql.connect(
                    host=settings["db_host"],
                    user=settings["db_user"],
                    password=settings["db_password"],
                    database=settings["database"],
                    cursorclass=pymysql.cursors.DictCursor,
                )

            # Create a cursor object to interact with the database
            do_data = do_connection.cursor()

            # Example: Query the database
            current_date = datetime.now().strftime("%Y-%m-%d")
            currentDate = datetime.now()
            date_before_20_days = currentDate - timedelta(days=20)
            formatted_date = date_before_20_days.strftime("%Y-%m-%d")

            do_table = settings["consumption_table_from"]
            fetchLatest = settings["fetch_latest"]
            from_date = formatted_date if fetchLatest else settings["from_date"]
            to_date = current_date if fetchLatest else settings["to_date"]
            if type == "all":
                do_data.execute(
                    f"SELECT * FROM {do_table} WHERE timestamp BETWEEN '{from_date}' AND '{to_date}'"
                )
            else:
                do_data.execute(
                    f"SELECT * FROM {do_table} WHERE sequence_number > {settings['count']}"
                )

            if settings["sql_server"] == 1:
                do_columns = [column[0] for column in do_data.description]

            do_results = do_data.fetchall()

            if settings["sql_server"] == 1:
                do_results = [dict(zip(do_columns, row)) for row in do_results]

            results = []
            for do_result in do_results:
                do_result["batching_plant"] = "APAS-BP1"
                filtered_result = {
                    key: (
                        value.strftime("%Y-%m-%d %H:%M:%S.%f")
                        if isinstance(value, datetime)
                        else float(value) if isinstance(value, Decimal) else value
                    )
                    for key, value in do_result.items()
                }
                results.append(filtered_result)

            # Grouping by 'addinfo23'
            grouped_data = defaultdict(list)
            for item in results:
                grouped_data[item["AddInfo23"]].append(item)

            new_results = []
            for key, items in grouped_data.items():
                grouped_entry = {"AddInfo23": key, "items": items}

                # Dynamically add keys except 'AddInfo23'
                for k in items[0]:
                    if k != "AddInfo23":
                        grouped_entry[k] = items[0][k]

                new_results.append(grouped_entry)

            # Make the POST request
            print(new_results)
            consumption_set_data = requests.post(
                url + "erptech_rcm.api.consumption.consumption_set_data_kyb",
                json={"payload": json.dumps(new_results)},
                headers=headers,
            )
            consumption_set_data.raise_for_status()  # Raise an HTTPError for bad responses (4xx and 5xx)

            # Process the response
            consumption = consumption_set_data.json()  # Assuming the API returns JSON

            if consumption["message"]["status"] == "success":
                print(consumption["message"]["message"])
            do_data.close()
    except requests.exceptions.RequestException as e:
        # Handle any exceptions
        print("An error occurred:", e)


# Auto-run the function when the script is executed
if __name__ == "__main__":
    make_api_call("all")
