import requests
import pymysql
import json
from datetime import datetime
from decimal import Decimal
import pyodbc

def make_api_call(type):
    """Function to make an API call and handle the response."""
    # Replace with your API endpoint and API key if required
    url = "https://rmc.azureerptech.com/api/method/"
    headers = {
        "Content-Type": "application/json"
    }

    try:
        # Make the GET request
        consumption_settings = requests.get(url+"erptech_rcm.api.consumption.consumption_settings", headers=headers)
        consumption_settings.raise_for_status()  # Raise an HTTPError for bad responses (4xx and 5xx)
        
        # Process the response
        consumption = consumption_settings.json()  # Assuming the API returns JSON
        settings = consumption['message']
        if(settings):
            
            # Make connection
            do_connection = None
            consumption_connection = None
            do_columns = None
            consumption_columns = None
            if(settings['sql_server'] == 1):
                do_connection = pyodbc.connect(f"Driver={{{settings['db_driver']}}};Server={settings['db_host']};Database={settings['database']};UID={settings['db_user']};PWD={settings['db_password']};MARS_Connection=Yes;")
                consumption_connection = pyodbc.connect(f"Driver={{{settings['db_driver']}}};Server={settings['db_host']};Database={settings['database']};UID={settings['db_user']};PWD={settings['db_password']};MARS_Connection=Yes;")
            else:
                do_connection = pymysql.connect(host=settings['db_host'],user=settings['db_user'],password=settings['db_password'],database=settings['database'],cursorclass=pymysql.cursors.DictCursor)
                consumption_connection = pymysql.connect(host=settings['db_host'],user=settings['db_user'],password=settings['db_password'],database=settings['database'],cursorclass=pymysql.cursors.DictCursor)

            # Create a cursor object to interact with the database
            do_data = do_connection.cursor()
            consumption_data = consumption_connection.cursor()

            # Example: Query the database
            do_table = settings['consumption_table_from']
            consumption_table = settings['consumption_item_table_from']
            if(type == "all"):
                do_data.execute(f"SELECT * FROM {do_table}") 
                consumption_data.execute(f"SELECT * FROM {consumption_table}") 
            else:
                do_data.execute(f"SELECT * FROM {do_table} WHERE Batch_No > {settings['count']}")
                consumption_data.execute(f"SELECT * FROM {consumption_table} WHERE Batch_No > {settings['count']}")

            if(settings['sql_server'] == 1):
                do_columns = [column[0] for column in do_data.description]
                consumption_columns = [column[0] for column in consumption_data.description]

            do_results = do_data.fetchall()
            consumption_results = consumption_data.fetchall()

            if(settings['sql_server'] == 1):
                do_results = [dict(zip(do_columns, row)) for row in do_results]
                consumption_results = [dict(zip(consumption_columns, row)) for row in consumption_results]

            # Loop through each record in data
            grouped = {}
            for item in consumption_results:
                if item['Batch_No'] not in grouped:
                    grouped[item['Batch_No']] = []
                filtered_item = {
                    key: (
                        value.strftime("%Y-%m-%d") if isinstance(value, datetime) 
                        else float(value) if isinstance(value, Decimal) 
                        else value
                    )
                    for key, value in item.items()
                }
                grouped[item['Batch_No']].append(filtered_item)
            
            results = []
            for do_result in do_results:
                do_result["items"] = []
                for key, group in grouped.items():
                    if(do_result["Batch_No"] == group[0]["Batch_No"]):
                        do_result["items"] = group
                filtered_result = {
                    key: (
                        value.strftime("%Y-%m-%d") if isinstance(value, datetime) 
                        else float(value) if isinstance(value, Decimal) 
                        else value
                    )
                    for key, value in do_result.items()
                }
                results.append(filtered_result)
                
            # Make the POST request
            consumption_set_data = requests.post(url+"erptech_rcm.api.consumption.consumption_set_data_stetter", json={"payload": json.dumps(results)}, headers=headers)
            consumption_set_data.raise_for_status()  # Raise an HTTPError for bad responses (4xx and 5xx)
            
            # Process the response
            consumption = consumption_set_data.json()  # Assuming the API returns JSON

            if(consumption['message']['status'] == "success"):
                print(consumption['message']['message'])
            do_data.close()
            consumption_data.close()
    except requests.exceptions.RequestException as e:
        # Handle any exceptions
        print("An error occurred:", e)

# Auto-run the function when the script is executed
if __name__ == "__main__":
    make_api_call('all')