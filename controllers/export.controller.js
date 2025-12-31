const sql = require("mssql");
const dbConnect = require("../config/db");
const ExcelJS = require("exceljs");

exports.exportAllEmployeesExcel = async (req, res) => {
  try {
    const db = await dbConnect();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Employees");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=employees_complete_export.xlsx"
    );

    sheet.columns = [
      { header: "Employee ID", key: "employeeId", width: 15 },
      { header: "Full Name", key: "fullName", width: 25 },
      { header: "Mobile", key: "mobile", width: 18 },
      { header: "Email", key: "email", width: 30 },
      { header: "Section", key: "section", width: 18 },
      { header: "Relation", key: "relation", width: 15 },
      { header: "Name", key: "name", width: 25 },
      { header: "DOB", key: "dob", width: 15 },
      { header: "Details", key: "details", width: 50 }
    ];

    const employees = await db.request().query(`
      SELECT employeeId, fullName, mobile, email, gender, bloodGroup
      FROM Employees
      ORDER BY employeeId
    `);

    for (const e of employees.recordset) {

      /* ========= EMPLOYEE ========= */
      sheet.addRow({
        employeeId: e.employeeId,
        fullName: e.fullName,
        mobile: e.mobile,
        email: e.email,
        section: "EMPLOYEE",
        details: `Gender: ${e.gender || ""}, Blood: ${e.bloodGroup || ""}`
      });

      /* ========= KYC ========= */
      const kyc = await db.request()
        .input("employeeId", sql.Int, e.employeeId)
        .query(`
          SELECT aadhaarNumber, panNumber, passportNumber, dlNumber, rationCardNumber
          FROM EmployeeKYC WHERE employeeId=@employeeId
        `);

      if (kyc.recordset[0]) {
        const k = kyc.recordset[0];
        sheet.addRow({
          section: "KYC",
          details: `Aadhaar: ${k.aadhaarNumber || ""}, PAN: ${k.panNumber || ""}, Passport: ${k.passportNumber || ""}, DL: ${k.dlNumber || ""}, RN: ${k.rationCardNumber || ""}`
        });
      }

      /* ========= BANK ========= */
      const bank = await db.request()
        .input("employeeId", sql.Int, e.employeeId)
        .query(`
          SELECT bankName, accountNumber, ifsc, uanNumber, esiNumber
          FROM EmployeeBank WHERE employeeId=@employeeId
        `);

      if (bank.recordset[0]) {
        const b = bank.recordset[0];
        sheet.addRow({
          section: "BANK",
          details: `${b.bankName || ""}, AC: ${b.accountNumber || ""}, IFSC: ${b.ifsc || ""}, UAN: ${b.uanNumber || ""}, ESI: ${b.esiNumber || ""}`
        });
      }

      /* ========= EDUCATION ========= */
      const edu = await db.request()
        .input("employeeId", sql.Int, e.employeeId)
        .query(`
          SELECT qualification, institution, passingYear
          FROM EmployeeEducation WHERE employeeId=@employeeId
        `);

      if (edu.recordset[0]) {
        const ed = edu.recordset[0];
        sheet.addRow({
          section: "EDUCATION",
          details: `${ed.qualification || ""} - ${ed.institution || ""} (${ed.passingYear || ""})`
        });
      }

      /* ========= EXPERIENCE ========= */
      const exp = await db.request()
        .input("employeeId", sql.Int, e.employeeId)
        .query(`
          SELECT totalExperience, lastCompany, lastDesignation
          FROM EmployeeExperience WHERE employeeId=@employeeId
        `);

      if (exp.recordset[0]) {
        const x = exp.recordset[0];
        sheet.addRow({
          section: "EXPERIENCE",
          details: `${x.totalExperience || ""} yrs, ${x.lastCompany || ""}, ${x.lastDesignation || ""}`
        });
      }

      /* ========= FAMILY ========= */
      const family = await db.request()
        .input("employeeId", sql.Int, e.employeeId)
        .query(`
          SELECT relation, name, dob
          FROM EmployeeFamily WHERE employeeId=@employeeId
        `);

      family.recordset.forEach(f => {
        sheet.addRow({
          section: "FAMILY",
          relation: f.relation,
          name: f.name,
          dob: f.dob
        });
      });

      /* ========= NOMINEE ========= */
      const nominee = await db.request()
        .input("employeeId", sql.Int, e.employeeId)
        .query(`
          SELECT nomineeName, relationship, percentage
          FROM EmployeeNominee WHERE employeeId=@employeeId
        `);

      nominee.recordset.forEach(n => {
        sheet.addRow({
          section: "NOMINEE",
          relation: n.relationship,
          name: n.nomineeName,
          details: `${n.percentage}%`
        });
      });

      /* ========= EMERGENCY ========= */
      const em = await db.request()
        .input("employeeId", sql.Int, e.employeeId)
        .query(`
          SELECT contactName, relationship, mobile
          FROM EmployeeEmergencyContact WHERE employeeId=@employeeId
        `);

      if (em.recordset[0]) {
        const c = em.recordset[0];
        sheet.addRow({
          section: "EMERGENCY",
          relation: c.relationship,
          name: c.contactName,
          details: c.mobile
        });
      }

      sheet.addRow({}); // spacer
    }

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
