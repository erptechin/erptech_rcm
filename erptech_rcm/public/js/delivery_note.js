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
                    let sItem = items.find((item) => item.item_name === values.item)
                    frappe.call({
                        method: "frappe.client.get",
                        args: {
                            doctype: "Sales Order",
                            name: sItem.against_sales_order
                        },
                        callback: function (res) {
                            if (res.message) {
                                frm.doc.items[0]['custom_bom_no'] = res.message.items[0] ? res.message.items[0].bom_no : ""
                                frm.doc.items[0]['custom_balance_quantity'] = frm.doc.items[0].stock_qty
                                if (frm.doc.name.includes("new-delivery-note")) {
                                    frm.doc.items[0]['qty'] = ''
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
                        frm.doc.items[0]['custom_bom_no'] = res.message.items[0] ? res.message.items[0].bom_no : ""
                        frm.doc.items[0]['custom_balance_quantity'] = res.message.items[0].qty
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
            const custom_produced_qty = row.custom_balance_quantity - row.stock_qty
            const custom_cumulative_qty = custom_produced_qty + row.qty
            frappe.model.set_value(cdt, cdn, 'qty', row.qty)
            frappe.model.set_value(cdt, cdn, 'custom_produced_qty', custom_produced_qty)
            frappe.model.set_value(cdt, cdn, 'custom_cumulative_qty', custom_cumulative_qty)
            // frappe.db.get_value('Item', row.item_code, 'item_name')
            //     .then(r => {
            //         const item_name = r.message.item_name;
            //         frappe.model.set_value(cdt, cdn, 'item_name', item_name);
            // });
        }

    }
});