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
        if (frm.doc.items[0] && frm.doc.items[0].against_sales_order) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Sales Order",
                    name: frm.doc.items[0].against_sales_order
                },
                callback: function (res) {
                    if (res.message) {
                        frm.doc.items[0]['custom_bom_no'] = res.message.items[0] ? res.message.items[0].bom_no : ""
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
    custom_site: function (frm) {
        // frm.set_value('shipping_address_name', frm.doc.custom_site);
    },
})