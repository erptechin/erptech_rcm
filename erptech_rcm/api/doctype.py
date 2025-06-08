import frappe
from erptech_rcm.api.utils import create_response

@frappe.whitelist()
def list_info():
    try:
        # Fetch doctype, fields, and filters from the request
        doctype = frappe.local.form_dict.get("doctype")
        getFields = frappe.local.form_dict.get("fields") or None

        # Fetch meta
        meta = frappe.get_meta(doctype)
        fields = meta.get("fields")
        filtered_fields = []
        for field in fields:
            field_dict = field.as_dict()
            if getFields:
                if field_dict.fieldname in getFields:
                    if field_dict.fieldtype == 'Link':
                        subMeta = frappe.get_meta(field.options)
                        subFields = ["name"]
                        subTitel = None
                        if subMeta.as_dict()['title_field']:
                            subTitel = subMeta.as_dict()['title_field']
                            subFields.append(subTitel)
                        options_lists = frappe.get_all(field.options, fields=subFields)
                        converted_options_lists = []
                        for item in options_lists:
                            converted_options_lists.append({
                                'value': item['name'],
                                'label':  item[subTitel] if subTitel else item['name']
                            })
                        field_dict['options_list'] = converted_options_lists
                        field_dict['title_field'] = subTitel
                    if field_dict.fieldtype == 'Table':
                        subMeta = frappe.get_meta(field.options)
                        sub_fields = subMeta.as_dict()['fields']
                        converted_sub_fields = []
                        for item in sub_fields:
                            converted_sub_fields.append({
                                'fieldname': item['fieldname'],
                                'fieldtype': item['fieldtype'],
                                'options': item['options'] if item['options'] else None
                            })
                        field_dict['sub_fields'] = converted_sub_fields
                    filtered_fields.append(field_dict)
            else:
                if field_dict.fieldtype == 'Link':
                        subMeta = frappe.get_meta(field.options)
                        subFields = ["name"]
                        subTitel = None
                        if subMeta.as_dict()['title_field']:
                            subTitel = subMeta.as_dict()['title_field']
                            subFields.append(subTitel)
                        options_lists = frappe.get_all(field.options, fields=subFields)
                        converted_options_lists = []
                        for item in options_lists:
                            converted_options_lists.append({
                                'value': item['name'],
                                'label':  item[subTitel] if subTitel else item['name']
                            })
                        field_dict['options_list'] = converted_options_lists
                        field_dict['title_field'] = subTitel
                filtered_fields.append(field_dict)

        # Send response
        create_response(
            200,
            f"{doctype} field info fetched!",
            {"fields": filtered_fields, "field_order": meta.field_order, "is_submittable": meta.is_submittable},
        )

    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in fetching item list")
        create_response(500, ex)

@frappe.whitelist()
def list_data():
    try:
        # Fetch doctype, fields, and filters from the request
        doctype = frappe.local.form_dict.get("doctype")
        fields = frappe.local.form_dict.get("fields") or []
        filters = frappe.local.form_dict.get("filters") or []
        or_filters = frappe.local.form_dict.get("or_filters") or []
        page = int(frappe.local.form_dict.get("page", 1))
        page_length = int(frappe.local.form_dict.get("page_length", 10))
        order_by = frappe.local.form_dict.get("order_by") or "modified desc"

        # Fetch data
        counts = frappe.get_all(
            doctype,
            filters=filters,
            or_filters=or_filters,
            fields=["count(name)"]
        )

        data = frappe.get_all(
            doctype,
            filters=filters,
            or_filters=or_filters,
            fields=fields,
            order_by=order_by,
            start=(page - 1) * page_length,
            limit_page_length=page_length,
        )

        # Fetch linked field values
        enhanced_data = []
        for record in data:
            enhanced_record = record.copy()
            for field, value in record.items():
                # Check if the field is a link field
                field_meta = frappe.get_meta(doctype).get_field(field)
                if field_meta and field_meta.fieldtype == "Link":
                    # Fetch the linked document name or value
                    linked_doctype = field_meta.options
                    if linked_doctype and value:
                        link_data = frappe.db.get_value(linked_doctype,value,["*"],as_dict=True)
                        if link_data:
                            enhanced_record[linked_doctype] = link_data
                            # enhanced_record['bb'] = field_meta

            enhanced_record["id"] = enhanced_record.name
            enhanced_data.append(enhanced_record)

        # Send response
        create_response(
            200,
            f"{doctype} list successfully fetched!",
            {"counts": counts[0]['count(name)'], "data": enhanced_data},
        )

    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in fetching item list")
        create_response(500, ex)

@frappe.whitelist()
def single_data():
    try:
        # Fetch doctype and id from the request
        doctype = frappe.local.form_dict.get("doctype")
        id = frappe.local.form_dict.get("id")

        if not id:
            create_response(400, "ID is required", {})
            return

        # Get the complete document
        record = frappe.get_doc(doctype, id)
        result = record.as_dict()

        # Get meta information for the doctype
        meta = frappe.get_meta(doctype)
        
        # Process each field
        for field in meta.fields:
            field_value = result.get(field.fieldname)
            
            # Handle Link type fields
            if field.fieldtype == "Link" and field_value:
                linked_doctype = field.options
                if linked_doctype:
                    link_data = frappe.db.get_value(linked_doctype, field_value, ["*"], as_dict=True)
                    if link_data:
                        result[field.fieldname + "_data"] = link_data
            
            # Handle Table type fields
            elif field.fieldtype == "Table" and field_value:
                table_doctype = field.options
                if table_doctype:
                    table_meta = frappe.get_meta(table_doctype)
                    table_records = []
                    
                    for row in record.get(field.fieldname):
                        row_data = row.as_dict()
                        
                        # Process Link fields within table
                        for table_field in table_meta.fields:
                            if table_field.fieldtype == "Link" and row_data.get(table_field.fieldname):
                                linked_value = row_data.get(table_field.fieldname)
                                linked_doctype = table_field.options
                                link_data = frappe.db.get_value(linked_doctype, linked_value, ["*"], as_dict=True)
                                if link_data:
                                    row_data[table_field.fieldname + "_data"] = link_data
                                    
                        table_records.append(row_data)
                    
                    result[field.fieldname] = table_records

        # Send response
        create_response(
            200,
            f"{doctype} fetched successfully!",
            {"data": result},
        )

    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in fetching item list")
        create_response(500, ex)

@frappe.whitelist()
def delete_data():
    try:
        # Fetch doctype, fields, and filters from the request
        doctype = frappe.local.form_dict.get("doctype")
        ids = frappe.local.form_dict.get("ids")
        for id in ids:
            frappe.delete_doc(doctype, id)

        # Send response
        create_response(
            200,
            f"{ids} are deleted successfully!",
            {"success": True},
        )

    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in deleting data")
        create_response(500, ex)