### **Admin Role Hierarchy**

The system recognizes the following roles as administrative, arranged from the highest to the lowest level of authority. Each role is typically entrusted with decision-making powers, access to sensitive company information, and oversight responsibilities, though the scope of authority may vary depending on the organization’s size and structure.

1. **Chief Executive Officer (CEO)** – The highest-ranking executive responsible for the overall vision, strategy, and performance of the company. The CEO makes the final calls on strategic decisions, oversees all departments, represents the company to stakeholders, and ensures that the organization meets its long-term goals.

2. **Managing Director (MD)** – Often interchangeable with CEO in some organizations, the MD focuses on operational oversight and ensuring that strategic plans are effectively implemented. They coordinate between various departments, manage resources, and ensure smooth daily operations.

3. **Director** – A senior executive who may oversee a specific division or function (e.g., Sales Director, Marketing Director, HR Director). Directors are responsible for departmental strategies, budgets, and ensuring their teams deliver on targets.

4. **Founder** – The individual(s) who established the company. While founders may also hold other roles such as CEO or Director, their position carries historical and strategic significance. They often guide the company’s core vision and values, even if they are not involved in daily operations.

5. **General Manager (GM)** – Oversees the daily operations of the business or a specific branch/region. GMs are often tasked with ensuring profitability, managing teams, and enforcing company policies at the operational level.

6. **Operations Manager** – Focuses on process optimization, workflow efficiency, and ensuring that all operational activities are aligned with company goals. They bridge the gap between upper management and frontline teams.

7. **Finance Manager / Chief Financial Officer (CFO)** – Responsible for managing the company’s financial health, budgets, and long-term fiscal strategy. This includes monitoring cash flow, preparing financial reports, ensuring compliance with tax regulations, and advising on investment opportunities.

8. **Bookkeeper** – Handles the accurate recording of financial transactions, maintains ledgers, reconciles accounts, and ensures that financial records are up to date. The bookkeeper works closely with the finance manager or CFO to provide essential financial data for decision-making.

9. **Administrator (Admin)** – Provides critical administrative support across various departments, manages documentation, schedules, correspondence, and assists with operational needs. Admins may also handle certain compliance and reporting tasks depending on the business’s requirements.

# User Management & Security System Implementation Prompt

Implement a comprehensive user management and security system with the following specifications:

## 1. Company Owner/Primary User Configuration

When a user accesses Company Page > Company Details and holds presidency as Company Owner, Partner, or Representative, implement the following:

**Position Field Update**: Restrict and validate user positions to only these high-level roles:
- CEO (Chief Executive Officer)
- Managing Director (MD)
- Director
- Founder
- General Manager (GM)
- Operations Manager
- Finance Manager / CFO (Chief Financial Officer)
- Bookkeeper

**Multi-Table Linking Requirements**: This presidency user must be automatically synchronized and linked across these tables:
- hr-management > Employees Tab > Employee Management Table
- settings > Users Tab > Administrative Users Table

**Security Constraints**: Implement hard restrictions where this presidency user:
- Cannot be deleted from settings Page > Users Tab > Administrative Users Table
- Cannot be edited from settings Page > Users Tab > Administrative Users Table
- Cannot be deleted from hr-management Page > Employees Tab > Employee Management Table
- Cannot be edited from hr-management Page > Employees Tab > Employee Management Table

## 2. Team Management & Invitation System

**Admin User Classification**: When users are invited via Company Page > Team Management, automatically classify users with these positions as Admin Users with full system access:
- CEO (Chief Executive Officer)
- Managing Director (MD)
- Director
- Founder
- General Manager (GM)
- Operations Manager
- Finance Manager / CFO (Chief Financial Officer)
- Bookkeeper

**Staff Member Restrictions**: Users with "Staff Member" position receive limited access with configurable page permissions (View, Edit restrictions).

**Invitation Workflow**: Upon email invitation acceptance:
1. Add user to Team Members Table
2. Automatically link to hr-management Page > Employees Tab > Employee Management Table
3. If Admin User, also add to settings Page > Users Tab > Administrative Users Table

## 3. Universal User Linking

**Cross-Table Synchronization**: Ensure ALL users/employees are linked and available in:
- settings Page > Users Tab > Administrative Users Table (regardless of role level)

## Implementation Requirements

Create automated triggers and validation rules that:
- Enforce position restrictions and classifications
- Maintain data synchronization across all specified tables
- Implement role-based access control with appropriate permissions
- Prevent unauthorized deletion/modification of presidency users
- Handle invitation acceptance workflow with proper table linking
- Ensure referential integrity across all user management tables

Configure the system to maintain these relationships and restrictions at the database level with appropriate foreign key constraints and access control mechanisms.