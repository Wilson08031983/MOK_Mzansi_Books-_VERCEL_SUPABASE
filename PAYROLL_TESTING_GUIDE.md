# AI Development Prompt: Complete ACTIONS Column Functionality

## Context
Accounting & Finance page Expenses Tab, implement full functionality for the ACTIONS column which currently shows three buttons: Edit (pencil icon), Delete (trash icon), and More Options (three dots "...").

## Task Requirements
Implement complete functionality for all three action buttons in the ACTIONS column of the expenses table, ensuring each button provides the appropriate interface and backend operations.

## Action Button Implementations:

### 1. Edit Button (Pencil Icon) Functionality

#### **Edit Modal Requirements:**
- Open a modal/form when the Edit button is clicked
- Pre-populate the form with existing expense data from the selected row
- Use Apple Sequoia dark theme styling (dark backgrounds, gradients, SF Pro fonts)
- Modal title: "Edit Expense - [Expense ID]" (e.g., "Edit Expense - EXP001")

#### **Form Fields (Pre-filled with current data):**
- **Date**: Date picker with current expense date (e.g., "31/07/2025" format)
- **Description**: Text input with current description (e.g., "exp 1")
- **Amount**: Number input with current amount (e.g., "R500.00")
- **Category**: Dropdown with current category selected (Office Supplies, Transportation, Business Meals, etc.)
- **Project**: Dropdown with current project selected (e.g., "Molantwa Clinic PRJ-2025-081")
- **Payment Method**: Dropdown with current method (Bank Transfer, Personal Card, Company Card, etc.)
- **Submitted By**: Display only field showing "Manual Entry"
- **Submitted Date**: Display only field showing original date
- **Assigned To**: Display only field showing "Current User"

#### **Form Actions:**
- **Save Changes**: Update the expense record in localStorage and refresh table
- **Cancel**: Close modal without saving
- **Reset**: Restore original values if user wants to undo changes

#### **Validation Rules:**
- Date cannot be in the future
- Amount must be greater than 0
- Description is required (minimum 2 characters)
- Category must be selected
- Project assignment is optional

#### **Backend Operations:**
- Update expense record in localStorage
- Maintain expense ID and creation timestamp
- Update modification timestamp
- Preserve receipt status and uploaded files
- Refresh table display immediately after save
- Show success notification: "Expense EXP001 updated successfully"

### 2. Delete Button (Trash Icon) Functionality

#### **Delete Confirmation Modal:**
- Show confirmation dialog before deletion
- Modal styling: Apple Sequoia dark theme with red accent for danger
- Title: "Delete Expense"
- Message: "Are you sure you want to delete this expense? This action cannot be undone."
- Display expense details for confirmation:
  - Expense ID: EXP001
  - Description: exp 1
  - Amount: R500.00
  - Date: 31/07/2025

#### **Confirmation Actions:**
- **Delete**: Permanently remove expense from localStorage
- **Cancel**: Close modal without deleting

#### **Backend Operations:**
- Remove expense record from localStorage
- Update expense summary statistics (total expenses, counts, etc.)
- Remove any associated receipt files
- Update any linked VAT calculations if applicable
- Refresh table display immediately
- Show success notification: "Expense EXP001 deleted successfully"

#### **Safety Measures:**
- Cannot delete expenses with "Attached" receipts without additional confirmation
- Log deletion action with timestamp for audit trail
- Consider soft delete option (mark as deleted but retain data)

### 3. Three Dots (...) More Options Menu

#### **Dropdown Menu Options:**
When the three dots button is clicked, show a dropdown menu with additional actions:

**Menu Items:**
1. **📄 View Receipt** (if receipt status is "Attached")
   - Open modal displaying uploaded receipt image
   - Show receipt metadata (upload date, file size, etc.)
   - Option to download receipt file

2. **📤 Upload Slip** (if receipt status is "Missing")
   - Trigger the same upload functionality as the Details section
   - Open file selection dialog
   - Process OCR and validation

3. **🔄 Replace Receipt** (if receipt status is "Attached" or "Rejected")
   - Allow user to upload a new receipt
   - Replace existing receipt file
   - Re-run validation process

4. **📋 Duplicate Expense**
   - Create a copy of the current expense
   - Open edit modal with pre-filled data
   - Generate new expense ID
   - Set date to today's date

5. **📊 Assign to Project**
   - Quick project assignment without full edit
   - Dropdown with available projects
   - Update project field only

6. **🏷️ Change Category**
   - Quick category change without full edit
   - Dropdown with expense categories
   - Update category field only

7. **📝 Add Notes**
   - Add internal notes/comments to expense
   - Rich text editor for detailed notes
   - Store notes in expense record

8. **📧 Email Receipt**
   - Send expense details via email
   - Include receipt attachment if available
   - Pre-fill email template

#### **Menu Styling:**
- Dark theme dropdown with subtle shadow
- Hover effects on menu items
- Icons next to each menu option (Lucide icons)
- Proper spacing and typography
- Close menu when clicking outside

## Table Integration Requirements:

### **Action Button States:**
- **Default State**: All buttons enabled with standard opacity
- **Hover State**: Slight scale and brightness increase
- **Disabled State**: Reduced opacity for unavailable actions
- **Loading State**: Spinner overlay during processing

### **Contextual Button Behavior:**
- Edit button always available
- Delete button shows warning icon if receipt is attached
- Three dots menu adapts based on receipt status
- Maintain consistent button sizing and spacing

### **Real-time Updates:**
- Table refreshes immediately after any action
- Summary cards update automatically
- Receipt status changes reflected instantly
- Proper error handling with user-friendly messages

## Data Structure Updates (localStorage):

### **Enhanced Expense Object:**
```
expense: {
  id: "EXP001",
  date: "31/07/2025",
  description: "exp 1",
  amount: 500.00,
  category: "Office Supplies",
  project: "Molantwa Clinic PRJ-2025-081",
  paymentMethod: "Bank Transfer",
  submittedBy: "Manual Entry",
  submittedDate: "31/07/2025",
  assignedTo: "Current User",
  receipt: {
    status: "missing" | "attached" | "rejected",
    uploadedFile: base64Image | null,
    uploadDate: timestamp | null,
    extractedAmount: number | null
  },
  notes: string | null,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt: timestamp | null
}
```

### **Action History Logging:**
Track all actions for audit purposes:
```
actionLog: {
  expenseId: "EXP001",
  action: "edit" | "delete" | "upload" | "duplicate",
  timestamp: timestamp,
  userId: "Current User",
  details: object
}
```

## Technical Implementation Requirements:

### **Modal Management:**
- Single modal container with dynamic content
- Proper z-index layering
- Escape key and backdrop click to close
- Focus management for accessibility

### **State Management:**
- Update table state after actions
- Maintain filter and sort preferences
- Handle optimistic updates with rollback on error
- Loading states during processing

### **Error Handling:**
- Network-style errors for localStorage failures
- Validation error display in forms
- User-friendly error messages
- Graceful degradation for missing data

### **Performance Considerations:**
- Lazy load large receipt images
- Debounce rapid action clicks
- Efficient table re-rendering
- Minimize localStorage operations

## Technical Constraints:
- Use localStorage for all data persistence
- Maintain Apple Sequoia dark theme styling
- Use existing component patterns and icons
- Support responsive design for mobile/tablet
- Implement proper TypeScript interfaces if using TypeScript
- Follow existing naming conventions and file structure

## Expected Outcome:
After implementation, users will have complete control over their expense records through the ACTIONS column. They can edit expense details through intuitive forms, safely delete records with proper confirmation, and access additional functionality through the comprehensive three-dots menu. All actions will provide immediate visual feedback, maintain data integrity, and follow the established design patterns of the MOK Mzansi Books platform.