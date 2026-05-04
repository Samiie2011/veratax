# Security Specification for Veratax AI-ERP

## Data Invariants
1. A Contract must belong to a valid Client.
2. A DebtRecord must belong to a valid Contract.
3. A Commission must be linked to a DebtRecord.
4. VaultItems are strictly isolated per Client.
5. Users can only have roles 'admin' or 'staff'.
6. Staff cannot delete any core records (Clients, Contracts, VaultItems).

## The Dirty Dozen Payloads (Rejection Tests)
1. **Identity Theft**: A Staff user attempts to read an AuditLog that doesn't belong to them.
2. **Privilege Escalation**: A Staff user attempts to update their own role to 'admin'.
3. **Ghost Write**: A Staff user attempts to create a Client without being assigned to it in the data.
4. **Data Deletion**: A Staff user attempts to delete a Contract.
5. **Unauthorized Vault Access**: A Staff user attempts to read VaultItems for a Client they are not assigned to.
6. **Price Tampering**: A Staff user attempts to change the `serviceFee` of a Contract after creation.
7. **Role Spoofing**: A user creates a profile with `role: 'admin'` without being in the system admin list.
8. **Invalid ID**: A user attempts to create a record with a 2MB string as an ID.
9. **Timestamp Cheat**: A user provides a past date for `createdAt` instead of using the server timestamp.
10. **Orphaned Debt**: Creating a DebtRecord for a non-existent Contract ID.
11. **Negative Money**: Creating a DebtRecord with a negative `amount`.
12. **Status Shortcut**: A Staff user attempts to set a DebtRecord to 'paid' without proper authorization (if we add checks for that).

## Test Runner Definition (firestore.rules.test.ts)
I will implement a test file that simulates these actions using the Firebase Rules Emulator logic (conceptually).
