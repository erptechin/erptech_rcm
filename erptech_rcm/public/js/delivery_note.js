frappe.ui.form.on('Delivery Note', {
    setup: function (frm) {
        if (frm.doc.name.includes("new-delivery-note")) {
            frm.set_value('custom_site', null);
            // frm.set_value('shipping_address_name', null);
        }
        frm.set_query('custom_site', function () {
            return {
                filters: {
                    'address_type': ''
                }
            };
        });
    },
    refresh: function (frm) {
        if (frm.doc.items.length > 1) {
            const items = JSON.parse(JSON.stringify(frm.doc.items))
            frm.doc.items = []
            frm.refresh_field('items');
            const itemNames = items.map(item => item.item_name);
            frappe.prompt({
                label: 'Choose Item',
                fieldname: 'item',
                fieldtype: 'Select',
                options: itemNames,
                reqd: 1
            },
                function (values) {
                    frappe.call({
                        method: "frappe.client.get",
                        args: {
                            doctype: "Sales Order",
                            name: items[0].against_sales_order
                        },
                        callback: function (res) {
                            if (res.message) {
                                let sItem = res.message.items.find((item) => item.item_name === values.item)
                                let item = frm.add_child("items");
                                item.custom_bom_no = sItem?.bom_no
                                item.custom_balance_quantity = sItem?.qty
                                item.item_code = sItem?.item_code
                                item.item_name = sItem?.item_name
                                item.uom = sItem?.uom
                                item.against_sales_order = sItem?.parent
                                item.so_detail = sItem?.name
                                if (frm.doc.name.includes("new-delivery-note")) {
                                    item.qty = 0;
                                }
                                frm.refresh_field('items');
                            }
                        }
                    });
                },
                __('Select Item'),
                __('Select')
            );
        } else if (frm.doc.items[0] && frm.doc.items[0].against_sales_order) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Sales Order",
                    name: frm.doc.items[0].against_sales_order
                },
                callback: function (res) {
                    if (res.message) {
                        let sItem = res.message.items[0]
                        frm.doc.items[0]['custom_bom_no'] = sItem ? sItem.bom_no : ""
                        frm.doc.items[0]['custom_balance_quantity'] = sItem.qty
                        if (frm.doc.name.includes("new-delivery-note")) {
                            frm.doc.items[0]['qty'] = ''
                        }
                        frm.refresh_field('items');
                    }
                }
            });
        }
    },
    customer: function (frm) {
        if (frm.doc.customer) {
            frm.set_value('custom_site', null);
            frappe.call({
                method: 'erptech_rcm.api.custom.get_customer_address',
                args: {
                    'customer_name': frm.doc.customer,
                },
                callback: async (r) => {
                    if (r.message) {
                        frm.set_query('custom_site', function () {
                            return {
                                filters: {
                                    'name': ['in', (r.message).map(item => item.name)]
                                }
                            };
                        });
                    }
                    // frm.set_value('shipping_address_name', null);
                }
            })
        }
    },
    customer_name: function (frm) {
        if (frm.doc.customer_name) {
            frm.set_value('title', frm.doc.customer_name);
        }
    },
    custom_site: function (frm) {
        // frm.set_value('shipping_address_name', frm.doc.custom_site);
    },
})


frappe.ui.form.on('Delivery Note Item', {
    qty: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.qty) {
            const today = frappe.datetime.get_today();
            frappe.call({
                // method: 'erptech_rcm.api.custom.get_latest_delivery_note_with_items',
                // args: {
                //     posting_date: today,
                //     against_sales_order: row.against_sales_order,
                // },
                method: "frappe.client.get_list",
                args: {
                    doctype: "Delivery Note",
                    filters: [
                        ["status", "!=", "Draft"],
                        ["posting_date", "=", today],
                        ["Delivery Note Item", "against_sales_order", "=", row.against_sales_order],
                    ],
                    fields: ["name", "creation", "status"],
                    limit_page_length: 1,
                    order_by: "creation desc"
                },
                callback: function (res) {
                    if (res.message && res.message.length > 0) {
                        const dnName = res.message[0].name;
                        frappe.call({
                            method: "frappe.client.get",
                            args: {
                                doctype: "Delivery Note",
                                name: dnName
                            },
                            callback: function (docRes) {
                                const fullDoc = docRes.message;
                                const custom_produced_qty = fullDoc.items[0].custom_cumulative_qty
                                const custom_cumulative_qty = custom_produced_qty + row.qty
                                frappe.model.set_value(cdt, cdn, 'custom_serial_count', Number(fullDoc.items[0].custom_serial_count) + 1)
                                frappe.model.set_value(cdt, cdn, 'qty', row.qty)
                                frappe.model.set_value(cdt, cdn, 'custom_produced_qty', custom_produced_qty)
                                frappe.model.set_value(cdt, cdn, 'custom_cumulative_qty', custom_cumulative_qty)
                            }
                        });

                    } else {
                        const custom_produced_qty = 0
                        const custom_cumulative_qty = custom_produced_qty + row.qty
                        frappe.model.set_value(cdt, cdn, 'custom_serial_count', 1)
                        frappe.model.set_value(cdt, cdn, 'qty', row.qty)
                        frappe.model.set_value(cdt, cdn, 'custom_produced_qty', custom_produced_qty)
                        frappe.model.set_value(cdt, cdn, 'custom_cumulative_qty', custom_cumulative_qty)
                    }
                }
            });
        }

    }
});