frappe.ui.form.on('Quotation', {
    setup: async function (frm) {
         // Check If Is Branch
         frm.set_df_property('custom_branch', 'hidden', 1);
         frm.set_df_property('custom_branch', 'reqd', 0);
         const isBranchEnabled = await frappe.db.get_single_value('Theme Settings', 'is_enable_branch');
         if (isBranchEnabled) {
             frm.set_df_property('custom_branch', 'hidden', 0);
             frm.set_df_property('custom_branch', 'reqd', 1);
         }

        if (frm.doc.name.includes("new-quotation")) {
            frm.set_value('custom_site', null);
            frm.set_value('shipping_address_name', null);
        }
        frm.set_query('custom_site', function () {
            return {
                filters: {
                    'address_type': ''
                }
            };
        });
    },
    party_name: function (frm) {
        if (frm.doc.party_name) {
            frm.set_value('custom_site', null);
            frappe.call({
                method: 'erptech_rmc_pk.api.custom.get_customer_address',
                args: {
                    'customer_name': frm.doc.party_name,
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
                    frm.set_value('shipping_address_name', null);
                }
            })
        }
    },
    custom_site: function (frm) {
        frm.set_value('shipping_address_name', frm.doc.custom_site);
    }
})