# Automated Time & Attendance Calculation Test Cases

## Overview
This document outlines test cases for the automated overtime, night shift, and public holiday calculations implemented for the South African Time & Attendance system.

## Test Cases

### Test Case 1: Regular Weekday Work (8 hours)
- **Date**: 2025-01-15 (Wednesday)
- **Clock In**: 08:00
- **Clock Out**: 17:00
- **Expected Results**:
  - Total Hours: 9h 0m
  - Regular Hours: 8h 0m
  - Overtime Hours: 1h 0m
  - Overtime Rate: 1.5x (Normal)
  - Night Shift Hours: 0h 0m
  - Entry Type: Overtime

### Test Case 2: Night Shift Work
- **Date**: 2025-01-15 (Wednesday)
- **Clock In**: 22:00
- **Clock Out**: 06:00 (next day)
- **Expected Results**:
  - Total Hours: 8h 0m
  - Regular Hours: 8h 0m
  - Overtime Hours: 0h 0m
  - Night Shift Hours: 8h 0m
  - Night Shift Allowance: Applied (10% default)
  - Entry Type: Regular

### Test Case 3: Sunday Work
- **Date**: 2025-01-19 (Sunday)
- **Clock In**: 08:00
- **Clock Out**: 16:00
- **Expected Results**:
  - Total Hours: 8h 0m
  - Regular Hours: 0h 0m
  - Overtime Hours: 8h 0m
  - Overtime Rate: 2.0x (Sunday)
  - Entry Type: Weekend
  - Warning: "Sunday work - double pay rate applied as per BCEA"

### Test Case 4: Public Holiday Work (New Year's Day)
- **Date**: 2025-01-01 (New Year's Day)
- **Clock In**: 09:00
- **Clock Out**: 17:00
- **Expected Results**:
  - Total Hours: 8h 0m
  - Regular Hours: 0h 0m
  - Overtime Hours: 8h 0m
  - Overtime Rate: 2.0x (Public Holiday)
  - Entry Type: Public Holiday
  - Warning: "Work on public holiday (New Year's Day) - double pay rate applied"

### Test Case 5: Saturday Overtime
- **Date**: 2025-01-18 (Saturday)
- **Clock In**: 08:00
- **Clock Out**: 18:00
- **Expected Results**:
  - Total Hours: 10h 0m
  - Regular Hours: 8h 0m
  - Overtime Hours: 2h 0m
  - Overtime Rate: 1.5x (Normal)
  - Entry Type: Weekend
  - Warning: "Weekend work detected - ensure proper authorization and compensation"

### Test Case 6: Night Shift with Overtime
- **Date**: 2025-01-15 (Wednesday)
- **Clock In**: 18:00
- **Clock Out**: 04:00 (next day)
- **Expected Results**:
  - Total Hours: 10h 0m
  - Regular Hours: 8h 0m
  - Overtime Hours: 2h 0m
  - Night Shift Hours: 10h 0m
  - Overtime Rate: 1.5x (Normal)
  - Entry Type: Overtime
  - Warnings: 
    - "Night shift hours detected (10.0h) - allowance applied"

### Test Case 7: Excessive Daily Hours
- **Date**: 2025-01-15 (Wednesday)
- **Clock In**: 06:00
- **Clock Out**: 20:00
- **Expected Results**:
  - Total Hours: 14h 0m
  - Regular Hours: 8h 0m
  - Overtime Hours: 6h 0m
  - Night Shift Hours: 2h 0m (18:00-20:00)
  - Overtime Rate: 1.5x (Normal)
  - Entry Type: Overtime
  - Warnings:
    - "Daily working hours exceed 12 hours - may violate BCEA regulations"
    - "Night shift hours detected (2.0h) - allowance applied"

### Test Case 8: Good Friday (Calculated Holiday)
- **Date**: 2025-04-18 (Good Friday)
- **Clock In**: 08:00
- **Clock Out**: 16:00
- **Expected Results**:
  - Total Hours: 8h 0m
  - Regular Hours: 0h 0m
  - Overtime Hours: 8h 0m
  - Overtime Rate: 2.0x (Public Holiday)
  - Entry Type: Public Holiday
  - Warning: "Work on public holiday (Good Friday) - double pay rate applied"

## Pay Calculation Examples

### Example Employee: John Doe
- **Monthly Salary**: R16,000
- **Hourly Rate**: R100 (R16,000 ÷ 160 hours)

#### Test Case 1 Pay Breakdown:
- Regular Pay: 8h × R100 = R800
- Overtime Pay: 1h × R100 × 1.5 = R150
- Night Shift Allowance: 0h × R100 × 10% = R0
- **Total Pay**: R950

#### Test Case 3 Pay Breakdown (Sunday):
- Regular Pay: 0h × R100 = R0
- Overtime Pay: 8h × R100 × 2.0 = R1,600
- Night Shift Allowance: 0h × R100 × 10% = R0
- **Total Pay**: R1,600

#### Test Case 6 Pay Breakdown (Night Shift + Overtime):
- Regular Pay: 8h × R100 = R800
- Overtime Pay: 2h × R100 × 1.5 = R300
- Night Shift Allowance: 10h × R100 × 10% = R100
- **Total Pay**: R1,200

## Compliance Features

### South African Public Holidays 2025
- New Year's Day: 2025-01-01
- Human Rights Day: 2025-03-21
- Good Friday: 2025-04-18 (calculated)
- Family Day: 2025-04-21 (calculated)
- Freedom Day: 2025-04-27
- Workers' Day: 2025-05-01
- Youth Day: 2025-06-16
- National Women's Day: 2025-08-09
- Heritage Day: 2025-09-24
- Day of Reconciliation: 2025-12-16
- Christmas Day: 2025-12-25
- Day of Goodwill: 2025-12-26

### Overtime Rules
- **Weekdays**: 1.5x rate after 8 hours
- **Saturdays**: 1.5x rate after 8 hours
- **Sundays**: 2.0x rate for all hours
- **Public Holidays**: 2.0x rate for all hours

### Night Shift Rules
- **Hours**: 18:00 to 06:00
- **Allowance**: 10% of hourly rate (configurable)
- **Calculation**: Applies to any hours worked within night shift period

### Compliance Warnings
- Daily hours exceeding 12 hours
- Weekend work notifications
- Public holiday work notifications
- Night shift hour tracking

## UI Features

### Real-time Calculations
- Automatic calculation as user types
- Live updates when date, clock in, or clock out changes
- Employee selection updates hourly rate

### Calculation Breakdown Display
- Hours breakdown (total, regular, overtime, night shift)
- Pay breakdown (when employee selected)
- Overtime rate indication
- Compliance warnings
- Date type badges (weekday, weekend, public holiday)

### Hidden Manual Controls
- Overtime rate dropdown removed (automated)
- Night shift toggle only shows when detected
- Night allowance percentage configurable

## Data Persistence
- All calculations saved to localStorage
- Automatic loading on page refresh
- Maintains calculation history