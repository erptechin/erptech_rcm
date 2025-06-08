frappe.ui.form.on('Supplier', {
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
                        frm.set_value("supplier_name", json.data.lgnm)
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
                                frm.set_value("supplier_primary_address", doc.name)
                            });
                        } else {
                            frm.set_value("supplier_primary_address", allAddress[0].name)
                        }
                    }
                }
            })
        }
    }
})