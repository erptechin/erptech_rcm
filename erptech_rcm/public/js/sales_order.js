frappe.ui.form.on('Sales Order', {
    setup: async function (frm) {
        // Check If Is Branch
        frm.set_df_property('custom_branch', 'hidden', 1);
        frm.set_df_property('custom_branch', 'reqd', 0);
        const isBranchEnabled = await frappe.db.get_single_value('RMC Settings', 'is_enable_branch');
        
        if (isBranchEnabled) {
            frm.set_df_property('custom_branch', 'hidden', 0);
            frm.set_df_property('custom_branch', 'reqd', 1);
        }

        if (frm.doc.name.includes("new-sales-order")) {
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
    }
})