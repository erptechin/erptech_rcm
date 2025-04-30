// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import {
    SelectCell,
    SelectHeader,
} from "components/shared/table/SelectCheckbox";
import {
    OrderIdCell,
    RoleCell
} from "./rows";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

export function Columns(fields = []) {
    let returnColumns = []

    // Check box
    returnColumns.push(columnHelper.display({
        id: "select",
        label: "Row Selection",
        header: SelectHeader,
        cell: SelectCell,
    }))

    for (let item of fields) {

        // Data
        if (item.fieldtype == 'Data') {
            returnColumns.push(columnHelper.accessor((row) => row[item.fieldname], {
                id: item.fieldname,
                label: item.label,
                header: item.label
            }))
        }

        // Select
        if (item.fieldtype == 'Select') {
            const options = item.options ? (item.options).split("\n").map(item => ({ label: item, value: item })) : [];
            returnColumns.push(columnHelper.accessor((row) => row[item.fieldname], {
                id: item.fieldname,
                label: item.label,
                header: item.label,
                filter: options.length ? "select" : "",
                filterFn: options.length ? "arrIncludesSome" : "includesString",
                options: options,
            }))
        }

        // Link
        if (item.fieldtype == 'Link') {
            returnColumns.push(columnHelper.accessor((row) => row[item.fieldname], {
                id: item.fieldname,
                label: item.label,
                header: item.label,
                cell: OrderIdCell,
            }))
        }

        // Check
        if (item.fieldtype == 'Check') {
            returnColumns.push(columnHelper.accessor((row) => row[item.fieldname], {
                id: item.fieldname,
                label: item.label,
                header: item.label,
                cell: RoleCell,
                filterFn: "equalsString",
            }))
        }

        // Check
        if (item.fieldtype == 'Date') {
            returnColumns.push(columnHelper.accessor((row) => row[item.fieldname], {
                id: item.fieldname,
                label: item.label,
                header: item.label,
            }))
        }
    }

    returnColumns.push(columnHelper.display({
        id: "actions",
        label: "Row Actions",
        header: "Actions",
        cell: RowActions
    }))

    return returnColumns
}