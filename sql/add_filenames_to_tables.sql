-- Add filename columns to EmployeeKYC

use i2v_db;
ALTER TABLE EmployeeKYC
ADD 
    aadhaarFrontName NVARCHAR(255) NULL,
    aadhaarBackName NVARCHAR(255) NULL,
    panFrontName NVARCHAR(255) NULL,
    panBackName NVARCHAR(255) NULL,
    passportFrontName NVARCHAR(255) NULL,
    passportBackName NVARCHAR(255) NULL,
    dlFrontName NVARCHAR(255) NULL,
    dlBackName NVARCHAR(255) NULL,
    rationCardFrontName NVARCHAR(255) NULL,
    rationCardBackName NVARCHAR(255) NULL,
    employeePhotoName NVARCHAR(255) NULL,
    signatureName NVARCHAR(255) NULL;

-- Add filename columns to EmployeeFamily
ALTER TABLE EmployeeFamily
ADD 
    aadhaarFrontName NVARCHAR(255) NULL,
    aadhaarBackName NVARCHAR(255) NULL,
    panFrontName NVARCHAR(255) NULL,
    panBackName NVARCHAR(255) NULL,
    passportFrontName NVARCHAR(255) NULL,
    passportBackName NVARCHAR(255) NULL,
    passportPhotoName NVARCHAR(255) NULL;

-- Add filename column to EmployeeBank
ALTER TABLE EmployeeBank
ADD bankDocumentName NVARCHAR(255) NULL;

-- Add filename column to EmployeeEducation
ALTER TABLE EmployeeEducation
ADD certificateName NVARCHAR(255) NULL;

-- Add filename columns to EmployeeExperience
ALTER TABLE EmployeeExperience
ADD 
    experienceLetterName NVARCHAR(255) NULL,
    lastPayslipName NVARCHAR(255) NULL,
    relievingLetterName NVARCHAR(255) NULL;

DELETE FROM EmployeeEmergencyContact;
DELETE FROM EmployeeNominee;
DELETE FROM EmployeeExperience;
DELETE FROM EmployeeEducation;
DELETE FROM EmployeeBank;
DELETE FROM EmployeeFamily;
DELETE FROM EmployeeKYC;
DELETE FROM Employees;


CREATE UNIQUE INDEX UX_Employees_mobile ON Employees(mobile);


BEGIN TRANSACTION;

SELECT mobile, COUNT(*) AS cnt
FROM Employees
GROUP BY mobile
HAVING COUNT(*) > 1;

;WITH EmpMap AS (
  SELECT
    employeeId,
    mobile,
    MIN(employeeId) OVER (PARTITION BY mobile) AS keepEmployeeId
  FROM Employees
)
SELECT * INTO #EmployeeMap FROM EmpMap;


UPDATE k
SET k.employeeId = m.keepEmployeeId
FROM EmployeeKYC k
JOIN #EmployeeMap m ON k.employeeId = m.employeeId
WHERE m.employeeId <> m.keepEmployeeId;

;WITH EmpMap AS (
  SELECT
    employeeId,
    mobile,
    MIN(employeeId) OVER (PARTITION BY mobile) AS keepEmployeeId
  FROM Employees
)
SELECT * INTO #EmployeeMap FROM EmpMap;

UPDATE k
SET k.employeeId = m.keepEmployeeId
FROM EmployeeKYC k
JOIN #EmployeeMap m ON k.employeeId = m.employeeId
WHERE m.employeeId <> m.keepEmployeeId;






