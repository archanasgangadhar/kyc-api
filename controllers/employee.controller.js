const sql = require("mssql");
const dbConnect = require("../config/db");

/* =========================
   Helper: VARBINARY binding
========================= */
function bin(files, field) {
  return files[field]?.buffer instanceof Buffer
    ? { type: sql.VarBinary(sql.MAX), value: files[field].buffer }
    : { type: sql.VarBinary(sql.MAX), value: null };
}

function fname(files, field) {
  return files[field]?.originalname || null;
}


exports.submitForm = async (req, res) => {
  try {
    const db = await dbConnect();
    const body = req.body;

    /* =========================
       Collect files
    ========================= */
    const files = {};
    if (req.files) {
      req.files.forEach(f => {
        files[f.fieldname] = {
          buffer: f.buffer,
          originalname: f.originalname
        };
      });
    }

    /* =====================================================
       EMPLOYEE (UPSERT – NO DUPLICATES)
       UNIQUE KEY: mobile
    ===================================================== */
    const empResult = await db.request()
      .input("fullName", sql.NVarChar, body.fullName || null)
      .input("dob", sql.Date, body.dob || null)
      .input("gender", sql.NVarChar, body.gender || null)
      .input("maritalStatus", sql.NVarChar, body.maritalStatus || null)
      .input("mobile", sql.NVarChar, body.mobile || null)
      .input("email", sql.NVarChar, body.email || null)
      .input("bloodGroup", sql.NVarChar, body.bloodGroup || null)
      .input("currentAddress", sql.NVarChar, body.currentAddress || null)
      .input("permanentAddress", sql.NVarChar, body.permanentAddress || null)
      
      .query(`
        IF EXISTS (SELECT 1 FROM Employees WHERE mobile = @mobile)
        BEGIN
          UPDATE Employees SET
            fullName = COALESCE(@fullName, fullName),
            dob = COALESCE(@dob, dob),
            gender = COALESCE(@gender, gender),
            maritalStatus = COALESCE(@maritalStatus, maritalStatus),
            email = COALESCE(@email, email),
            bloodGroup = COALESCE(@bloodGroup, bloodGroup),
            currentAddress = COALESCE(@currentAddress, currentAddress),
            permanentAddress = COALESCE(@permanentAddress, permanentAddress)
          WHERE mobile = @mobile;

          SELECT employeeId FROM Employees WHERE mobile = @mobile;
        END
        ELSE
        BEGIN
          INSERT INTO Employees
          (fullName, dob, gender, maritalStatus, mobile, email, bloodGroup, currentAddress, permanentAddress)
          VALUES
          (@fullName, @dob, @gender, @maritalStatus, @mobile, @email, @bloodGroup, @currentAddress, @permanentAddress);

          SELECT SCOPE_IDENTITY() AS employeeId;
        END
      `);

    const employeeId = empResult.recordset[0].employeeId;

    /* =====================================================
       KYC (UPSERT)
    ===================================================== */
    await db.request()
      .input("employeeId", sql.Int, employeeId)
      .input("aadhaarNumber", sql.NVarChar, body.aadhaarNumber || null)
      .input("panNumber", sql.NVarChar, body.pan || null)
      .input("passportNumber", sql.NVarChar, body.passport || null)
      .input("dlNumber", sql.NVarChar, body.dl || null)
      .input("rationCardNumber", sql.NVarChar, body.rationCard || null)

.input("aadhaarFront", ...Object.values(bin(files, "aadhaarFront")))
.input("aadhaarFrontName", sql.NVarChar, fname(files, "aadhaarFront"))

      .input("aadhaarBack", ...Object.values(bin(files, "aadhaarBack")))
      .input("aadhaarBackName", sql.NVarChar, fname(files, "aadhaarBack"))  

.input("panFront", ...Object.values(bin(files, "panFront")))
.input("panFrontName", sql.NVarChar, fname(files, "panFront"))

.input("panBack", ...Object.values(bin(files, "panBack")))
.input("panBackName", sql.NVarChar, fname(files, "panBack"))

.input("passportFront", ...Object.values(bin(files, "passportFront")))
.input("passportFrontName", sql.NVarChar, fname(files, "passportFront"))

.input("passportBack", ...Object.values(bin(files, "passportBack")))
.input("passportBackName", sql.NVarChar, fname(files, "passportBack"))

.input("dlFront", ...Object.values(bin(files, "dlFront")))
.input("dlFrontName", sql.NVarChar, fname(files, "dlFront"))

.input("dlBack", ...Object.values(bin(files, "dlBack")))
.input("dlBackName", sql.NVarChar, fname(files, "dlBack"))

.input("rationCardFront", ...Object.values(bin(files, "rationCardFront")))
.input("rationCardFrontName", sql.NVarChar, fname(files, "rationCardFront"))

.input("rationCardBack", ...Object.values(bin(files, "rationCardBack")))
.input("rationCardBackName", sql.NVarChar, fname(files, "rationCardBack"))

.input("employeePhoto", ...Object.values(bin(files, "employeePhoto")))
.input("employeePhotoName", sql.NVarChar, fname(files, "employeePhoto"))

.input("signature", ...Object.values(bin(files, "signature")))
.input("signatureName", sql.NVarChar, fname(files, "signature"))

      .query(`
        IF EXISTS (SELECT 1 FROM EmployeeKYC WHERE employeeId=@employeeId)
          UPDATE EmployeeKYC SET
            aadhaarNumber = COALESCE(@aadhaarNumber, aadhaarNumber),
            panNumber = COALESCE(@panNumber, panNumber),
            passportNumber = COALESCE(@passportNumber, passportNumber),
            dlNumber = COALESCE(@dlNumber, dlNumber),
            rationCardNumber = COALESCE(@rationCardNumber, rationCardNumber),
           
            aadhaarFront = COALESCE(@aadhaarFront, aadhaarFront),
            aadhaarBack = COALESCE(@aadhaarBack, aadhaarBack),
            panFront = COALESCE(@panFront, panFront),
            panBack = COALESCE(@panBack, panBack),
            passportFront = COALESCE(@passportFront, passportFront),
            passportBack = COALESCE(@passportBack, passportBack),
            dlFront = COALESCE(@dlFront, dlFront),
            dlBack = COALESCE(@dlBack, dlBack),
            rationCardFront = COALESCE(@rationCardFront, rationCardFront),
            rationCardBack = COALESCE(@rationCardBack, rationCardBack),
            employeePhoto = COALESCE(@employeePhoto, employeePhoto),
            signature = COALESCE(@signature, signature),

            aadhaarFrontName = COALESCE(@aadhaarFrontName, aadhaarFrontName),
            aadhaarBackName  = COALESCE(@aadhaarBackName, aadhaarBackName),
            panFrontName     = COALESCE(@panFrontName, panFrontName),
            panBackName      = COALESCE(@panBackName, panBackName),
            employeePhotoName= COALESCE(@employeePhotoName, employeePhotoName),
            signatureName    = COALESCE(@signatureName, signatureName),
            passportFrontName = COALESCE(@passportFrontName, passportFrontName),
            passportBackName  = COALESCE(@passportBackName, passportBackName),
            dlFrontName       = COALESCE(@dlFrontName, dlFrontName),
            dlBackName        = COALESCE(@dlBackName, dlBackName),
            rationCardFrontName = COALESCE(@rationCardFrontName, rationCardFrontName),
            rationCardBackName  = COALESCE(@rationCardBackName, rationCardBackName)


            
            

          WHERE employeeId=@employeeId
        ELSE
          INSERT INTO EmployeeKYC
          (employeeId, aadhaarNumber, panNumber, passportNumber, dlNumber, rationCardNumber,
           aadhaarFront, aadhaarBack, panFront, panBack, passportFront, passportBack, dlFront, dlBack, rationCardFront, rationCardBack, employeePhoto, signature, aadhaarFrontName, aadhaarBackName, panFrontName, panBackName, employeePhotoName, signatureName, passportFrontName, passportBackName, dlFrontName, dlBackName, rationCardFrontName, rationCardBackName)
          VALUES
          (@employeeId, @aadhaarNumber, @panNumber, @passportNumber, @dlNumber, @rationCardNumber,
           @aadhaarFront, @aadhaarBack, @panFront, @panBack, @passportFront, @passportBack, @dlFront, @dlBack, @rationCardFront, @rationCardBack, @employeePhoto, @signature,
           @aadhaarFrontName,@aadhaarBackName,@panFrontName,@panBackName,@employeePhotoName,@signatureName,@passportFrontName,@passportBackName,@dlFrontName,@dlBackName,@rationCardFrontName,@rationCardBackName)
      `);

    
 /* =====================================================
   FAMILY (Father, Mother, Wife) – WITH IMAGES (UPSERT)
===================================================== */
const familyMembers = [
  { rel: "Father", key: "father", name: body.fatherName, dob: body.fatherDob },
  { rel: "Mother", key: "mother", name: body.motherName, dob: body.motherDob },
  { rel: "Wife",   key: "wife",   name: body.wifeName,   dob: body.wifeDob }
];

for (const f of familyMembers) {
  if (!f.name) continue;

  const r = db.request()
    .input("employeeId", sql.Int, employeeId)
    .input("relation", sql.NVarChar, f.rel)
    .input("name", sql.NVarChar, f.name)
    .input("dob", sql.Date, f.dob || null)

    // Aadhaar
    .input("aadhaarFront", ...Object.values(bin(files, `${f.key}AadhaarFront`)))
    .input("aadhaarBack",  ...Object.values(bin(files, `${f.key}AadhaarBack`)))

    .input("aadhaarFrontName", sql.NVarChar, fname(files, `${f.key}AadhaarFront`))
    .input("aadhaarBackName", sql.NVarChar, fname(files, `${f.key}AadhaarBack`))

    

    



    // Passport photo only (as per HTML)
    .input("passportPhoto", ...Object.values(bin(files, `${f.key}PassportPhoto`)))
    .input("passportPhotoName", sql.NVarChar, fname(files, `${f.key}PassportPhoto`))

  // Father PAN (ONLY father has PAN in HTML)
  if (f.rel === "Father") {
    r.input("panFront", ...Object.values(bin(files, "fatherPanFront")));
    r.input("panBack",  ...Object.values(bin(files, "fatherPanBack")));
    r.input("panFrontName", sql.NVarChar, fname(files, "fatherPanFront"))
    r.input("panBackName", sql.NVarChar, fname(files, "fatherPanBack"))

  }else {
  r.input("panFront", sql.VarBinary(sql.MAX), null);
  r.input("panBack",  sql.VarBinary(sql.MAX), null);
  r.input("panFrontName", sql.NVarChar, null);
  r.input("panBackName", sql.NVarChar, null);
  }

  await r.query(`
    IF EXISTS (
      SELECT 1 FROM EmployeeFamily
      WHERE employeeId=@employeeId AND relation=@relation
    )
    BEGIN
      UPDATE EmployeeFamily SET
        name = COALESCE(@name, name),
        dob = COALESCE(@dob, dob),
        aadhaarFront = COALESCE(@aadhaarFront, aadhaarFront),
        aadhaarBack = COALESCE(@aadhaarBack, aadhaarBack),
        passportPhoto = COALESCE(@passportPhoto, passportPhoto),
        panFront = COALESCE(@panFront, panFront),
        panBack = COALESCE(@panBack, panBack),

        aadhaarFrontName = COALESCE(@aadhaarFrontName, aadhaarFrontName),
        aadhaarBackName = COALESCE(@aadhaarBackName, aadhaarBackName),
        passportPhotoName = COALESCE(@passportPhotoName, passportPhotoName),


        panFrontName = COALESCE(@panFrontName, panFrontName),
        panBackName = COALESCE(@panBackName, panBackName)

      WHERE employeeId=@employeeId AND relation=@relation;
    END
    ELSE
    BEGIN
      INSERT INTO EmployeeFamily
      (
        employeeId, relation, name, dob,
        aadhaarFront, aadhaarBack,
        passportPhoto,
        panFront, panBack,
        panFrontName, panBackName,
        aadhaarFrontName, aadhaarBackName,
        passportPhotoName
      )
      VALUES
      (
        @employeeId, @relation, @name, @dob,
        @aadhaarFront, @aadhaarBack,
        @passportPhoto,
        @panFront, @panBack,
        @panFrontName, @panBackName,
        @aadhaarFrontName, @aadhaarBackName,
        @passportPhotoName
      );
    END
  `);
}


/* =====================================================
   CHILDREN (DYNAMIC + IMAGES + UPSERT)
===================================================== */
let childIndex = 1;

while (body[`childName${childIndex}`]) {

  const r = db.request()
    .input("employeeId", sql.Int, employeeId)
    .input("relation", sql.NVarChar, "Child")
    .input("name", sql.NVarChar, body[`childName${childIndex}`])
    .input("dob", sql.Date, body[`childDob${childIndex}`] || null)

    .input("aadhaarFront", ...Object.values(bin(files, `childAadhaarFront${childIndex}`)))
    .input("aadhaarFrontName", sql.NVarChar, fname(files, `childAadhaarFront${childIndex}`))
    
    .input("aadhaarBack",  ...Object.values(bin(files, `childAadhaarBack${childIndex}`)))
    .input("aadhaarBackName", sql.NVarChar, fname(files, `childAadhaarBack${childIndex}`))
    .input("passportFront", ...Object.values(bin(files, `childPassportFront${childIndex}`)))
    .input("passportFrontName", sql.NVarChar, fname(files, `childPassportFront${childIndex}`))
    .input("passportBack",  ...Object.values(bin(files, `childPassportBack${childIndex}`)))
    .input("passportBackName", sql.NVarChar, fname(files, `childPassportBack${childIndex}`))
    .input("passportPhoto", ...Object.values(bin(files, `childPassportPhoto${childIndex}`)))
    .input("passportPhotoName", sql.NVarChar, fname(files, `childPassportPhoto${childIndex}`))

  await r.query(`
    IF EXISTS (
      SELECT 1 FROM EmployeeFamily
      WHERE employeeId=@employeeId
        AND relation='Child'
        AND name=@name
    )
    BEGIN
      UPDATE EmployeeFamily SET
        dob = COALESCE(@dob, dob),
        aadhaarFront = COALESCE(@aadhaarFront, aadhaarFront),
        aadhaarBack = COALESCE(@aadhaarBack, aadhaarBack),
        passportFront = COALESCE(@passportFront, passportFront),
        passportBack = COALESCE(@passportBack, passportBack),
        passportPhoto = COALESCE(@passportPhoto, passportPhoto),
        aadhaarFrontName = COALESCE(@aadhaarFrontName, aadhaarFrontName),
        aadhaarBackName = COALESCE(@aadhaarBackName, aadhaarBackName),
        passportFrontName = COALESCE(@passportFrontName, passportFrontName),
        passportBackName = COALESCE(@passportBackName, passportBackName),
        passportPhotoName = COALESCE(@passportPhotoName, passportPhotoName)
      WHERE employeeId=@employeeId
        AND relation='Child'
        AND name=@name;
    END
    ELSE
    BEGIN
      INSERT INTO EmployeeFamily
      (
        employeeId, relation, name, dob,
        aadhaarFront, aadhaarBack,
        passportFront, passportBack, passportPhoto,
        aadhaarFrontName, aadhaarBackName,
        passportFrontName, passportBackName, passportPhotoName
      )
      VALUES
      (
        @employeeId, 'Child', @name, @dob,
        @aadhaarFront, @aadhaarBack,
        @passportFront, @passportBack, @passportPhoto,
        @aadhaarFrontName, @aadhaarBackName,
        @passportFrontName, @passportBackName, @passportPhotoName
      );
    END
  `);

  childIndex++;
}


    /* =====================================================
       BANK (UPSERT)
    ===================================================== */
 /* =====================================================
   BANK (UPSERT + DOCUMENT IMAGE/PDF)
===================================================== */
if (body.bankName) {
  await db.request()
    .input("employeeId", sql.Int, employeeId)
    .input("bankName", sql.NVarChar, body.bankName)
    .input("accountHolder", sql.NVarChar, body.accountHolder)
    .input("accountNumber", sql.NVarChar, body.accountNumber)
    .input("ifsc", sql.NVarChar, body.ifsc)
    .input("uanNumber", sql.NVarChar, body.uan)
    .input("esiNumber", sql.NVarChar, body.esi)

    // 👇 THIS WAS THE MISSING PART
    .input("bankDocument", ...Object.values(bin(files, "bankDocument")))
    .input("bankDocumentName", sql.NVarChar, fname(files, "bankDocument"))

    .query(`
      IF EXISTS (SELECT 1 FROM EmployeeBank WHERE employeeId=@employeeId)
      BEGIN
        UPDATE EmployeeBank SET
          bankName = COALESCE(@bankName, bankName),
          accountHolder = COALESCE(@accountHolder, accountHolder),
          accountNumber = COALESCE(@accountNumber, accountNumber),
          ifsc = COALESCE(@ifsc, ifsc),
          bankDocument = COALESCE(@bankDocument, bankDocument),
          uanNumber = COALESCE(@uanNumber, uanNumber),
          esiNumber = COALESCE(@esiNumber, esiNumber),
          bankDocumentName = COALESCE(@bankDocumentName, bankDocumentName)

        WHERE employeeId=@employeeId;
      END
      ELSE
      BEGIN
        INSERT INTO EmployeeBank
        (
          employeeId, bankName, accountHolder,
          accountNumber, ifsc, bankDocument,
          uanNumber, esiNumber,
          bankDocumentName
        )
        VALUES
        (
          @employeeId, @bankName, @accountHolder,
          @accountNumber, @ifsc, @bankDocument,
          @uanNumber, @esiNumber,@bankDocumentName
        );
      END
    `);
}

    /* =====================================================
       EDUCATION (UPSERT)
    ===================================================== */
  /* =====================================================
   EDUCATION (UPSERT + CERTIFICATE IMAGE/PDF)
===================================================== */
if (body.qualification) {
  await db.request()
    .input("employeeId", sql.Int, employeeId)
    .input("qualification", sql.NVarChar, body.qualification)
    .input("institution", sql.NVarChar, body.institution)
    .input("passingYear", sql.NVarChar, body.year)

    // 👇 THIS WAS MISSING
    .input("certificate", ...Object.values(bin(files, "educationCertificate")))
    .input("certificateName", sql.NVarChar, fname(files, "educationCertificate"))

    .query(`
      IF EXISTS (SELECT 1 FROM EmployeeEducation WHERE employeeId=@employeeId)
      BEGIN
        UPDATE EmployeeEducation SET
          qualification = COALESCE(@qualification, qualification),
          institution = COALESCE(@institution, institution),
          passingYear = COALESCE(@passingYear, passingYear),
          certificate = COALESCE(@certificate, certificate),
          certificateName = COALESCE(@certificateName, certificateName)
        WHERE employeeId=@employeeId;
      END
      ELSE
      BEGIN
        INSERT INTO EmployeeEducation
        (
          employeeId, qualification, institution,
          passingYear, certificate, certificateName
        )
        VALUES
        (
          @employeeId, @qualification, @institution,
          @passingYear, @certificate, @certificateName
        );
      END
    `);
}


    /* =====================================================
       EXPERIENCE (UPSERT)
    ===================================================== */
 /* =====================================================
   EXPERIENCE (UPSERT + DOCUMENTS)
===================================================== */
if (body.totalExperience) {
  await db.request()
    .input("employeeId", sql.Int, employeeId)
    .input("totalExperience", sql.NVarChar, body.totalExperience)
    .input("lastCompany", sql.NVarChar, body.lastCompany)
    .input("lastDesignation", sql.NVarChar, body.lastDesignation)

    // 👇 THESE WERE MISSING
    .input("experienceLetter", ...Object.values(bin(files, "experienceLetter")))
    .input("experienceLetterName", sql.NVarChar, fname(files, "experienceLetter"))

    .input("lastPayslip", ...Object.values(bin(files, "lastPayslip")))
    .input("lastPayslipName", sql.NVarChar, fname(files, "lastPayslip"))

    .input("relievingLetter", ...Object.values(bin(files, "relievingLetter")))
    .input("relievingLetterName", sql.NVarChar, fname(files, "relievingLetter"))



    .query(`
      IF EXISTS (SELECT 1 FROM EmployeeExperience WHERE employeeId=@employeeId)
      BEGIN
        UPDATE EmployeeExperience SET
          totalExperience = COALESCE(@totalExperience, totalExperience),
          lastCompany = COALESCE(@lastCompany, lastCompany),
          lastDesignation = COALESCE(@lastDesignation, lastDesignation),
          experienceLetter = COALESCE(@experienceLetter, experienceLetter),
          lastPayslip = COALESCE(@lastPayslip, lastPayslip),
          relievingLetter = COALESCE(@relievingLetter, relievingLetter),

          experienceLetterName = COALESCE(@experienceLetterName, experienceLetterName),
          lastPayslipName = COALESCE(@lastPayslipName, lastPayslipName),
          relievingLetterName = COALESCE(@relievingLetterName, relievingLetterName)
        WHERE employeeId=@employeeId;
      END
      ELSE
      BEGIN
        INSERT INTO EmployeeExperience
        (
          employeeId, totalExperience, lastCompany,
          lastDesignation, experienceLetter,
          lastPayslip, relievingLetter,
          experienceLetterName, lastPayslipName, relievingLetterName

        )
        VALUES
        (
          @employeeId, @totalExperience, @lastCompany,
          @lastDesignation, @experienceLetter,
          @lastPayslip, @relievingLetter,
          @experienceLetterName, @lastPayslipName, @relievingLetterName
        );
      END
    `);
}


/* =====================================================
   NOMINEES (DYNAMIC + NO DUPLICATES)
===================================================== */
let nomineeIndex = 1;

while (body[`nomineeName${nomineeIndex}`]) {

  const nomineeName = body[`nomineeName${nomineeIndex}`];
  const relationship = body[`nomineeRelationship${nomineeIndex}`];
  const percentage = body[`nomineeShare${nomineeIndex}`];

  await db.request()
    .input("employeeId", sql.Int, employeeId)
    .input("nomineeName", sql.NVarChar, nomineeName)
    .input("relationship", sql.NVarChar, relationship)
    .input("percentage", sql.Int, percentage)
    .query(`
      IF EXISTS (
        SELECT 1 FROM EmployeeNominee
        WHERE employeeId=@employeeId
          AND nomineeName=@nomineeName
      )
      BEGIN
        UPDATE EmployeeNominee SET
          relationship = COALESCE(@relationship, relationship),
          percentage = COALESCE(@percentage, percentage)
        WHERE employeeId=@employeeId
          AND nomineeName=@nomineeName;
      END
      ELSE
      BEGIN
        INSERT INTO EmployeeNominee
        (employeeId, nomineeName, relationship, percentage)
        VALUES
        (@employeeId, @nomineeName, @relationship, @percentage);
      END
    `);

  nomineeIndex++;
}


    /* =====================================================
       EMERGENCY CONTACT (UPSERT)
    ===================================================== */
    if (body.emergencyContactName) {
      await db.request()
        .input("employeeId", sql.Int, employeeId)
        .input("contactName", sql.NVarChar, body.emergencyContactName)
        .input("relationship", sql.NVarChar, body.emergencyRelationship)
        .input("mobile", sql.NVarChar, body.emergencyMobile)
        .query(`
          IF EXISTS (SELECT 1 FROM EmployeeEmergencyContact WHERE employeeId=@employeeId)
            UPDATE EmployeeEmergencyContact SET
              contactName = COALESCE(@contactName, contactName),
              relationship = COALESCE(@relationship, relationship),
              mobile = COALESCE(@mobile, mobile)
            WHERE employeeId=@employeeId
          ELSE
            INSERT INTO EmployeeEmergencyContact
            (employeeId, contactName, relationship, mobile)
            VALUES
            (@employeeId, @contactName, @relationship, @mobile)
        `);
    }

    res.json({
      message: "Employee data saved successfully (merged, no duplicates)",
      employeeId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
