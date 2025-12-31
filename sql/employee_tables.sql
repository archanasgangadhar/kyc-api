
IF DB_ID('i2v_db') IS NULL
BEGIN
    CREATE DATABASE i2v_db;
END
GO

USE i2v_db;

CREATE TABLE Employees (
    employeeId INT IDENTITY PRIMARY KEY,

    fullName NVARCHAR(100),
    dob DATE,
    gender NVARCHAR(10),
    maritalStatus NVARCHAR(20),
    mobile NVARCHAR(15),
    email NVARCHAR(100),
    bloodGroup NVARCHAR(10),

    currentAddress NVARCHAR(MAX),
    permanentAddress NVARCHAR(MAX),

    createdAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE EmployeeKYC (
    kycId INT IDENTITY PRIMARY KEY,
    employeeId INT,

    aadhaarNumber NVARCHAR(20),
    panNumber NVARCHAR(20),
    passportNumber NVARCHAR(20),
    dlNumber NVARCHAR(30),
    rationCardNumber NVARCHAR(30),

    aadhaarFront VARBINARY(MAX),
    aadhaarBack VARBINARY(MAX),
    panFront VARBINARY(MAX),
    panBack VARBINARY(MAX),
    passportFront VARBINARY(MAX),
    passportBack VARBINARY(MAX),
    dlFront VARBINARY(MAX),
    dlBack VARBINARY(MAX),
    rationCardFront VARBINARY(MAX),
    rationCardBack VARBINARY(MAX),

    employeePhoto VARBINARY(MAX),
    signature VARBINARY(MAX),

    FOREIGN KEY (employeeId) REFERENCES Employees(employeeId)
);


CREATE TABLE EmployeeFamily (
    familyId INT IDENTITY PRIMARY KEY,
    employeeId INT,
    relation NVARCHAR(20),      -- Child
    name NVARCHAR(100),
    dob DATE,

    aadhaarFront VARBINARY(MAX),
    aadhaarBack VARBINARY(MAX),
    passportFront VARBINARY(MAX),
    passportBack VARBINARY(MAX),
    passportPhoto VARBINARY(MAX),

    FOREIGN KEY (employeeId) REFERENCES Employees(employeeId)
);


CREATE TABLE EmployeeBank (
    bankId INT IDENTITY PRIMARY KEY,
    employeeId INT,

    bankName NVARCHAR(100),
    accountHolder NVARCHAR(100),
    accountNumber NVARCHAR(30),
    ifsc NVARCHAR(20),

    bankDocument VARBINARY(MAX),

    uanNumber NVARCHAR(30),
    esiNumber NVARCHAR(30),

    FOREIGN KEY (employeeId) REFERENCES Employees(employeeId)
);


CREATE TABLE EmployeeEducation (
    educationId INT IDENTITY PRIMARY KEY,
    employeeId INT,

    qualification NVARCHAR(100),
    institution NVARCHAR(150),
    passingYear NVARCHAR(10),
    certificate VARBINARY(MAX),

    FOREIGN KEY (employeeId) REFERENCES Employees(employeeId)
);


CREATE TABLE EmployeeExperience (
    experienceId INT IDENTITY PRIMARY KEY,
    employeeId INT,

    totalExperience NVARCHAR(20),
    lastCompany NVARCHAR(150),
    lastDesignation NVARCHAR(100),

    experienceLetter VARBINARY(MAX),
    lastPayslip VARBINARY(MAX),
    relievingLetter VARBINARY(MAX),

    FOREIGN KEY (employeeId) REFERENCES Employees(employeeId)
);


CREATE TABLE EmployeeNominee (
    nomineeId INT IDENTITY PRIMARY KEY,
    employeeId INT,

    nomineeName NVARCHAR(100),
    relationship NVARCHAR(50),
    percentage INT,

    FOREIGN KEY (employeeId) REFERENCES Employees(employeeId)
);

CREATE TABLE EmployeeEmergencyContact (
    contactId INT IDENTITY PRIMARY KEY,
    employeeId INT,

    contactName NVARCHAR(100),
    relationship NVARCHAR(50),
    mobile NVARCHAR(15),

    FOREIGN KEY (employeeId) REFERENCES Employees(employeeId)
);

select * from Employees;


select * from EmployeeKYC;

select * from  EmployeeFamily;

select * from EmployeeBank;

select * from EmployeeEducation;

select * from EmployeeExperience;

select * from EmployeeNominee;

select * from EmployeeEmergencyContact;



ALTER TABLE EmployeeFamily
ADD
    panFront VARBINARY(MAX) NULL,
    panBack VARBINARY(MAX) NULL;


    -- KYC
CREATE UNIQUE INDEX UX_EmployeeKYC_employeeId
ON EmployeeKYC(employeeId);

-- Bank
CREATE UNIQUE INDEX UX_EmployeeBank_employeeId
ON EmployeeBank(employeeId);

-- Education (if only latest matters)
CREATE UNIQUE INDEX UX_EmployeeEducation_employeeId
ON EmployeeEducation(employeeId);

-- Experience (latest company only)
CREATE UNIQUE INDEX UX_EmployeeExperience_employeeId
ON EmployeeExperience(employeeId);

-- Emergency contact
CREATE UNIQUE INDEX UX_EmployeeEmergency_employeeId
ON EmployeeEmergencyContact(employeeId);



