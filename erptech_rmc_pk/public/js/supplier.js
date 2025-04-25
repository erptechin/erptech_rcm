function isValidGST(gstin) {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!gstRegex.test(gstin)) {
        return false; // Basic format check failed
    }

    // Checksum validation (simplified version)
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let factor = 2, sum = 0, checkCodePoint = 0;

    for (let i = gstin.length - 2; i >= 0; i--) {
        const codePoint = chars.indexOf(gstin[i]);
        const addend = factor * codePoint;

        factor = (factor == 2) ? 1 : 2;
        sum += Math.floor(addend / chars.length) + addend % chars.length;
    }

    const checksum = (chars.length - (sum % chars.length)) % chars.length;
    return gstin[gstin.length - 1] === chars[checksum];
}

frappe.ui.form.on('Supplier', {
    setup: async function (frm) {
        // Check If Is Branch
        frm.set_df_property('custom_branch', 'hidden', 1);
        frm.set_df_property('custom_branch', 'reqd', 0);
        const isBranchEnabled = await frappe.db.get_single_value('Theme Settings', 'is_enable_branch');
        if (isBranchEnabled) {
            frm.set_df_property('custom_branch', 'hidden', 0);
            frm.set_df_property('custom_branch', 'reqd', 1);
        }
    },
    gstin: async function (frm) {
        if (frm.doc.gstin && isValidGST(frm.doc.gstin)) {
            let gstin = frm.doc.gstin;
            frappe.call({
                method: 'erptech_rmc_pk.api.custom.gst_info',
                args: {
                    'keyword': gstin,
                    'uniqueId': "CFk1mgVfd8Dx2bcTuRuILOE4DAV169",
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