frappe.ui.form.on('Customer', {
    setup: async function (frm) {
        // Check If Is Branch
        frm.set_df_property('custom_branch', 'hidden', 1);
        frm.set_df_property('custom_branch', 'reqd', 0);
        const isBranchEnabled = await frappe.db.get_single_value('RMC Settings', 'is_enable_branch');
        if (isBranchEnabled) {
            frm.set_df_property('custom_branch', 'hidden', 0);
            frm.set_df_property('custom_branch', 'reqd', 1);
        }       
    },
    refresh: function (frm) {
        frm.add_custom_button(__('Unlink Address'), function () {
            frappe.call({
                method: 'erptech_rcm.api.custom.get_customer_address',
                args: {
                    'customer_name': frm.docname,
                },
                callback: async (r) => {
                    if (r.message) {
                        frappe.prompt({
                            label: __('Address Name'),
                            fieldname: 'address_name',
                            fieldtype: 'Link',
                            options: 'Address',
                            reqd: 1,
                            get_query: function () {
                                return {
                                    filters: {
                                        'name': ['in', (r.message).map(item => item.name)]
                                    }
                                };
                            }
                        }, function (values) {
                            frappe.confirm(
                                __('Are you sure you want to unlink the Address {0} from Customer {1}?', [values.address_name, frm.doc.name]),
                                function () {
                                    frappe.call({
                                        method: 'erptech_rcm.api.custom.unlink_customer_address',
                                        args: {
                                            'customer_name': frm.docname,
                                            'address_name': values.address_name,
                                        },
                                        callback: function (response) {
                                            if (response.message) {
                                                frappe.msgprint(__(response.message));
                                                frm.reload_doc();
                                            }
                                        }
                                    });
                                }
                            );
                        }, __('Unlink Address'), __('Unlink'));
                    }
                }
            })

        }, __('Actions'));
    },
    gstin: async function (frm) {
        if (frm.doc.gstin) {
            let gstin = frm.doc.gstin;
            frappe.call({
                method: 'erptech_rcm.api.custom.gst_info',
                args: {
                    'keyword': gstin
                },
                callback: async (r) => {
                    if (r.message) {
                        let json = JSON.parse(r.message)
                        let address = json?.data?.pradr?.addr ? json.data.pradr.addr : {}
                        let allAddress = await frappe.db.get_list("Address", {
                            fields: ["name"],
                            filters: { gstin: gstin, address_type: "Billing" },
                            limit: 1,
                        });
                        frm.set_value("customer_name", json.data.lgnm)
                        if (allAddress.length === 0) {
                            const pan = gstin.slice(2, 12);
                            frappe.db.insert({
                                doctype: 'Address',
                                address_type: 'Billing',
                                gstin: gstin,
                                pan: pan,
                                address_title: json.data.tradeNam,
                                address_line1: address.bno + ' ' + address.flno,
                                address_line2: address.landMark,
                                county: address.locality,
                                city: address.loc,
                                state: address.stcd,
                                pincode: address.pncd,
                            }).then(function (doc) {
                                frm.set_value("customer_primary_address", doc.name)
                            });
                        } else {
                            frm.set_value("customer_primary_address", allAddress[0].name)
                        }
                    }
                }
            })
        }
    }
})