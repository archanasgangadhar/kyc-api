const sql = require("mssql");
const dbConnect = require("../config/db");
const archiver = require("archiver");

exports.downloadEmployeeZip = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const db = await dbConnect();

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=employee_${employeeId}_documents.zip`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    /* =====================================================
       EMPLOYEE KYC (PHOTO + SIGNATURE + KYC DOCS)
    ===================================================== */
    const kyc = await db.request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT
          employeePhoto, employeePhotoName,
          signature, signatureName,
          aadhaarFront, aadhaarFrontName,
          aadhaarBack, aadhaarBackName,
          panFront, panFrontName,
          panBack, panBackName,
          passportFront, passportFrontName,
          passportBack, passportBackName,
          dlFront, dlFrontName,
          dlBack, dlBackName,
          rationCardFront, rationCardFrontName,
          rationCardBack, rationCardBackName
        FROM EmployeeKYC
        WHERE employeeId=@employeeId
      `);

    if (kyc.recordset[0]) {
      const k = kyc.recordset[0];

      const add = (data, name, path) => {
        if (data) archive.append(data, { name: `${path}/${name}` });
      };

      add(k.employeePhoto, k.employeePhotoName || "employee_photo.bin", "Employee");
      add(k.signature, k.signatureName || "signature.bin", "Employee");

      add(k.aadhaarFront, k.aadhaarFrontName || "aadhaar_front.bin", "KYC");
      add(k.aadhaarBack, k.aadhaarBackName || "aadhaar_back.bin", "KYC");
      add(k.panFront, k.panFrontName || "pan_front.bin", "KYC");
      add(k.panBack, k.panBackName || "pan_back.bin", "KYC");
      add(k.passportFront, k.passportFrontName || "passport_front.bin", "KYC");
      add(k.passportBack, k.passportBackName || "passport_back.bin", "KYC");
      add(k.dlFront, k.dlFrontName || "dl_front.bin", "KYC");
      add(k.dlBack, k.dlBackName || "dl_back.bin", "KYC");
      add(k.rationCardFront, k.rationCardFrontName || "ration_front.bin", "KYC");
      add(k.rationCardBack, k.rationCardBackName || "ration_back.bin", "KYC");
    }

    /* =====================================================
       FAMILY (FATHER / MOTHER / WIFE / CHILDREN)
    ===================================================== */
    const family = await db.request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT
          relation,
          aadhaarFront, aadhaarFrontName,
          aadhaarBack, aadhaarBackName,
          panFront, panFrontName,
          panBack, panBackName,
          passportPhoto, passportPhotoName
        FROM EmployeeFamily
        WHERE employeeId=@employeeId
      `);

    let childIndex = 1;

    family.recordset.forEach(f => {
      let folder =
        f.relation === "Child"
          ? `Family/Children/Child_${childIndex++}`
          : `Family/${f.relation}`;

      const add = (data, name) => {
        if (data) archive.append(data, { name: `${folder}/${name}` });
      };

      add(f.aadhaarFront, f.aadhaarFrontName || "aadhaar_front.bin");
      add(f.aadhaarBack, f.aadhaarBackName || "aadhaar_back.bin");
      add(f.panFront, f.panFrontName || "pan_front.bin");
      add(f.panBack, f.panBackName || "pan_back.bin");
      add(f.passportPhoto, f.passportPhotoName || "passport_photo.bin");
    });

    /* =====================================================
       BANK
    ===================================================== */
    const bank = await db.request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT bankDocument, bankDocumentName
        FROM EmployeeBank
        WHERE employeeId=@employeeId
      `);

    if (bank.recordset[0]?.bankDocument) {
      archive.append(bank.recordset[0].bankDocument, {
        name: `Bank/${bank.recordset[0].bankDocumentName || "bank_document.bin"}`
      });
    }

    /* =====================================================
       EDUCATION
    ===================================================== */
    const edu = await db.request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT certificate, certificateName
        FROM EmployeeEducation
        WHERE employeeId=@employeeId
      `);

    if (edu.recordset[0]?.certificate) {
      archive.append(edu.recordset[0].certificate, {
        name: `Education/${edu.recordset[0].certificateName || "certificate.bin"}`
      });
    }

    /* =====================================================
       EXPERIENCE
    ===================================================== */
    const exp = await db.request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT
          experienceLetter, experienceLetterName,
          lastPayslip, lastPayslipName,
          relievingLetter, relievingLetterName
        FROM EmployeeExperience
        WHERE employeeId=@employeeId
      `);

    if (exp.recordset[0]) {
      const e = exp.recordset[0];

      if (e.experienceLetter)
        archive.append(e.experienceLetter, {
          name: `Experience/${e.experienceLetterName || "experience_letter.bin"}`
        });

      if (e.lastPayslip)
        archive.append(e.lastPayslip, {
          name: `Experience/${e.lastPayslipName || "last_payslip.bin"}`
        });

      if (e.relievingLetter)
        archive.append(e.relievingLetter, {
          name: `Experience/${e.relievingLetterName || "relieving_letter.bin"}`
        });
    }

    await archive.finalize();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
