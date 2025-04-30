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
                                'label': item[subTitel]
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
                                'label': item[subTitel]
                            })
                        field_dict['options_list'] = converted_options_lists
                        field_dict['title_field'] = subTitel
                filtered_fields.append(field_dict)

        # Send response
        create_response(
            200,
            f"{doctype} field info fetched!",
            {"fields": filtered_fields},
        )

    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in fetching item list")
        create_response(500, ex)

@frappe.whitelist()
def list_data():
    try:
        # Fetch doctype, fields, and filters from the request
        doctype = frappe.local.form_dict.get("doctype")
        fields = frappe.local.form_dict.get("fields") or ["*"]
        filters = frappe.local.form_dict.get("filters") or []
        or_filters = frappe.local.form_dict.get("or_filters") or []
        page = int(frappe.local.form_dict.get("page", 1))
        page_length = int(frappe.local.form_dict.get("page_length", 10))
        order_by = frappe.local.form_dict.get("order_by") or "modified desc"

        # Fetch data
        counts = frappe.db.count(doctype, filters=filters)

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

                        enhanced_record = linkedDoctype(
                            linked_doctype, value, enhanced_record
                        )

            enhanced_record["id"] = enhanced_record.name
            enhanced_data.append(enhanced_record)

        # Send response
        create_response(
            200,
            f"{doctype} list successfully fetched!",
            {"counts": counts, "data": enhanced_data},
        )

    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in fetching item list")
        create_response(500, ex)

@frappe.whitelist()
def single_data():
    try:
        # Fetch doctype, fields, and filters from the request
        doctype = frappe.local.form_dict.get("doctype")
        id = frappe.local.form_dict.get("id")
        getFields = frappe.local.form_dict.get("fields") or None

        record = frappe.get_doc(doctype, id)
        filtered_fields = {}
        for field, value in record.as_dict().items():
            if field in getFields:
                filtered_fields[field] = value

        # Send response
        create_response(
            200,
            f"{doctype} fetched successfully!",
            {"data": filtered_fields},
        )

    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in fetching item list")
        create_response(500, ex)

def linkedDoctype(linked_doctype, value, enhanced_record):

    # Address
    if linked_doctype == "Address":
        location = frappe.db.get_value(
            "Address",
            value,
            [
                "name",
                "address_title",
                "address_line1",
                "address_line2",
                "city",
                "state",
                "country",
                "pincode",
            ],
            as_dict=True,
        )
        enhanced_record["locationId"] = location.name if location else None
        enhanced_record["location"] = location

    # User
    if linked_doctype == "User":
        user = frappe.db.get_value(
            "User",
            value,
            [
                "name",
                "full_name",
                "first_name",
                "last_name",
                "email",
                "mobile_no",
                "gender",
                "birth_date",
            ],
            as_dict=True,
        )
        enhanced_record["userId"] = user.name if user else None
        enhanced_record["user"] = user

    # Property
    if linked_doctype == "Property":
        property = frappe.db.get_value(
            "Property",
            value,
            [
                "name",
                "property_name",
                "type",
                "community_name",
                "area",
                "amenities",
                "location",
            ],
            as_dict=True,
        )
        property_location = frappe.db.get_value(
            "Address",
            property.location,
            [
                "name",
                "address_title",
                "address_line1",
                "address_line2",
                "city",
                "state",
                "country",
                "pincode",
            ],
            as_dict=True,
        )
        property["locationId"] = property_location.name if property_location else None
        property["location"] = property_location
        enhanced_record["propertyId"] = property.name if property else None
        enhanced_record["property"] = property

    # Unit
    if linked_doctype == "Unit":
        unit = frappe.db.get_value(
            "Unit",
            value,
            [
                "*",
            ],
            as_dict=True,
        )
        unit_location = frappe.db.get_value(
            "Address",
            unit.location,
            [
                "name",
                "address_title",
                "address_line1",
                "address_line2",
                "city",
                "state",
                "country",
                "pincode",
            ],
            as_dict=True,
        )
        unit["locationId"] = unit_location.name if unit_location else None
        unit["location"] = unit_location
        enhanced_record["unitId"] = unit.name if unit else None
        enhanced_record["unit"] = unit

    # Landload
    if linked_doctype == "Landload" and value:
        landload = frappe.db.get_value(
            "Landload",
            value,
            [
                "name",
                "type",
                "nationality",
                "emirate",
                "name_of_the_company",
                "trade_license_number",
                "trade_license_expiry_date",
                "power_of_attorney_holder_name",
                "owner_signature",
                "user_name",
                "location",
            ],
            as_dict=True,
        )
        landload_user = frappe.db.get_value(
            "User",
            landload.user_name,
            [
                "name",
                "full_name",
                "email",
                "mobile_no",
                "gender",
                "birth_date",
            ],
            as_dict=True,
        )
        landload_location = frappe.db.get_value(
            "Address",
            landload.location,
            [
                "name",
                "address_title",
                "address_line1",
                "address_line2",
                "city",
                "state",
                "country",
                "pincode",
            ],
            as_dict=True,
        )
        landload["userId"] = landload_user.name if landload_user else None
        landload["user"] = landload_user
        landload["locationId"] = landload_location.name if landload_location else None
        landload["location"] = landload_location
        enhanced_record["landloadId"] = landload.name if landload else None
        enhanced_record["landload"] = landload

    # Tenant
    if linked_doctype == "Tenant" and value:
        tenant = frappe.db.get_value(
            "Tenant",
            value,
            [
                "name",
                "type",
                "nationality",
                "passport_number",
                "passport_expiry_date",
                "visa_start_date",
                "visa_end_date",
                "emirates_id",
                "emirates_id_expiry_date",
                "country_of_issuance",
                "signature",
                "user_name",
                "location",
            ],
            as_dict=True,
        )
        tenant_user = frappe.db.get_value(
            "User",
            tenant.user_name,
            [
                "name",
                "full_name",
                "email",
                "mobile_no",
                "gender",
                "birth_date",
            ],
            as_dict=True,
        )
        tenant_location = frappe.db.get_value(
            "Address",
            tenant.location,
            [
                "name",
                "address_title",
                "address_line1",
                "address_line2",
                "city",
                "state",
                "country",
                "pincode",
            ],
            as_dict=True,
        )
        tenant["userId"] = tenant_user.name if tenant_user else None
        tenant["user"] = tenant_user
        tenant["locationId"] = tenant_location.name if tenant_location else None
        tenant["location"] = tenant_location
        enhanced_record["tenantId"] = tenant.name if tenant else None
        enhanced_record["tenant"] = tenant

    # Damage Location
    if linked_doctype == "Damage Location" and value:
        damage = frappe.db.get_value(
            "Damage Location",
            value,
            [
                "name",
                "title_name",
            ],
            as_dict=True,
        )
        enhanced_record["damage"] = damage

    # Legal Reason
    if linked_doctype == "Legal Reason" and value:
        legal = frappe.db.get_value(
            "Legal Reason",
            value,
            [
                "name",
                "title_name",
            ],
            as_dict=True,
        )
        enhanced_record["legal"] = legal

    return enhanced_record

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