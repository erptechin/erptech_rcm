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

frappe.ui.form.on('Address', {
    gstin: async function (frm) {
        if (frm.doc.gstin && isValidGST(frm.doc.gstin)) {
            let gstin = frm.doc.gstin;
            frappe.call({
                method: 'erptech_rmc_pk.api.custom.gst_info',
                args: {
                    'keyword': gstin,
                    'uniqueId': "CFk1mgVfd8Dx2bcTuRuILOE4DAV169",
                },
                callback: function (r) {
                    if (r.message) {
                        let json = JSON.parse(r.message)
                        let address = json?.data?.pradr?.addr ? json.data.pradr.addr : {}
                        frm.set_value("address_title", json.data.tradeNam)
                        frm.set_value("address_line1", address.bno + ' ' + address.flno)
                        frm.set_value("address_line2", address.landMark)
                        frm.set_value("county", address.locality)
                        frm.set_value("city", address.loc)
                        frm.set_value("state", address.stcd)
                        frm.set_value("pincode", address.pncd)
                    }
                }
            })
        }
    }
})